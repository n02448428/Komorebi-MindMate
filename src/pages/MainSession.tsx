import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiChatService } from '../lib/supabase';
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
    hasCompletedTodaysSession(sessionLimits.lastMorningSession) &&
    hasCompletedTodaysSession(sessionLimits.lastEveningSession)
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
      // Convert messages to conversation history format
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Use Supabase AI chat service
      const response = await aiChatService.sendMessage(content, sessionType, conversationHistory);
      
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
      // Use Supabase AI service for insight generation
      const response = await aiChatService.generateInsightCard(sessionMessages, sessionType);
      
      const insight: InsightCardType = {
        id: Date.now().toString(),
        quote: response.quote,
        type: sessionType,
        sessionId: Date.now().toString(),
        createdAt: new Date(),
        sceneType: currentScene,
      };
      
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

export default MainSession;