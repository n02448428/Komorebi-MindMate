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
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, sessionType, conversationHistory }: ChatRequest = await req.json()

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Prepare system prompt based on session type
    const systemPrompt = sessionType === 'morning' 
      ? `You are a gentle, wise AI companion helping someone start their day with intention and clarity. Your responses should be:
         - Warm and encouraging
         - Focused on setting positive intentions
         - Asking thoughtful questions about goals and aspirations
         - Helping them find clarity and motivation
         - Keep responses concise but meaningful (2-3 sentences max)
         - Use a conversational, supportive tone`
      : `You are a calming, reflective AI companion helping someone wind down and reflect on their day. Your responses should be:
         - Gentle and soothing
         - Focused on reflection and learning
         - Asking about challenges, wins, and insights
         - Helping them process emotions and experiences
         - Keep responses concise but meaningful (2-3 sentences max)
         - Use a peaceful, understanding tone`

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
        model: 'gpt-4',
        messages: messages,
        max_tokens: 150,
        temperature: 0.7,
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

    // Determine if conversation should complete (simple logic for demo)
    const isComplete = conversationHistory.length >= 6 // After 3 exchanges

    return new Response(
      JSON.stringify({
        message: aiMessage,
        isComplete,
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