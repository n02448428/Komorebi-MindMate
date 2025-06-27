import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Message, InsightCard as InsightCardType, SessionLimits, NatureScene } from '../types';
import { getTimeOfDay, hasCompletedTodaysSession, getNextAvailableSession, getSessionTimeLimit } from '../utils/timeUtils';
import { getSceneForSession, getNextScene, getSceneDisplayName, getAllScenesForSession } from '../utils/sceneUtils';
import NatureVideoBackground from '../components/NatureVideoBackground';
import ChatInterface from '../components/ChatInterface';
import InsightCard from '../components/InsightCard';
import SessionLimitReached from '../components/SessionLimitReached';
import { Settings, User, Crown, LogIn, SkipForward, Eye, EyeOff, Shuffle } from 'lucide-react';

const MainSession: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [insightCard, setInsightCard] = useState<InsightCardType | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentScene, setCurrentScene] = useState<NatureScene>('ocean');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [sessionLimits, setSessionLimits] = useState<SessionLimits>({
    morningCompleted: false,
    eveningCompleted: false,
    messagesUsed: 0,
    maxMessages: user?.isPro ? 999 : 4,
  });

  const timeOfDay = getTimeOfDay();
  const sessionTimeLimit = getSessionTimeLimit(user?.isPro || false);
  
  // Determine which session type to use based on time
  const sessionType = timeOfDay.period === 'morning' ? 'morning' : 'evening';
  
  // Check if user has completed BOTH sessions today (only block if both are done)
  const hasCompletedBothToday = user ? (
    hasCompletedTodaysSession('morning', sessionLimits.lastMorningSession) &&
    hasCompletedTodaysSession('evening', sessionLimits.lastEveningSession)
  ) : false;

  // Check if session time has expired
  const isSessionExpired = sessionStartTime && 
    (new Date().getTime() - sessionStartTime.getTime()) > (sessionTimeLimit * 60 * 1000);

  useEffect(() => {
    // Load settings from localStorage
    const savedVideoEnabled = localStorage.getItem('video-background-enabled');
    if (savedVideoEnabled !== null) {
      setVideoEnabled(JSON.parse(savedVideoEnabled));
    }

    const savedScene = localStorage.getItem('current-scene') as NatureScene;
    if (savedScene) {
      setCurrentScene(savedScene);
    } else {
      // Set initial scene based on session type
      const initialScene = getSceneForSession(sessionType);
      setCurrentScene(initialScene);
      localStorage.setItem('current-scene', initialScene);
    }

    // Load session limits from localStorage only if user is logged in
    if (user) {
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
    } else {
      // Reset session limits for non-logged in users
      setSessionLimits({
        morningCompleted: false,
        eveningCompleted: false,
        messagesUsed: 0,
        maxMessages: 4,
      });
    }

    // Load session start time
    const savedStartTime = localStorage.getItem('session-start-time');
    if (savedStartTime) {
      setSessionStartTime(new Date(savedStartTime));
    }
  }, [user?.isPro, user, sessionType]);

  useEffect(() => {
    // Auto-start session if conditions are met
    if (timeOfDay.shouldAutoStart && !sessionStartTime && !hasCompletedBothToday && !isSessionExpired) {
      const startTime = new Date();
      setSessionStartTime(startTime);
      // Store session start time
      localStorage.setItem('session-start-time', startTime.toISOString());
    }
  }, [timeOfDay.shouldAutoStart, sessionStartTime, hasCompletedBothToday, isSessionExpired]);

  const saveSessionLimits = (limits: SessionLimits) => {
    setSessionLimits(limits);
    // Only save to localStorage if user is logged in
    if (user) {
      localStorage.setItem('session-limits', JSON.stringify(limits));
    }
  };

  const handleNextScene = () => {
    const nextScene = getNextScene(currentScene, sessionType);
    setCurrentScene(nextScene);
    localStorage.setItem('current-scene', nextScene);
  };

  const handleRandomScene = () => {
    const availableScenes = getAllScenesForSession(sessionType);
    const otherScenes = availableScenes.filter(scene => scene !== currentScene);
    const randomScene = otherScenes[Math.floor(Math.random() * otherScenes.length)];
    setCurrentScene(randomScene);
    localStorage.setItem('current-scene', randomScene);
  };

  const toggleVideoBackground = () => {
    const newVideoEnabled = !videoEnabled;
    setVideoEnabled(newVideoEnabled);
    localStorage.setItem('video-background-enabled', JSON.stringify(newVideoEnabled));
  };

  const handleSendMessage = async (content: string) => {
    if (isLoading || sessionLimits.messagesUsed >= sessionLimits.maxMessages || isSessionExpired) return;

    // Start session timer if not already started
    if (!sessionStartTime) {
      const startTime = new Date();
      setSessionStartTime(startTime);
      localStorage.setItem('session-start-time', startTime.toISOString());
    }

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
      // Use dynamic AI response system
      const response = await generateDynamicAIResponse(content, newMessagesUsed, messages, sessionType);
      
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
        
        // Mark session as completed only if user is logged in
        if (user) {
          const now = new Date();
          saveSessionLimits({
            ...sessionLimits,
            messagesUsed: newMessagesUsed,
            morningCompleted: sessionType === 'morning' ? true : sessionLimits.morningCompleted,
            eveningCompleted: sessionType === 'evening' ? true : sessionLimits.eveningCompleted,
            lastMorningSession: sessionType === 'morning' ? now : sessionLimits.lastMorningSession,
            lastEveningSession: sessionType === 'evening' ? now : sessionLimits.lastEveningSession,
          });
        }
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
      const insight = await simulateInsightGeneration(sessionMessages, sessionType, currentScene);
      setInsightCard(insight);
      
      // Only save to localStorage if user is logged in
      if (user) {
        const existingInsights = JSON.parse(localStorage.getItem('insight-cards') || '[]');
        existingInsights.push(insight);
        localStorage.setItem('insight-cards', JSON.stringify(existingInsights));
      }
    } catch (error) {
      console.error('Error generating insight:', error);
    }
  };

  const handleNewSession = () => {
    setMessages([]);
    setSessionComplete(false);
    setInsightCard(null);
    const startTime = new Date();
    setSessionStartTime(startTime);
    localStorage.setItem('session-start-time', startTime.toISOString());
    saveSessionLimits({
      ...sessionLimits,
      messagesUsed: 0,
    });
  };

  const handleUpgrade = () => {
    navigate('/pro-upgrade');
  };

  const handleLogin = () => {
    navigate('/');
  };

  const handleInsights = () => {
    navigate('/insights');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  // Show session limit reached only if user has completed BOTH sessions today (for non-Pro users)
  if (user && !user.isPro && hasCompletedBothToday) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {videoEnabled && (
          <NatureVideoBackground 
            scene={currentScene} 
            timeOfDay={sessionType} 
          />
        )}
        {!videoEnabled && (
          <div className={`absolute inset-0 bg-gradient-to-br ${
            sessionType === 'morning' 
              ? 'from-amber-100 via-orange-50 to-yellow-100'
              : 'from-indigo-900 via-purple-900 to-blue-900'
          }`} />
        )}
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
          <div className={`text-2xl font-bold ${
            sessionType === 'morning' ? 'text-gray-800' : 'text-white'
          }`}>
            Komorebi
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleInsights}
              className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                sessionType === 'morning'
                  ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={handleSettings}
              className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                sessionType === 'morning'
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
          timeOfDay={sessionType}
          onUpgrade={handleUpgrade}
        />
      </div>
    );
  }

  // Show session expired message
  if (sessionStartTime && isSessionExpired && !sessionComplete) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {videoEnabled && (
          <NatureVideoBackground 
            scene={currentScene} 
            timeOfDay={sessionType} 
          />
        )}
        {!videoEnabled && (
          <div className={`absolute inset-0 bg-gradient-to-br ${
            sessionType === 'morning' 
              ? 'from-amber-100 via-orange-50 to-yellow-100'
              : 'from-indigo-900 via-purple-900 to-blue-900'
          }`} />
        )}
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
          <div className={`text-2xl font-bold ${
            sessionType === 'morning' ? 'text-gray-800' : 'text-white'
          }`}>
            Komorebi
          </div>
          <div className="flex gap-3">
            {user && (
              <>
                <button
                  onClick={handleInsights}
                  className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                    sessionType === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <User className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSettings}
                  className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                    sessionType === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm ${
              sessionType === 'morning' ? 'bg-white/20' : 'bg-white/10'
            } border border-white/20`}>
              <Settings className={`w-10 h-10 ${
                sessionType === 'morning' ? 'text-gray-700' : 'text-white'
              }`} />
            </div>
            
            <h2 className={`text-2xl font-semibold mb-4 ${
              sessionType === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Session Time Expired
            </h2>
            
            <p className={`text-lg mb-6 ${
              sessionType === 'morning' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              Your {sessionTimeLimit}-minute session has ended.
            </p>

            {!user?.isPro && (
              <div className={`p-6 rounded-2xl backdrop-blur-sm mb-8 ${
                sessionType === 'morning' ? 'bg-white/20' : 'bg-white/10'
              } border border-white/20 max-w-md mx-auto`}>
                <Crown className={`w-8 h-8 mx-auto mb-3 ${
                  sessionType === 'morning' ? 'text-amber-600' : 'text-amber-400'
                }`} />
                <h3 className={`text-lg font-semibold mb-2 ${
                  sessionType === 'morning' ? 'text-gray-800' : 'text-white'
                }`}>
                  Want longer sessions?
                </h3>
                <p className={`text-sm mb-4 ${
                  sessionType === 'morning' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  Upgrade to Pro for 1-hour sessions and unlimited conversations.
                </p>
                <button
                  onClick={handleUpgrade}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium transition-all duration-200"
                >
                  Upgrade to Pro
                </button>
              </div>
            )}
            
            <button
              onClick={handleNewSession}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                sessionType === 'morning'
                  ? 'bg-white/20 hover:bg-white/30 text-gray-800'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Start New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {videoEnabled && (
        <NatureVideoBackground 
          scene={currentScene} 
          timeOfDay={sessionType} 
        />
      )}
      {!videoEnabled && (
        <div className={`absolute inset-0 bg-gradient-to-br ${
          sessionType === 'morning' 
            ? 'from-amber-100 via-orange-50 to-yellow-100'
            : 'from-indigo-900 via-purple-900 to-blue-900'
        }`} />
      )}
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
        <div className={`text-2xl font-bold ${
          sessionType === 'morning' ? 'text-gray-800' : 'text-white'
        }`}>
          Komorebi
        </div>
        <div className="flex gap-3">
          {/* Background Controls */}
          <div className="flex gap-2">
            <button
              onClick={toggleVideoBackground}
              title={videoEnabled ? 'Hide video background' : 'Show video background'}
              className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                sessionType === 'morning'
                  ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {videoEnabled ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            
            {videoEnabled && (
              <>
                <button
                  onClick={handleNextScene}
                  title={`Next scene (${getSceneDisplayName(currentScene)})`}
                  className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                    sessionType === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <SkipForward className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleRandomScene}
                  title="Random scene"
                  className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                    sessionType === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Shuffle className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* User Controls */}
          {!user && (
            <button
              onClick={handleLogin}
              className={`px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                sessionType === 'morning'
                  ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span className="text-sm font-medium">Sign In</span>
            </button>
          )}
          {user && !user.isPro && (
            <button
              onClick={handleUpgrade}
              className={`px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                sessionType === 'morning'
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-700'
                  : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">Pro</span>
            </button>
          )}
          {user && (
            <>
              <button
                onClick={handleInsights}
                className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                  sessionType === 'morning'
                    ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={handleSettings}
                className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                  sessionType === 'morning'
                    ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Settings className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Scene Indicator */}
      {videoEnabled && (
        <div className="absolute bottom-6 left-6 z-50">
          <div className={`px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/20 ${
            sessionType === 'morning' ? 'bg-white/20' : 'bg-white/10'
          }`}>
            <div className={`text-sm font-medium ${
              sessionType === 'morning' ? 'text-gray-700' : 'text-white'
            }`}>
              {getSceneDisplayName(currentScene)}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        {!sessionComplete ? (
          <div className="w-full">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              greeting={timeOfDay.greeting}
              timeOfDay={sessionType}
              messagesRemaining={user?.isPro ? undefined : sessionLimits.maxMessages - sessionLimits.messagesUsed}
            />
            
            {/* Login prompt for non-logged in users */}
            {!user && messages.length > 0 && (
              <div className="mt-6 text-center">
                <div className={`p-4 rounded-2xl backdrop-blur-sm border border-white/20 max-w-md mx-auto ${
                  sessionType === 'morning' ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  <p className={`text-sm mb-3 ${
                    sessionType === 'morning' ? 'text-gray-700' : 'text-white'
                  }`}>
                    Sign in to save your insights and track your progress
                  </p>
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium transition-all duration-200"
                  >
                    Sign In to Save
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto">
            {insightCard && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <h2 className={`text-3xl font-semibold mb-4 ${
                    sessionType === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    Your {sessionType === 'morning' ? 'Morning' : 'Evening'} Insight
                  </h2>
                  <p className={`text-lg ${
                    sessionType === 'morning' ? 'text-gray-600' : 'text-gray-300'
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
                  sessionType === 'morning'
                    ? 'bg-white/20 hover:bg-white/30 text-gray-800'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                New Session
              </button>
              {user && (
                <button
                  onClick={handleInsights}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                    sessionType === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-800'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  View All Insights
                </button>
              )}
              {!user && (
                <button
                  onClick={handleLogin}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium transition-all duration-200"
                >
                  Sign In to Save Insights
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Dynamic AI response system that analyzes user input and provides tailored responses
const generateDynamicAIResponse = async (
  userMessage: string, 
  messageCount: number, 
  history: Message[], 
  timeOfDay: 'morning' | 'evening'
) => {
  // Simulate realistic typing delay based on message length and complexity
  const baseDelay = 800;
  const lengthDelay = userMessage.length * 15;
  const randomDelay = Math.random() * 1200;
  const totalDelay = Math.min(baseDelay + lengthDelay + randomDelay, 4000);
  
  await new Promise(resolve => setTimeout(resolve, totalDelay));

  // Analyze user message for emotional tone and content
  const messageAnalysis = analyzeUserMessage(userMessage, history);
  
  // Generate contextual response based on analysis
  const response = generateContextualResponse(messageAnalysis, messageCount, timeOfDay, history);
  const response = generateContextualResponse(messageAnalysis, messageCount, timeOfDay);
  
  return response;
};

// Analyze user message for emotional tone, urgency, and content themes
const analyzeUserMessage = (message: string, history: Message[]) => {
  const lowerMessage = message.toLowerCase();
  
  // Emotional indicators
  const stressIndicators = ['stressed', 'anxious', 'worried', 'overwhelmed', 'panic', 'scared', 'afraid', 'nervous'];
  const sadnessIndicators = ['sad', 'depressed', 'down', 'lonely', 'empty', 'hopeless', 'crying', 'tears'];
  const angerIndicators = ['angry', 'mad', 'furious', 'frustrated', 'irritated', 'annoyed', 'rage'];
  const positiveIndicators = ['happy', 'excited', 'grateful', 'blessed', 'amazing', 'wonderful', 'great', 'fantastic'];
  const urgencyIndicators = ['help', 'crisis', 'emergency', 'urgent', 'desperate', 'can\'t cope', 'breaking down'];
  
  // Life themes
  const workThemes = ['work', 'job', 'career', 'boss', 'colleague', 'office', 'meeting', 'deadline', 'project'];
  const relationshipThemes = ['relationship', 'partner', 'boyfriend', 'girlfriend', 'husband', 'wife', 'family', 'friend'];
  const healthThemes = ['health', 'sick', 'pain', 'tired', 'exhausted', 'sleep', 'energy', 'doctor'];
  const goalThemes = ['goal', 'dream', 'ambition', 'future', 'plan', 'hope', 'want', 'wish'];
  
  return {
    emotionalTone: {
      stress: stressIndicators.some(word => lowerMessage.includes(word)),
      sadness: sadnessIndicators.some(word => lowerMessage.includes(word)),
      anger: angerIndicators.some(word => lowerMessage.includes(word)),
      positive: positiveIndicators.some(word => lowerMessage.includes(word)),
      urgent: urgencyIndicators.some(word => lowerMessage.includes(word))
    },
    themes: {
      work: workThemes.some(word => lowerMessage.includes(word)),
      relationships: relationshipThemes.some(word => lowerMessage.includes(word)),
      health: healthThemes.some(word => lowerMessage.includes(word)),
      goals: goalThemes.some(word => lowerMessage.includes(word))
    },
    messageLength: message.length,
    questionCount: (message.match(/\?/g) || []).length,
    conversationContext: history.length
  };
};

// Generate contextual response based on analysis
const generateContextualResponse = (analysis: any, messageCount: number, timeOfDay: 'morning' | 'evening') => {
  const { emotionalTone, themes } = analysis;
  
  // Crisis/urgent responses take priority
  if (emotionalTone.urgent) {
    return {
      message: "I hear that you're going through something really difficult right now. Your feelings are completely valid, and it takes courage to reach out. While I'm here to listen and support you, if you're in immediate crisis, please consider reaching out to a mental health professional or crisis helpline. What's one small thing that might help you feel a bit safer or more grounded right now?",
      isComplete: false
    };
  }
  
  // Tailor responses based on emotional tone and themes
  let response = "";
  let isComplete = messageCount >= 4;
  
  if (timeOfDay === 'morning') {
    if (emotionalTone.stress || emotionalTone.sadness) {
      const stressResponses = [
        "I can hear the weight you're carrying this morning. It's okay to start the day feeling this way - you don't have to be 'on' immediately. What's one very small thing you could do today that might bring you even a tiny bit of comfort?",
        "Thank you for sharing something so personal with me. When we're struggling, mornings can feel especially heavy. What would it look like to be gentle with yourself today, even if everything else feels hard?",
        "I'm sitting with you in this difficult moment. Sometimes the bravest thing we can do is simply acknowledge how we're feeling. If today could unfold with just a little more ease than yesterday, what might that look like?"
      ];
      response = stressResponses[Math.floor(Math.random() * stressResponses.length)];
    } else if (emotionalTone.positive) {
      const positiveResponses = [
        "I can feel the positive energy in your words! It's beautiful when we start the day with gratitude or excitement. What's contributing most to this good feeling, and how might you nurture it throughout the day?",
        "Your enthusiasm is wonderful to witness. These moments of joy and appreciation are so precious. What intention could you set today that honors this positive energy you're feeling?",
        "There's something really special about beginning the day with this kind of openness and positivity. How can you carry this feeling with you as you move through today's experiences?"
      ];
      response = positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
    } else if (themes.work) {
      const workResponses = [
        "Work can be such a significant part of our daily experience. Whether it's bringing you energy or draining it, your feelings about it matter. What's your relationship with work telling you about what you need right now?",
        "I hear you thinking about your work life. It's interesting how our professional experiences can shape our entire day. What would it mean to approach your work today with intention rather than just obligation?",
        "Work challenges can really affect how we feel about ourselves and our days. What's one thing about your work situation that you have some control over, even if it's small?"
      ];
      response = workResponses[Math.floor(Math.random() * workResponses.length)];
    } else if (themes.relationships) {
      const relationshipResponses = [
        "Relationships are at the heart of so much of our human experience. Whether they're bringing you joy or challenge right now, your feelings about them are important. What's your heart telling you about what you need in your connections with others?",
        "The people in our lives can have such a profound impact on how we feel and see ourselves. What would it look like to approach your relationships today with both openness and healthy boundaries?",
        "Thank you for sharing about your relationships. These connections shape us in so many ways. What kind of energy do you want to bring to your interactions today?"
      ];
      response = relationshipResponses[Math.floor(Math.random() * relationshipResponses.length)];
    } else {
      const generalMorningResponses = [
        "I appreciate you taking this time for reflection this morning. There's something powerful about beginning the day with intention. What's calling for your attention today?",
        "Thank you for sharing what's on your mind. Morning conversations like this can really set the tone for how we experience our day. What feels most important for you to focus on today?",
        "I'm grateful you're here, taking this moment for yourself. What would it mean to move through today with a sense of purpose and self-compassion?"
      ];
      response = generalMorningResponses[Math.floor(Math.random() * generalMorningResponses.length)];
    }
  } else {
    // Evening responses
    if (emotionalTone.stress || emotionalTone.sadness) {
      const eveningStressResponses = [
        "It sounds like today carried some heavy moments for you. Thank you for trusting me with these feelings. As you prepare to rest, what's one thing from today that you can acknowledge yourself for, even if it feels small?",
        "I can hear the exhaustion in your words. Some days are just harder than others, and that's part of being human. What would it mean to offer yourself the same compassion you'd give a dear friend right now?",
        "Today seems to have asked a lot of you. As we reflect together, what's one lesson or insight that might have emerged from the challenges you faced?"
      ];
      response = eveningStressResponses[Math.floor(Math.random() * eveningStressResponses.length)];
    } else if (emotionalTone.positive) {
      const eveningPositiveResponses = [
        "I can feel the satisfaction and joy in how you're reflecting on your day. These moments of contentment are so valuable. What made today feel particularly meaningful for you?",
        "There's something beautiful about ending the day with gratitude and positivity. What aspects of today do you want to carry forward into tomorrow?",
        "Your positive energy is wonderful to witness. As you look back on today, what are you most proud of or grateful for?"
      ];
      response = eveningPositiveResponses[Math.floor(Math.random() * eveningPositiveResponses.length)];
    } else if (themes.work) {
      const eveningWorkResponses = [
        "Work can follow us home in so many ways - sometimes energizing us, sometimes draining us. How are you feeling about the balance between your professional and personal life right now?",
        "Reflecting on your work day can reveal so much about what matters to you. What did today teach you about your values and priorities?",
        "As you transition from work mode to personal time, what would help you feel more present and at peace this evening?"
      ];
      response = eveningWorkResponses[Math.floor(Math.random() * eveningWorkResponses.length)];
    } else {
      const generalEveningResponses = [
        "Thank you for taking this time to reflect on your day with me. There's wisdom in pausing to process our experiences. What stands out most as you look back on today?",
        "I appreciate you sharing your thoughts as the day winds down. These evening reflections can be so valuable for our growth. What's your heart telling you about today's journey?",
        "As we reflect together on your day, what feels most important to acknowledge or release before you rest tonight?"
      ];
      response = generalEveningResponses[Math.floor(Math.random() * generalEveningResponses.length)];
    }
  }
  
  // Final message for session completion
  if (isComplete) {
    const completionMessages = timeOfDay === 'morning' 
      ? [
          "You've shared so thoughtfully this morning. I can see your wisdom and self-awareness shining through. As you step into your day, remember that you have everything you need within you. Trust yourself, be gentle with yourself, and know that growth happens one moment at a time. ✨",
          "What a meaningful conversation we've had. Your openness and reflection show such courage and wisdom. Carry this intention with you today - you're exactly where you need to be, and you're doing better than you know. Have a beautiful day. 🌅",
          "Thank you for this beautiful morning reflection. I can feel your strength and authenticity. Remember that every day is a new opportunity to practice self-compassion and live with intention. You've got this. ✨"
        ]
      : [
          "What a thoughtful way to end your day. Your willingness to reflect and grow is truly inspiring. As you rest tonight, know that you've done enough, you are enough, and tomorrow holds new possibilities. Sleep well. 🌙",
          "Thank you for sharing your day with me so openly. Your insights and self-awareness are remarkable. Rest knowing that you've navigated today with courage, and tomorrow is a fresh start. Sweet dreams. ✨",
          "This evening reflection shows such wisdom and growth. You've honored your experiences and feelings today. As you prepare for rest, carry with you the knowledge that you're on a beautiful journey of becoming. Rest well. 🌙"
        ];
    
    response = completionMessages[Math.floor(Math.random() * completionMessages.length)];
  }
  
  return {
    message: response,
    isComplete
  };
};

// Simulate insight generation for demo
const simulateInsightGeneration = async (
  messages: Message[], 
  type: 'morning' | 'evening',
  sceneType: any
): Promise<InsightCardType> => {
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Analyze conversation for personalized insights
  const conversationText = messages.filter(m => m.role === 'user').map(m => m.content).join(' ').toLowerCase();
  
  let insight = "";
  
  // Generate insights based on conversation content
  if (conversationText.includes('stress') || conversationText.includes('anxious') || conversationText.includes('overwhelmed')) {
    const stressInsights = type === 'morning' 
      ? [
          "Your awareness of stress is the first step toward managing it with grace.",
          "Even in challenging moments, you have the strength to find your center.",
          "Today's difficulties are tomorrow's wisdom in disguise."
        ]
      : [
          "You've carried today's challenges with more resilience than you realize.",
          "Stress reveals our capacity for growth and adaptation.",
          "Every difficult day teaches us something valuable about our inner strength."
        ];
    insight = stressInsights[Math.floor(Math.random() * stressInsights.length)];
  } else if (conversationText.includes('grateful') || conversationText.includes('happy') || conversationText.includes('excited')) {
    const positiveInsights = type === 'morning'
      ? [
          "Gratitude is the foundation upon which beautiful days are built.",
          "Your positive energy is a gift you give to yourself and the world.",
          "Joy shared in the morning multiplies throughout the day."
        ]
      : [
          "Today's joy is a reminder of life's endless capacity for beauty.",
          "Gratitude transforms ordinary moments into extraordinary memories.",
          "Your appreciation for life's gifts illuminates the path forward."
        ];
    insight = positiveInsights[Math.floor(Math.random() * positiveInsights.length)];
  } else if (conversationText.includes('work') || conversationText.includes('career') || conversationText.includes('job')) {
    const workInsights = type === 'morning'
      ? [
          "Your work is an expression of your values and talents.",
          "Purpose-driven action creates meaning in even the smallest tasks.",
          "Today's efforts are building tomorrow's opportunities."
        ]
      : [
          "Your professional journey reflects your commitment to growth and contribution.",
          "Work challenges are invitations to discover new aspects of your capabilities.",
          "Balance between effort and rest creates sustainable success."
        ];
    insight = workInsights[Math.floor(Math.random() * workInsights.length)];
  } else if (conversationText.includes('relationship') || conversationText.includes('family') || conversationText.includes('friend')) {
    const relationshipInsights = type === 'morning'
      ? [
          "Authentic connections begin with being genuine with yourself.",
          "Love shared freely returns to us in unexpected ways.",
          "Today's interactions are opportunities to practice compassion."
        ]
      : [
          "The love you give and receive shapes who you're becoming.",
          "Relationships teach us as much about ourselves as about others.",
          "Connection and understanding grow through patient presence."
        ];
    insight = relationshipInsights[Math.floor(Math.random() * relationshipInsights.length)];
  } else {
    // General insights based on time of day
    const generalInsights = type === 'morning'
      ? [
          "Today is a canvas waiting for your unique brushstrokes of intention.",
          "Your awareness of this moment is the first step toward meaningful change.",
          "Small, intentional actions create the foundation for extraordinary days.",
          "You have everything within you to make today beautiful.",
          "Clarity comes not from having all the answers, but from asking the right questions."
        ]
      : [
          "Growth happens in the space between challenge and reflection.",
          "Every experience today was a teacher, even the difficult ones.",
          "You showed up today, and that itself is worthy of celebration.",
          "Tomorrow's possibilities are born from today's insights.",
          "Your journey is uniquely yours, and every step has value."
        ];
    insight = generalInsights[Math.floor(Math.random() * generalInsights.length)];
  }

  return {
    id: Date.now().toString(),
    quote: insight,
    type,
    sessionId: Date.now().toString(),
    createdAt: new Date(),
    sceneType,
  };
};

export default MainSession;