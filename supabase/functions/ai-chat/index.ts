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
    console.log('🚀 AI Chat function called');
    const { message, sessionType, conversationHistory, userName }: ChatRequest = await req.json()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('❌ OpenAI API key not configured');
      throw new Error('OpenAI API key not configured')
    }

    const nameContext = userName ? ` The user's name is ${userName}.` : '';
    const systemPrompt = sessionType === 'morning'
      ? `You are a helpful AI assistant having a morning conversation.${nameContext} Be encouraging and help them start their day with intention. Keep responses to 2-3 sentences.`
      : `You are a helpful AI assistant having an evening conversation.${nameContext} Be calming and help them reflect on their day. Keep responses to 2-3 sentences.`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    console.log('📤 Calling OpenAI API');
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

    console.log('✅ AI response generated');
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
    console.error('❌ AI Chat Error:', error)
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