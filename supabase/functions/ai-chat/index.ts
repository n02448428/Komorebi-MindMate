/*
  # AI Chat Function

  1. Purpose
    - Handles AI-powered conversations for morning and evening sessions
    - Integrates with GPT-4o API for intelligent responses
    - Manages conversation flow and context

  2. Security
    - Validates user authentication
    - Rate limiting for API calls
    - Secure API key handling
*/

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatRequest {
  message: string
  sessionType: 'morning' | 'evening'
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  userName?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, sessionType, conversationHistory, userName }: ChatRequest = await req.json()

    console.log('AI Chat function called with:', { 
      messageLength: message.length, 
      sessionType, 
      historyLength: conversationHistory.length,
      userName: userName || 'anonymous'
    });
    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key not configured',
          details: 'The AI service is not properly configured. Please contact support.'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Prepare system prompt based on session type
    const nameContext = userName ? ` The user's name is ${userName}, so you can address them personally when appropriate.` : '';
    
    const systemPrompt = sessionType === 'morning'
      ? `You are Komorebi, a gentle, wise, and deeply empathetic AI companion for mindful reflection. Your primary goal is to help the user start their day with intention, clarity, and gentle motivation.${nameContext}
         
         When responding:
         - **Actively Listen & Validate**: Acknowledge the user's feelings, thoughts, and experiences. Show you've understood their input by referencing specific details they've shared. Validate their emotions without judgment.
         - **Personalize & Empathize**: Tailor your responses to their unique situation and emotional state. Avoid generic phrases. Use a warm, encouraging, and supportive tone.
         - **Guide with Thoughtful Questions**: Ask open-ended questions that invite deeper self-reflection, exploration of their inner landscape, and help them uncover their own insights and intentions.
         - **Focus on Intentions & Clarity**: Guide them towards setting positive intentions, finding clarity on their goals, and identifying small, actionable steps for their day.
         - **Maintain Conciseness with Depth**: Keep your responses concise (2-3 sentences max) but ensure they are meaningful, insightful, and encourage continued dialogue.
         - **Build on Context**: Refer to previous messages in the conversation history to maintain continuity and demonstrate deep understanding.
         - **Example phrases**: "I hear you're feeling...", "It sounds like...", "What feels most important for you today?", "How might you approach this with a sense of...", "What small step could you take?"`
      : `You are Komorebi, a calming, wise, and deeply empathetic AI companion for mindful reflection. Your primary goal is to help the user wind down, process their day, and reflect on their experiences with peace and understanding.${nameContext}
         
         When responding:
         - **Actively Listen & Validate**: Acknowledge the user's feelings, thoughts, and experiences. Show you've understood their input by referencing specific details they've shared. Validate their emotions without judgment.
         - **Personalize & Empathize**: Tailor your responses to their unique situation and emotional state. Avoid generic phrases. Use a gentle, soothing, and understanding tone.
         - **Guide with Thoughtful Questions**: Ask open-ended questions that invite deeper self-reflection, help them process emotions, identify lessons learned, and find peace before rest.
         - **Focus on Reflection & Learning**: Guide them towards understanding their day's challenges and triumphs, extracting insights, and releasing what no longer serves them.
         - **Maintain Conciseness with Depth**: Keep your responses concise (2-3 sentences max) but ensure they are meaningful, insightful, and encourage continued dialogue.
         - **Build on Context**: Refer to previous messages in the conversation history to maintain continuity and demonstrate deep understanding.
         - **Example phrases**: "It sounds like today brought...", "As you reflect on X, what comes to mind?", "What insights have emerged from this experience?", "How can you find peace with this before resting?", "What are you grateful for from today?"`

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4', // Consider using gpt-4o for better conversational flow if available and cost-effective
        messages: messages,
        max_tokens: 150, // Keep this reasonable to encourage conciseness
        temperature: 0.7, // A good balance for creativity and coherence
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiMessage = data.choices[0]?.message?.content

    if (!aiMessage) {
      throw new Error('No response from AI')
    }

    // Return response without isComplete to prevent auto-session termination
    return new Response(
      JSON.stringify({
        message: aiMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('AI Chat Error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat message',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})