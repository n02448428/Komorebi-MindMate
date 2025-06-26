import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// AI Chat Service
export const aiChatService = {
  async sendMessage(message: string, sessionType: 'morning' | 'evening', conversationHistory: any[]) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message,
          sessionType,
          conversationHistory,
        },
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('AI Chat Error:', error)
      throw new Error('Failed to get AI response')
    }
  },

  async generateInsightCard(sessionMessages: any[], sessionType: 'morning' | 'evening') {
    try {
      const { data, error } = await supabase.functions.invoke('generate-insight', {
        body: {
          sessionMessages,
          sessionType,
        },
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Insight Generation Error:', error)
      throw new Error('Failed to generate insight card')
    }
  },
}

// Subscription Service
export const subscriptionService = {
  async checkSubscriptionStatus(userId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { userId },
      })

      if (error) throw error
      return data
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
    } catch (error) {
      console.error('Subscription Creation Error:', error)
      throw new Error('Failed to create subscription')
    }
  },
}