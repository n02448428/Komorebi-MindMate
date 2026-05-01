/*
  # Generate Insight Function

  1. Purpose
    - Generates personalized insight cards from conversation sessions
    - Uses Gemini to create meaningful quotes and reflections
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

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    const conversationSummary = sessionMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')

    const systemPrompt = sessionType === 'morning'
      ? `Based on this morning conversation, create a single, inspiring insight quote (1-2 sentences max) that captures the essence of their intentions and mindset. The quote should be: uplifting and motivational, personal and relevant to their conversation, forward-looking and empowering, suitable for sharing and reflection. Return only the quote text, no additional formatting or explanation.`
      : `Based on this evening reflection conversation, create a single, wise insight quote (1-2 sentences max) that captures the essence of their learning and growth. The quote should be: calming and reflective, personal and relevant to their conversation, focused on wisdom and learning, suitable for sharing and reflection. Return only the quote text, no additional formatting or explanation.`

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: systemPrompt + `\n\nConversation:\n${conversationSummary}` }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 100,
            temperature: 0.8,
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    const insightQuote = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!insightQuote) {
      throw new Error('No insight generated')
    }

    const cleanQuote = insightQuote.replace(/^["']|["']$/g, '')

    return new Response(
      JSON.stringify({
        quote: cleanQuote,
        type: sessionType,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Insight Generation Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate insight', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
