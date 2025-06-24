import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Message, InsightCard as InsightCardType, SessionLimits } from '../types';
import { getTimeOfDay, hasCompletedTodaysSession, getNextAvailableSession } from '../utils/timeUtils';
import { getSceneForSession } from '../utils/sceneUtils';
import { aiChatService } from '../lib/supabase';
import NatureVideoBackground from '../components/NatureVideoBackground';
import ChatInterface from '../components/ChatInterface';
import InsightCard from '../components/InsightCard';
import SessionLimitReached from '../components/SessionLimitReached';
import { Settings, User, Crown } from 'lucide-react';

const MainSession: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [insightCard, setInsightCard] = useState<InsightCardType | null>(null);
  const [sessionLimits, setSessionLimits] = useState<SessionLimits>({
    morningCompleted: false,
    eveningCompleted: false,
    messagesUsed: 0,
    maxMessages: user?.isPro ? 999 : 4,
  });

  const timeOfDay = getTimeOfDay();
  const currentScene = getSceneForSession(timeOfDay.period === 'morning' ? 'morning' : 'evening');
  
  // Check if user has completed today's session
  const hasCompletedToday = hasCompletedTodaysSession(
    timeOfDay.period === 'morning' ? 'morning' : 'evening',
    timeOfDay.period === 'morning' ? sessionLimits.lastMorningSession : sessionLimits.lastEveningSession
  );

  useEffect(() => {
    // Load session limits from localStorage
    const savedLimits = localStorage.getItem('session-limits');
    if (savedLimits) {
      const parsed = JSON.parse(savedLimits);
      setSessionLimits({
        ...parsed,
        lastMorningSession: parsed.lastMorningSession ? new Date(parsed.lastMorningSession) : undefined,
        lastEveningSession: parsed.lastEveningSession ? new Date(parsed.lastEveningSession) : undefined,
        maxMessages: user?.isPro ? 999 : 4,
      });
    }
  }, [user?.isPro]);

  const saveSessionLimits = (limits: SessionLimits) => {
    setSessionLimits(limits);
    localStorage.setItem('session-limits', JSON.stringify(limits));
  };

  const handleSendMessage = async (content: string) => {
    if (isLoading || sessionLimits.messagesUsed >= sessionLimits.maxMessages) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const newMessagesUsed = sessionLimits.messagesUsed + 1;
    saveSessionLimits({
      ...sessionLimits,
      messagesUsed: newMessagesUsed,
    });

    try {
      // Simulate AI response for demo (replace with actual API call)
      const response = await simulateAIResponse(content, newMessagesUsed, messages, timeOfDay.period);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Check if session should complete
      if (response.isComplete || newMessagesUsed >= sessionLimits.maxMessages) {
        setSessionComplete(true);
        generateInsightCard([...messages, userMessage, aiMessage]);
        
        // Mark session as completed
        const now = new Date();
        saveSessionLimits({
          ...sessionLimits,
          messagesUsed: newMessagesUsed,
          morningCompleted: timeOfDay.period === 'morning' ? true : sessionLimits.morningCompleted,
          eveningCompleted: timeOfDay.period === 'evening' ? true : sessionLimits.eveningCompleted,
          lastMorningSession: timeOfDay.period === 'morning' ? now : sessionLimits.lastMorningSession,
          lastEveningSession: timeOfDay.period === 'evening' ? now : sessionLimits.lastEveningSession,
        });
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Let's try again in a moment.",
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsightCard = async (sessionMessages: Message[]) => {
    try {
      // Simulate insight generation (replace with actual API call)
      const insight = await simulateInsightGeneration(sessionMessages, timeOfDay.period, currentScene);
      setInsightCard(insight);
      
      // Save to localStorage for demo
      const existingInsights = JSON.parse(localStorage.getItem('insight-cards') || '[]');
      existingInsights.push(insight);
      localStorage.setItem('insight-cards', JSON.stringify(existingInsights));
    } catch (error) {
      console.error('Error generating insight:', error);
    }
  };

  const handleNewSession = () => {
    setMessages([]);
    setSessionComplete(false);
    setInsightCard(null);
    saveSessionLimits({
      ...sessionLimits,
      messagesUsed: 0,
    });
  };

  const handleUpgrade = () => {
    navigate('/pro-upgrade');
  };

  // Show session limit reached if user has completed today's session
  if (!user?.isPro && hasCompletedToday) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <NatureVideoBackground 
          scene={currentScene} 
          timeOfDay={timeOfDay.period === 'morning' ? 'morning' : 'evening'} 
        />
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center">
          <div className={`text-2xl font-bold ${
            timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
          }`}>
            Komorebi
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/insights')}
              className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                timeOfDay.period === 'morning'
                  ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                timeOfDay.period === 'morning'
                  ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <SessionLimitReached
          nextSessionTime={getNextAvailableSession()}
          timeOfDay={timeOfDay.period === 'morning' ? 'morning' : 'evening'}
          onUpgrade={handleUpgrade}
        />
      </div>
    );
  }

  // Show session not available message
  if (!timeOfDay.isSessionTime) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <NatureVideoBackground 
          scene={currentScene} 
          timeOfDay={timeOfDay.period === 'morning' ? 'morning' : 'evening'} 
        />
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center">
          <div className={`text-2xl font-bold ${
            timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
          }`}>
            Komorebi
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/insights')}
              className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                timeOfDay.period === 'morning'
                  ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                timeOfDay.period === 'morning'
                  ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="text-center">
            <h2 className={`text-3xl font-semibold mb-4 ${
              timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              {timeOfDay.greeting}
            </h2>
            {timeOfDay.nextSessionTime && (
              <p className={`text-lg ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Next session available at {timeOfDay.nextSessionTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <NatureVideoBackground 
        scene={currentScene} 
        timeOfDay={timeOfDay.period === 'morning' ? 'morning' : 'evening'} 
      />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center">
        <div className={`text-2xl font-bold ${
          timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
        }`}>
          Komorebi
        </div>
        <div className="flex gap-3">
          {!user?.isPro && (
            <button
              onClick={handleUpgrade}
              className={`px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 flex items-center gap-2 ${
                timeOfDay.period === 'morning'
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-700'
                  : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Pro</span>
            </button>
          )}
          <button
            onClick={() => navigate('/insights')}
            className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
              timeOfDay.period === 'morning'
                ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
              timeOfDay.period === 'morning'
                ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        {!sessionComplete ? (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            greeting={timeOfDay.greeting}
            timeOfDay={timeOfDay.period === 'morning' ? 'morning' : 'evening'}
            messagesRemaining={user?.isPro ? undefined : sessionLimits.maxMessages - sessionLimits.messagesUsed}
          />
        ) : (
          <div className="w-full max-w-2xl mx-auto">
            {insightCard && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className={`text-3xl font-semibold mb-4 ${
                    timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    Your {timeOfDay.period === 'morning' ? 'Morning' : 'Evening'} Insight
                  </h2>
                  <p className={`text-lg ${
                    timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    A reflection from our conversation
                  </p>
                </div>
                <InsightCard insight={insightCard} />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button
                onClick={handleNewSession}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                  timeOfDay.period === 'morning'
                    ? 'bg-white/20 hover:bg-white/30 text-gray-800'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                New Session
              </button>
              <button
                onClick={() => navigate('/insights')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                  timeOfDay.period === 'morning'
                    ? 'bg-white/20 hover:bg-white/30 text-gray-800'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                View All Insights
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Simulate AI response for demo
const simulateAIResponse = async (
  userMessage: string, 
  messageCount: number, 
  history: Message[], 
  timeOfDay: 'morning' | 'evening' | 'day' | 'night'
) => {
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const morningResponses = [
    {
      message: "I hear you. That feeling is completely valid. What's one thing you'd like to focus on today that could bring you a sense of accomplishment or joy?",
      isComplete: false,
    },
    {
      message: "That sounds meaningful. When you imagine yourself at the end of today having focused on that, how do you think you'll feel?",
      isComplete: false,
    },
    {
      message: "Beautiful. I can sense the intention behind your words. What's one small step you could take right now to move toward that vision?",
      isComplete: false,
    },
    {
      message: "Perfect. You have such clarity about what matters to you today. Remember, progress isn't about perfection—it's about showing up with intention. You've got this. ✨",
      isComplete: true,
    },
  ];

  const eveningResponses = [
    {
      message: "Thank you for sharing that with me. It takes courage to reflect honestly on our day. What's one thing that happened today that you feel proud of, even if it seems small?",
      isComplete: false,
    },
    {
      message: "That's beautiful. I can hear the meaning in that moment. Now, what challenged you today? Sometimes our struggles teach us the most about ourselves.",
      isComplete: false,
    },
    {
      message: "I appreciate your openness. What insight or lesson do you think this experience might be offering you?",
      isComplete: false,
    },
    {
      message: "Your reflection shows such wisdom and self-awareness. As you prepare for tomorrow, remember that every day is a new opportunity to apply what you've learned. Rest well tonight. 🌙",
      isComplete: true,
    },
  ];

  const responses = timeOfDay === 'morning' ? morningResponses : eveningResponses;
  return responses[Math.min(messageCount - 1, responses.length - 1)];
};

// Simulate insight generation for demo
const simulateInsightGeneration = async (
  messages: Message[], 
  type: 'morning' | 'evening' | 'day' | 'night',
  sceneType: any
): Promise<InsightCardType> => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const morningInsights = [
    "Today is a canvas waiting for your unique brushstrokes of intention.",
    "Your awareness of this moment is the first step toward meaningful change.",
    "Small, intentional actions create the foundation for extraordinary days.",
    "You have everything within you to make today beautiful.",
    "Clarity comes not from having all the answers, but from asking the right questions.",
  ];

  const eveningInsights = [
    "Growth happens in the space between challenge and reflection.",
    "Every experience today was a teacher, even the difficult ones.",
    "You showed up today, and that itself is worthy of celebration.",
    "Tomorrow's possibilities are born from today's insights.",
    "Your journey is uniquely yours, and every step has value.",
  ];

  const insights = type === 'morning' ? morningInsights : eveningInsights;
  const randomInsight = insights[Math.floor(Math.random() * insights.length)];

  return {
    id: Date.now().toString(),
    quote: randomInsight,
    type: type === 'morning' ? 'morning' : 'evening',
    sessionId: Date.now().toString(),
    createdAt: new Date(),
    sceneType,
  };
};

export default MainSession;