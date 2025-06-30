import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { aiChatService } from '../lib/supabase';
import { Message, InsightCard as InsightCardType, SessionLimits, NatureScene, ArchivedChatSession } from '../types';
import { getTimeOfDay, hasCompletedTodaysSession, getNextAvailableSession, getSessionTimeLimit } from '../utils/timeUtils';
import { getSceneForSession, getNextScene, getSceneDisplayName, getAllScenesForSession } from '../utils/sceneUtils';
import { getStorageItem, setStorageItem, getSessionStorageItem, setSessionStorageItem } from '../utils/storageUtils';
import NatureVideoBackground, { NatureVideoBackgroundRef } from '../components/NatureVideoBackground';
import ChatInterface from '../components/ChatInterface';
import InsightCard from '../components/InsightCard';
import SessionLimitReached from '../components/SessionLimitReached';
import UniversalNavigation from '../components/UniversalNavigation';
import { Settings, User, Crown, LogIn, SkipForward, Eye, EyeOff, Shuffle, Sparkles, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const MainSession: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isGuest } = useAuth();
  const videoBackgroundRef = useRef<NatureVideoBackgroundRef>(null);
  
  // Core session state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [currentScene, setCurrentScene] = useState<NatureScene>('ocean');
  const [sessionType, setSessionType] = useState<'morning' | 'evening'>('morning');
  
  // UI state
  const [showControls, setShowControls] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [generatedInsight, setGeneratedInsight] = useState<InsightCardType | null>(null);
  
  // Session limits
  const [sessionLimits, setSessionLimits] = useState<SessionLimits>({
    morningCompleted: false,
    eveningCompleted: false,
    messagesUsed: 0,
    maxMessages: profile?.is_pro ? 50 : 10
  });

  // Get time of day and greeting
  const timeOfDay = getTimeOfDay(profile?.name);
  
  // Initialize session
  useEffect(() => {
    const initializeSession = () => {
      // Set session type based on time of day
      const currentSessionType = timeOfDay.period === 'morning' ? 'morning' : 'evening';
      setSessionType(currentSessionType);
      
      // Get scene for session
      const scene = getSceneForSession(currentSessionType);
      setCurrentScene(scene);
      
      // Load video preference
      const videoSetting = getStorageItem('video-background-enabled', true);
      setVideoEnabled(videoSetting);
      
      // Load session limits
      const storage = user ? localStorage : sessionStorage;
      const limits = JSON.parse(storage.getItem('session-limits') || '{}');
      setSessionLimits(prev => ({
        ...prev,
        ...limits,
        maxMessages: profile?.is_pro ? 50 : 10
      }));

      // Auto-start with greeting if no messages
      if (messages.length === 0) {
        const greetingMessage: Message = {
          id: Date.now().toString(),
          content: timeOfDay.greeting,
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages([greetingMessage]);
      }
    };

    initializeSession();
  }, [user, profile, timeOfDay, messages.length]);

  // Check for session completion
  const checkSessionCompletion = useCallback(() => {
    if (messages.length >= 6 && !sessionComplete) { // Minimum 6 messages for a meaningful session
      setSessionComplete(true);
      generateInsightCard();
    }
  }, [messages.length, sessionComplete]);

  useEffect(() => {
    checkSessionCompletion();
  }, [checkSessionCompletion]);

  // Send message handler
  const handleSendMessage = async (content: string) => {
    if (isLoading) return;

    // Check message limits for free users
    if (!profile?.is_pro && sessionLimits.messagesUsed >= sessionLimits.maxMessages) {
      alert('You\'ve reached your message limit for this session. Upgrade to Pro for unlimited messages!');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Prepare conversation history for AI
      const conversationHistory = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call AI service
      const response = await aiChatService.sendMessage(
        content,
        sessionType,
        conversationHistory.slice(0, -1), // Don't include the current message
        profile?.name
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update session limits
      const newLimits = {
        ...sessionLimits,
        messagesUsed: sessionLimits.messagesUsed + 1
      };
      setSessionLimits(newLimits);
      
      // Save to storage
      const storage = user ? localStorage : sessionStorage;
      storage.setItem('session-limits', JSON.stringify(newLimits));

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate insight card
  const generateInsightCard = async () => {
    if (messages.length < 4) return; // Need enough conversation

    try {
      const response = await aiChatService.generateInsightCard(messages, sessionType);
      
      if (response?.quote) {
        // Capture video frame
        let videoStillUrl = null;
        if (videoBackgroundRef.current) {
          videoStillUrl = videoBackgroundRef.current.captureFrame();
        }

        const insight: InsightCardType = {
          id: Date.now().toString(),
          quote: response.quote,
          type: sessionType,
          sessionId: sessionStartTime.getTime().toString(),
          createdAt: new Date(),
          sceneType: currentScene,
          videoStillUrl: videoStillUrl || undefined
        };

        setGeneratedInsight(insight);
        
        // Save to storage
        const storage = user ? localStorage : sessionStorage;
        const existingInsights = JSON.parse(storage.getItem('insight-cards') || '[]');
        const updatedInsights = [insight, ...existingInsights];
        storage.setItem('insight-cards', JSON.stringify(updatedInsights));

        // Archive the session
        archiveSession(insight.id);
      }
    } catch (error) {
      console.error('Error generating insight:', error);
    }
  };

  // Archive session
  const archiveSession = (insightId?: string) => {
    const archivedSession: ArchivedChatSession = {
      id: sessionStartTime.getTime().toString(),
      type: sessionType,
      messages,
      createdAt: sessionStartTime,
      sceneType: currentScene,
      messageCount: messages.length,
      duration: Math.floor((Date.now() - sessionStartTime.getTime()) / 1000),
      insightCardId: insightId
    };

    const storage = user ? localStorage : sessionStorage;
    const existingSessions = JSON.parse(storage.getItem('komorebi-chat-sessions') || '[]');
    const updatedSessions = [archivedSession, ...existingSessions];
    storage.setItem('komorebi-chat-sessions', JSON.stringify(updatedSessions));
  };

  // Scene controls
  const handleNextScene = () => {
    const nextScene = getNextScene(currentScene, sessionType);
    setCurrentScene(nextScene);
  };

  const handleRandomScene = () => {
    const availableScenes = getAllScenesForSession(sessionType);
    const randomScene = availableScenes[Math.floor(Math.random() * availableScenes.length)];
    setCurrentScene(randomScene);
  };

  const handleToggleVideo = () => {
    const newVideoEnabled = !videoEnabled;
    setVideoEnabled(newVideoEnabled);
    setStorageItem('video-background-enabled', newVideoEnabled);
  };

  const handleNewSession = () => {
    setMessages([]);
    setSessionComplete(false);
    setGeneratedInsight(null);
    setSessionLimits(prev => ({ ...prev, messagesUsed: 0 }));
    
    // Auto-start with greeting
    const greetingMessage: Message = {
      id: Date.now().toString(),
      content: timeOfDay.greeting,
      role: 'assistant',
      timestamp: new Date()
    };
    setMessages([greetingMessage]);
  };

  // Check if user has reached daily limit
  const hasReachedDailyLimit = () => {
    if (profile?.is_pro) return false;
    
    const today = new Date().toDateString();
    const storage = user ? localStorage : sessionStorage;
    const lastSessionDate = storage.getItem('last-session-date');
    const sessionCount = parseInt(storage.getItem('daily-session-count') || '0');
    
    if (lastSessionDate === today && sessionCount >= 1) {
      return true;
    }
    
    return false;
  };

  // Show session limit if reached
  if (hasReachedDailyLimit() && !profile?.is_pro) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {videoEnabled && (
          <NatureVideoBackground 
            ref={videoBackgroundRef}
            scene={currentScene} 
            timeOfDay={sessionType} 
          />
        )}
        
        <UniversalNavigation 
          videoEnabled={videoEnabled}
          onToggleVideo={handleToggleVideo}
          onNextScene={handleNextScene}
          onRandomScene={handleRandomScene}
          currentScene={getSceneDisplayName(currentScene)}
          sessionType={sessionType}
        />
        
        <SessionLimitReached 
          nextSessionTime={getNextAvailableSession()}
          timeOfDay={sessionType}
          onUpgrade={() => navigate('/upgrade')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      {videoEnabled && (
        <NatureVideoBackground 
          ref={videoBackgroundRef}
          scene={currentScene} 
          timeOfDay={sessionType} 
        />
      )}
      
      {/* Fallback gradient background when video is disabled */}
      {!videoEnabled && (
        <div className={`absolute inset-0 bg-gradient-to-br ${
          sessionType === 'morning' 
            ? 'from-amber-100 via-orange-50 to-yellow-100'
            : 'from-indigo-900 via-purple-900 to-blue-900'
        }`} />
      )}

      {/* Universal Navigation */}
      <UniversalNavigation 
        videoEnabled={videoEnabled}
        onToggleVideo={handleToggleVideo}
        onNextScene={handleNextScene}
        onRandomScene={handleRandomScene}
        onNewSession={handleNewSession}
        currentScene={getSceneDisplayName(currentScene)}
        sessionType={sessionType}
      />

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-2 px-6 flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex items-center justify-center">
          {generatedInsight ? (
            // Show generated insight
            <div className="w-full max-w-sm mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-6"
              >
                <h2 className={`text-2xl font-bold mb-2 ${
                  sessionType === 'morning' ? 'text-gray-800' : 'text-white'
                }`}>
                  Your Reflection
                </h2>
                <p className={`text-base ${
                  sessionType === 'morning' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  Here's your personalized insight from today's session
                </p>
              </motion.div>
              
              <InsightCard insight={generatedInsight} />
              
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleNewSession}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    sessionType === 'morning'
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  New Session
                </button>
                <button
                  onClick={() => navigate('/insights')}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                    sessionType === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-800'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  View Gallery
                </button>
              </div>
            </div>
          ) : (
            // Show chat interface
            <ChatInterface 
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              timeOfDay={sessionType}
              messagesRemaining={profile?.is_pro ? undefined : (sessionLimits.maxMessages - sessionLimits.messagesUsed)}
            />
          )}
        </div>
      </div>

      {/* Privacy Notice - Bottom of page */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[5]">
        <p className={`text-[10px] sm:text-xs whitespace-nowrap ${
          sessionType === 'morning' 
            ? 'text-gray-900' 
            : 'text-white'
        }`}>
          🔒 All data stored locally & privately on your device
        </p>
      </div>
    </div>
  );
};

export default MainSession;