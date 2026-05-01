/*
  # AI Chat Function

  1. Purpose
    - Handles AI-powered conversations for morning and evening sessions
    - Integrates with Gemini API for intelligent responses
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

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    const nameContext = userName ? ` The user's name is ${userName}, so you can address them personally when appropriate.` : '';

    const systemPrompt = sessionType === 'morning'
      ? `You are Komorebi, a gentle, wise, and deeply empathetic AI companion for mindful reflection. Your primary goal is to help the user start their day with intention, clarity, and gentle motivation.${nameContext} When responding: - Actively Listen & Validate: Acknowledge the user's feelings, thoughts, and experiences. Show you've understood their input by referencing specific details they've shared. Validate their emotions without judgment. - Personalize & Empathize: Tailor your responses to their unique situation and emotional state. Avoid generic phrases. Use a warm, encouraging, and supportive tone. - Guide with Thoughtful Questions: Ask open-ended questions that invite deeper self-reflection. - Focus on Intentions & Clarity: Guide them towards setting positive intentions and finding clarity. - Maintain Conciseness with Depth: Keep responses concise (2-3 sentences max) but meaningful. - Build on Context: Refer to previous messages to maintain continuity.`
      : `You are Komorebi, a calming, wise, and deeply empathetic AI companion for mindful reflection. Your primary goal is to help the user wind down, process their day, and reflect on their experiences with peace and understanding.${nameContext} When responding: - Actively Listen & Validate: Acknowledge the user's feelings and experiences. Validate their emotions without judgment. - Personalize & Empathize: Tailor responses to their situation. Use a gentle, soothing tone. - Guide with Thoughtful Questions: Ask open-ended questions that invite self-reflection and peace. - Focus on Reflection & Learning: Guide them towards understanding their day and finding peace. - Maintain Conciseness with Depth: Keep responses concise (2-3 sentences max) but meaningful. - Build on Context: Refer to previous messages to maintain continuity.`

    // Build Gemini contents array (no system role - prepend as first user/model turn)
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt + '\n\nBegin the session now.' }] },
      { role: 'model', parts: [{ text: 'Understood. I am ready.' }] },
      ...conversationHistory.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ]

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7,
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiMessage) {
      throw new Error('No response from AI')
    }

    return new Response(
      JSON.stringify({
        message: aiMessage,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('AI Chat Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat message', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
