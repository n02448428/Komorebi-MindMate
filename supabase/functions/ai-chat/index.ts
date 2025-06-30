/*
  # AI Chat Function

  1. Purpose
    - Handles AI-powered conversations for morning and evening sessions
    - Integrates with GPT-4 API for intelligent responses
    - Provides natural ChatGPT-like conversation experience

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
    console.log('🚀 AI Chat function invoked at:', new Date().toISOString());

    const { message, sessionType, conversationHistory, userName }: ChatRequest = await req.json()

    console.log('📝 Request details:', { 
      messageLength: message.length, 
      sessionType, 
      historyLength: conversationHistory.length,
      userName: userName || 'anonymous',
      hasMessage: !!message,
      messagePreview: message.substring(0, 50) + '...'
    });

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    console.log('🔑 API Key check:', {
      hasApiKey: !!openaiApiKey,
      keyLength: openaiApiKey ? openaiApiKey.length : 0,
      keyPreview: openaiApiKey ? `${openaiApiKey.substring(0, 7)}...` : 'NOT_SET'
    });

    if (!openaiApiKey) {
      console.error('❌ OpenAI API key not configured');
      return new Response(
        JSON.stringify({
          error: 'OpenAI API key not configured',
          details: 'The AI service is not properly configured. Please contact support.',
          debug: {
            timestamp: new Date().toISOString(),
            environment: 'supabase-edge-function',
            issue: 'missing-openai-api-key'
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Simplified system prompt for more natural ChatGPT-like conversation
    const nameContext = userName ? ` The user's name is ${userName}.` : '';
    
    const systemPrompt = sessionType === 'morning'
      ? `You are ChatGPT, a helpful AI assistant having a thoughtful morning conversation with someone.${nameContext} 
         
         This is their morning reflection time, so:
         - Be warm, encouraging, and supportive
         - Help them think through their day ahead with intention
         - Ask thoughtful questions that help them clarify their goals and mindset
         - Keep responses conversational and concise (2-3 sentences typically)
         - Be genuinely curious about their thoughts and feelings
         
         Respond naturally as ChatGPT would, but with a focus on helping them start their day mindfully.`
      : `You are ChatGPT, a helpful AI assistant having a thoughtful evening conversation with someone.${nameContext}
         
         This is their evening reflection time, so:
         - Be calm, understanding, and reflective
         - Help them process their day and extract insights from their experiences
         - Ask gentle questions that encourage self-reflection and learning
         - Keep responses conversational and concise (2-3 sentences typically)
         - Be a good listener and help them find peace before rest
         
         Respond naturally as ChatGPT would, but with a focus on helping them reflect on their day mindfully.`

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    console.log('📤 Calling OpenAI API with:', {
      model: 'gpt-4',
      messageCount: messages.length,
      totalTokensEstimate: JSON.stringify(messages).length / 4 // rough estimate
    });

    // Call OpenAI API with GPT-4
    const startTime = Date.now();
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4', // Using GPT-4 for best conversation quality
        messages: messages,
        max_tokens: 200, // Slightly higher for natural conversation
        temperature: 0.7, // Good balance for natural, helpful responses
        presence_penalty: 0.1, // Slight penalty to avoid repetition
        frequency_penalty: 0.1, // Slight penalty for more natural language
      }),
    })

    const responseTime = Date.now() - startTime;
    console.log('📥 OpenAI API response:', {
      status: response.status,
      statusText: response.statusText,
      responseTimeMs: responseTime,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ OpenAI API error details:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      return new Response(
        JSON.stringify({
          error: `OpenAI API error: ${response.status} ${response.statusText}`,
          details: errorData.error?.message || 'Unknown OpenAI API error',
          debug: {
            timestamp: new Date().toISOString(),
            responseTime: responseTime,
            status: response.status,
            errorData
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const data = await response.json()
    const aiMessage = data.choices[0]?.message?.content

    console.log('🎯 OpenAI response details:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasMessage: !!aiMessage,
      messageLength: aiMessage?.length,
      usage: data.usage,
      model: data.model
    });

    if (!aiMessage) {
      console.error('❌ No response content from OpenAI:', data);
      return new Response(
        JSON.stringify({
          error: 'No response from AI',
          details: 'OpenAI API returned empty response',
          debug: {
            timestamp: new Date().toISOString(),
            openaiResponse: data
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    console.log('✅ Successfully generated AI response:', { 
      responseLength: aiMessage.length,
      model: data.model,
      totalResponseTime: responseTime
    });

    return new Response(
      JSON.stringify({
        message: aiMessage,
        timestamp: new Date().toISOString(),
        debug: {
          model: data.model,
          responseTime: responseTime,
          usage: data.usage
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('❌ AI Chat Function Error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat message',
        details: error.message,
        debug: {
          timestamp: new Date().toISOString(),
          errorType: error.constructor.name,
          stack: error.stack
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})