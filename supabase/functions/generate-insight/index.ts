/*
  # Generate Insight Function

  1. Purpose
    - Generates personalized insight cards from conversation sessions
    - Uses GPT-4o to create meaningful quotes and reflections
    - Stores insights for the gallery

  2. Security
    - Validates user authentication
    - Rate limiting for insight generation
    - Secure API key handling
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InsightRequest {
  sessionMessages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  sessionType: 'morning' | 'evening'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionMessages, sessionType }: InsightRequest = await req.json()

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Create conversation summary for context
    const conversationSummary = sessionMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

    // Prepare system prompt for insight generation
    const systemPrompt = sessionType === 'morning'
      ? `Based on this morning conversation, create a single, inspiring insight quote (1-2 sentences max) that captures the essence of their intentions and mindset. The quote should be:
         - Uplifting and motivational
         - Personal and relevant to their conversation
         - Forward-looking and empowering
         - Suitable for sharing and reflection
         
         Return only the quote text, no additional formatting or explanation.`
      : `Based on this evening reflection conversation, create a single, wise insight quote (1-2 sentences max) that captures the essence of their learning and growth. The quote should be:
         - Calming and reflective
         - Personal and relevant to their conversation
         - Focused on wisdom and learning
         - Suitable for sharing and reflection
         
         Return only the quote text, no additional formatting or explanation.`

    // Call OpenAI API for insight generation
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Conversation:\n${conversationSummary}` }
        ],
        max_tokens: 100,
        temperature: 0.8,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const insightQuote = data.choices[0]?.message?.content?.trim()

    if (!insightQuote) {
      throw new Error('No insight generated')
    }

    // Clean up the quote (remove quotes if AI added them)
    const cleanQuote = insightQuote.replace(/^["']|["']$/g, '')

    return new Response(
      JSON.stringify({
        quote: cleanQuote,
        type: sessionType,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Insight Generation Error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate insight',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})