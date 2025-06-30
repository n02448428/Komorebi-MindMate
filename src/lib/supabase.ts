import { createClient } from '@supabase/supabase-js'

// Using direct URLs for faster initialization and error prevention
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eeqpvvkxttsqyfunsibb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcXB2dmt4dHRzcXlmdW5zaWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3ODQ0MjQsImV4cCI6MjA2NjM2MDQyNH0.3W25cdLQSgeQv4ekrZmAitia1aIjJQSorrcAAUVWJiI'

// Create Supabase client with better retries
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true },
  global: { fetch: fetch.bind(globalThis) }
})

// AI Chat Service
export const aiChatService = {
  async sendMessage(message: string, sessionType: 'morning' | 'evening', conversationHistory: any[], userName?: string) {
    console.log('🤖 [AI Service] Starting request:', { 
      messageLength: message.length, 
      sessionType, 
      historyLength: conversationHistory.length, 
      userName: userName || 'anonymous' 
    });
    
    try {
      console.log('🌐 [AI Service] Attempting Supabase function call...');
      
      // Create a timeout for the function call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000);
      });
      
      // Race the function call against timeout
      const functionCall = supabase.functions.invoke('ai-chat', {
        body: {
          message,
          sessionType,
          conversationHistory,
          userName: userName || undefined,
        },
      });
      
      const { data, error } = await Promise.race([functionCall, timeoutPromise]);

      if (error) {
        console.error('❌ [AI Service] Supabase function error:', error);
        // If Supabase function fails, use local fallback
        console.warn('🔄 [AI Service] Using local fallback due to error');
        return this.getLocalAIResponse(message, sessionType, conversationHistory, userName);
      }
      
      console.log('✅ [AI Service] Supabase response received:', data);
      
      // Validate response
      if (!data || !data.message) {
        console.warn('⚠️ [AI Service] Invalid response format, using fallback:', data);
        return this.getLocalAIResponse(message, sessionType, conversationHistory, userName);
      }
      
      return data;
    } catch (error) {
      console.error('❌ [AI Service] Complete failure:', error);
      console.warn('🔄 [AI Service] Using local fallback due to exception');
      return this.getLocalAIResponse(message, sessionType, conversationHistory, userName);
    }
  },

  // Local fallback AI response system
  getLocalAIResponse(message: string, sessionType: 'morning' | 'evening', conversationHistory: any[], userName?: string) {
    console.log('🏠 [Local AI] Generating response:', { 
      messageLength: message.length, 
      sessionType, 
      userName: userName || 'anonymous' 
    });
    
    const messageText = message.toLowerCase();
    const nameContext = userName ? ` ${userName}` : '';
    
    // Analyze conversation context
    let response = '';
    
    if (sessionType === 'morning') {
      if (messageText.includes('tired') || messageText.includes('sleepy') || messageText.includes('exhausted')) {
        response = `I hear that you're feeling tired${nameContext}. Sometimes our bodies are telling us something important. What would help you feel more energized as you start this day?`;
      } else if (messageText.includes('excited') || messageText.includes('good') || messageText.includes('great')) {
        response = `That positive energy is wonderful${nameContext}! What's contributing to these good feelings today?`;
      } else if (messageText.includes('anxious') || messageText.includes('worried') || messageText.includes('nervous')) {
        response = `Thank you for sharing that with me${nameContext}. Anxiety often carries important information. What feels most helpful to focus on right now?`;
      } else if (messageText.includes('work') || messageText.includes('job') || messageText.includes('meeting')) {
        response = `Work can bring both opportunities and challenges${nameContext}. What intentions would you like to set for how you approach your work today?`;
      } else if (messageText.includes('goal') || messageText.includes('plan') || messageText.includes('want to')) {
        response = `I love that you're thinking about what you want to create today${nameContext}. What feels most important to you right now?`;
      } else {
        const morningResponses = [
          `Thank you for sharing that${nameContext}. As you look at this new day, what feels most alive for you?`,
          `I appreciate you taking time to reflect${nameContext}. What would make today feel meaningful?`,
          `That's really important${nameContext}. How do you want to carry this awareness forward today?`,
          `I hear you${nameContext}. What intention would you like to set as you begin this day?`,
          `Thank you for being here${nameContext}. What's calling for your attention today?`
        ];
        response = morningResponses[Math.floor(Math.random() * morningResponses.length)];
      }
    } else {
      // Evening responses
      if (messageText.includes('tired') || messageText.includes('exhausted') || messageText.includes('drained')) {
        response = `It sounds like today asked a lot of you${nameContext}. How can you honor what you've given today?`;
      } else if (messageText.includes('good') || messageText.includes('proud') || messageText.includes('accomplished')) {
        response = `I can feel the satisfaction in your words${nameContext}. What about today feels most meaningful to you?`;
      } else if (messageText.includes('difficult') || messageText.includes('hard') || messageText.includes('challenging')) {
        response = `Difficult days can teach us so much${nameContext}. As you look back, what wisdom is emerging from today's experiences?`;
      } else if (messageText.includes('grateful') || messageText.includes('thankful') || messageText.includes('appreciate')) {
        response = `Gratitude has such a beautiful way of shifting our perspective${nameContext}. What else are you noticing as you reflect?`;
      } else if (messageText.includes('tomorrow') || messageText.includes('next') || messageText.includes('plan')) {
        response = `It's natural to think ahead${nameContext}. Before we look forward, what do you want to acknowledge about today?`;
      } else {
        const eveningResponses = [
          `Thank you for bringing that reflection here${nameContext}. What are you learning about yourself today?`,
          `I appreciate your honesty${nameContext}. As you sit with today's experiences, what emerges?`,
          `That's really valuable to notice${nameContext}. How are you making sense of what happened today?`,
          `I hear you${nameContext}. What feels important to acknowledge before you rest?`,
          `Thank you for sharing that${nameContext}. What insight is this experience offering you?`
        ];
        response = eveningResponses[Math.floor(Math.random() * eveningResponses.length)];
      }
    }
    
    const responseData = {
      message: response,
      timestamp: new Date().toISOString(),
      source: 'local_fallback'
    };
    
    console.log('🏠 [Local AI] Response generated:', responseData);
    return responseData;
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