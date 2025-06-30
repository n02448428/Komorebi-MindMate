import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eeqpvvkxttsqyfunsibb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcXB2dmt4dHRzcXlmdW5zaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODQ0MjQsImV4cCI6MjA2NjM2MDQyNH0.3W25cdLQSgeQv4ekrZmAitia1aIjJQSorrcAAUVWJiI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true },
  global: { fetch: fetch.bind(globalThis) }
})

export const aiChatService = {
  async sendMessage(message: string, sessionType: 'morning' | 'evening', conversationHistory: any[], userName?: string) {
    console.log('🤖 AI Service called');
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message,
          sessionType,
          conversationHistory,
          userName: userName || undefined,
        },
      })

      if (error) {
        console.error('❌ Supabase function error:', error);
        return this.getLocalAIResponse(message, sessionType, conversationHistory, userName);
      }
      
      console.log('✅ AI response received');
      return data
    } catch (error) {
      console.error('❌ AI Chat Service Error:', error);
      return this.getLocalAIResponse(message, sessionType, conversationHistory, userName);
    }
  },

  getLocalAIResponse(message: string, sessionType: 'morning' | 'evening', conversationHistory: any[], userName?: string) {
    const nameContext = userName ? ` ${userName}` : '';
    
    if (sessionType === 'morning') {
      const responses = [
        `Thank you for sharing that${nameContext}. What feels most important to you today?`,
        `I hear you${nameContext}. How would you like to approach this day?`,
        `That's meaningful${nameContext}. What intention would you like to set?`
      ];
      return {
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString()
      };
    } else {
      const responses = [
        `Thank you for reflecting on that${nameContext}. What insights emerge for you?`,
        `I appreciate you sharing that${nameContext}. How are you making sense of this?`,
        `That's important to acknowledge${nameContext}. What wisdom do you take from today?`
      ];
      return {
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString()
      };
    }
  },

  async generateInsightCard(sessionMessages: any[], sessionType: 'morning' | 'evening') {
    try {
      const { data, error } = await supabase.functions.invoke('generate-insight', {
        body: { sessionMessages, sessionType },
      })
      if (error) throw error
      return data
    } catch (error) {
      console.error('Insight Generation Error:', error)
      throw new Error('Failed to generate insight card')
    }
  },
}

export const subscriptionService = {
  async checkSubscriptionStatus(userId: string) {
    try {
      const { data, error } = await supabase.functions.invoke(
        'check-subscription',
        { body: { userId } }
      )
      return error ? { isPro: false, status: 'inactive' } : data
    } catch (error) {
      console.error('Subscription Check Error:', error)
      return { isPro: false, status: 'inactive' }
    }
  },

  async createSubscription(userId: string, planId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('create-subscription', {
        body: { userId, planId },
      })
      if (error) throw error
      return data
    } 
    catch (error) {
      console.error('Subscription Creation Error:', error)
      throw new Error('Failed to create subscription')
    }
  },
}