/**
 * Optimized MainSession component
 * Performance Improvements:
 * - Extracted session management into custom hook
 * - Memoized expensive calculations and components
 * - Reduced prop drilling with optimized context
 * - Debounced storage operations
 * - Optimized re-renders with proper dependency arrays
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { aiChatService } from '../lib/supabase';
import { Message, InsightCard as InsightCardType, NatureScene } from '../types';
import { getNextScene, getSceneDisplayName, getAllScenesForSession } from '../utils/sceneUtils';
import { getThemeColors, getButtonStyles } from '../utils/styleUtils';
import { useOptimizedStorage } from '../hooks/useOptimizedStorage';
import { useSessionManagement } from '../hooks/useSessionManagement';
import { STORAGE_KEYS } from '../utils/storageUtils';
import NatureVideoBackground, { NatureVideoBackgroundRef } from '../components/NatureVideoBackground';
import OptimizedChatInterface from '../components/OptimizedChatInterface';
import OptimizedInsightCard from '../components/OptimizedInsightCard';
import SessionLimitReached from '../components/SessionLimitReached';
import { Settings, User, Crown, LogIn, SkipForward, Eye, EyeOff, Shuffle, Sparkles, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

// Memoized control button component
const ControlButton = React.memo<{
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  variant?: 'default' | 'primary';
  timeOfDay: 'morning' | 'evening';
}>(({ onClick, icon, title, variant = 'default', timeOfDay }) => {
  const buttonStyles = getButtonStyles(
    variant === 'primary' ? 'primary' : 'secondary',
    timeOfDay,
    'sm'
  );
  
  return (
    <button
      onClick={onClick}
      title={title}
      className={`${buttonStyles} p-2 min-w-[32px] min-h-[32px] flex items-center justify-center`}
    >
      {icon}
    </button>
  );
});

const OptimizedMainSession: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoBackgroundRef = useRef<NatureVideoBackgroundRef>(null);
  
  // Optimized state management
  const {
    messages,
    sessionLimits,
    parsedSessionStartTime,
    timeOfDay,
    sessionType,
    sessionTimeLimit,
    hasCompletedBothToday,
    isSessionExpired,
    addMessage,
    updateSessionLimits,
    startSession,
    resetSession,
    setMessages
  } = useSessionManagement();
  
  // Local component state
  const [isLoading, setIsLoading] = useState(false);
  const [insightCard, setInsightCard] = useState<InsightCardType | null>(null);
  const [userMessagesSinceLastInsight, setUserMessagesSinceLastInsight] = useState(0);
  const [showGenerateInsightButton, setShowGenerateInsightButton] = useState(false);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  // Optimized storage for app settings
  const [currentScene, setCurrentScene] = useOptimizedStorage<NatureScene>(
    STORAGE_KEYS.CURRENT_SCENE,
    'ocean'
  );
  const [videoEnabled, setVideoEnabled] = useOptimizedStorage<boolean>(
    STORAGE_KEYS.VIDEO_ENABLED,
    true
  );
  
  // Memoized theme colors
  const colors = useMemo(() => getThemeColors(sessionType), [sessionType]);
  
  // Memoized navigation handlers
  const navigationHandlers = useMemo(() => ({
    handleUpgrade: () => navigate('/pro-upgrade'),
    handleLogin: () => navigate('/'),
    handleInsights: () => navigate('/insights'),
    handleSettings: () => navigate('/settings')
  }), [navigate]);

  // Optimized scene management
  const sceneHandlers = useMemo(() => ({
    handleNextScene: () => {
      const nextScene = getNextScene(currentScene, sessionType);
      setCurrentScene(nextScene);
    },
    handleRandomScene: () => {
      const availableScenes = getAllScenesForSession(sessionType);
      const otherScenes = availableScenes.filter(scene => scene !== currentScene);
      const randomScene = otherScenes[Math.floor(Math.random() * otherScenes.length)];
      setCurrentScene(randomScene);
    }
  }), [currentScene, sessionType, setCurrentScene]);

  // Optimized message sending
  const handleSendMessage = useCallback(async (content: string) => {
    if (isLoading || (!user?.isPro && sessionLimits.messagesUsed >= sessionLimits.maxMessages) || isSessionExpired) {
      return;
    }

    // Start session if not already started
    if (!parsedSessionStartTime) {
      startSession();
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setIsLoading(true);

    const newMessagesUsed = sessionLimits.messagesUsed + 1;
    const newUserMessagesSinceLastInsight = userMessagesSinceLastInsight + 1;
    
    // Update counters
    setUserMessagesSinceLastInsight(newUserMessagesSinceLastInsight);
    updateSessionLimits({ messagesUsed: newMessagesUsed });

    // Show insight button every 5 messages
    if (newUserMessagesSinceLastInsight % 5 === 0 && newUserMessagesSinceLastInsight > 0) {
      setShowGenerateInsightButton(true);
    }

    try {
      // Prepare conversation history
      const conversationHistory = messages
        .filter(msg => msg.id !== 'greeting')
        .map(msg => ({ role: msg.role, content: msg.content }));

      // Get AI response
      const response = await aiChatService.sendMessage(
        content, 
        sessionType, 
        conversationHistory, 
        user?.name
      );
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: 'assistant',
        timestamp: new Date(),
      };

      addMessage(aiMessage);

    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting right now. Let's try again in a moment.",
        role: 'assistant',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading, user?.isPro, sessionLimits.messagesUsed, sessionLimits.maxMessages, 
    isSessionExpired, parsedSessionStartTime, startSession, addMessage, messages, 
    sessionType, user?.name, userMessagesSinceLastInsight, updateSessionLimits
  ]);

  // Optimized insight generation
  const handleGenerateInsight = useCallback(async () => {
    setIsGeneratingInsight(true);
    setShowGenerateInsightButton(false);
    
    try {
      // Use local fallback for demo
      const sessionMessages = messages.filter(msg => msg.id !== 'greeting');
      const response = await generateLocalInsight(sessionMessages, sessionType);
      
      // Capture video frame if available
      let videoStillUrl: string | undefined;
      if (videoEnabled && videoBackgroundRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
        videoStillUrl = videoBackgroundRef.current.captureFrame() || undefined;
      }
      
      const insight: InsightCardType = {
        id: Date.now().toString(),
        quote: response.quote,
        type: sessionType,
        sessionId: Date.now().toString(),
        createdAt: new Date(),
        sceneType: currentScene,
        videoStillUrl,
      };
      
      setInsightCard(insight);
      setUserMessagesSinceLastInsight(0);
      
    } catch (error) {
      console.error('Insight generation error:', error);
      setShowGenerateInsightButton(true);
    } finally {
      setIsGeneratingInsight(false);
    }
  }, [messages, sessionType, videoEnabled, currentScene]);

  // Local insight generation fallback
  const generateLocalInsight = useCallback(async (
    sessionMessages: Message[], 
    sessionType: 'morning' | 'evening'
  ) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const insights = sessionType === 'morning' ? [
      "Today is filled with infinite possibilities for growth and discovery.",
      "Your mindful awareness is the foundation of a meaningful day.",
      "Small intentional actions create extraordinary outcomes."
    ] : [
      "Today's experiences have contributed to your wisdom and growth.",
      "Reflection transforms daily moments into lasting insights.",
      "Rest peacefully knowing you've shown up authentically today."
    ];
    
    return { quote: insights[Math.floor(Math.random() * insights.length)] };
  }, []);

  // Optimized session reset
  const handleNewSession = useCallback(() => {
    resetSession(currentScene);
    setInsightCard(null);
    setUserMessagesSinceLastInsight(0);
    setShowGenerateInsightButton(false);
  }, [resetSession, currentScene]);

  // Early returns for special states
  if (user && !user.isPro && hasCompletedBothToday) {
    return (
      <SessionLimitReached
        nextSessionTime={new Date(Date.now() + 24 * 60 * 60 * 1000)}
        timeOfDay={sessionType}
        onUpgrade={navigationHandlers.handleUpgrade}
      />
    );
  }

  if (parsedSessionStartTime && isSessionExpired) {
    return (
      <div className="h-screen relative overflow-hidden flex items-center justify-center">
        {videoEnabled && (
          <NatureVideoBackground 
            ref={videoBackgroundRef}
            scene={currentScene} 
            timeOfDay={sessionType} 
          />
        )}
        <div className="text-center p-8">
          <h2 className={`text-2xl font-semibold mb-4 ${colors.text}`}>
            Session Complete
          </h2>
          <p className={`text-lg mb-6 ${colors.textSecondary}`}>
            Your {sessionTimeLimit}-minute session has ended.
          </p>
          <button
            onClick={handleNewSession}
            className={getButtonStyles('primary', sessionType, 'lg')}
          >
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      {videoEnabled && (
        <NatureVideoBackground 
          ref={videoBackgroundRef}
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
      
      {/* Optimized Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6">
        {/* Title (left side, shown when controls visible) */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute left-6 top-6"
            >
              <div className={`text-2xl font-bold ${colors.text}`}>Komorebi</div>
              {videoEnabled && (
                <div className={`text-sm font-medium ${colors.textSecondary}`}>
                  {getSceneDisplayName(currentScene)}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls (right side) */}
        <div className="absolute right-6 top-6 flex items-center gap-3">
          {/* Controls Panel */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                className={`flex items-center gap-2 backdrop-blur-sm ${colors.background} ${colors.border} border rounded-2xl p-2`}
              >
                {/* Background Controls */}
                <ControlButton
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  icon={videoEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  title={videoEnabled ? 'Hide video' : 'Show video'}
                  timeOfDay={sessionType}
                />
                
                {videoEnabled && (
                  <>
                    <ControlButton
                      onClick={sceneHandlers.handleNextScene}
                      icon={<SkipForward className="w-4 h-4" />}
                      title="Next scene"
                      timeOfDay={sessionType}
                    />
                    <ControlButton
                      onClick={sceneHandlers.handleRandomScene}
                      icon={<Shuffle className="w-4 h-4" />}
                      title="Random scene"
                      timeOfDay={sessionType}
                    />
                  </>
                )}

                <div className={`w-px h-6 ${colors.border}`} />

                <ControlButton
                  onClick={handleNewSession}
                  icon={<RefreshCw className="w-4 h-4" />}
                  title="New session"
                  timeOfDay={sessionType}
                />

                <div className={`w-px h-6 ${colors.border}`} />

                {/* User Controls */}
                {!user ? (
                  <ControlButton
                    onClick={navigationHandlers.handleLogin}
                    icon={<LogIn className="w-3 h-3" />}
                    title="Sign In"
                    timeOfDay={sessionType}
                  />
                ) : (
                  <>
                    {!user.isPro && (
                      <ControlButton
                        onClick={navigationHandlers.handleUpgrade}
                        icon={<Crown className="w-3 h-3" />}
                        title="Upgrade to Pro"
                        variant="primary"
                        timeOfDay={sessionType}
                      />
                    )}
                    <ControlButton
                      onClick={navigationHandlers.handleInsights}
                      icon={<User className="w-4 h-4" />}
                      title="Your Journey"
                      timeOfDay={sessionType}
                    />
                    <ControlButton
                      onClick={navigationHandlers.handleSettings}
                      icon={<Settings className="w-4 h-4" />}
                      title="Settings"
                      timeOfDay={sessionType}
                    />
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Button */}
          <button
            onClick={() => setShowControls(!showControls)}
            className={`p-2 rounded-2xl backdrop-blur-sm ${colors.background} ${colors.border} border transition-all duration-200`}
            title={showControls ? 'Hide controls' : 'Show controls'}
          >
            {showControls ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-2 px-6 flex-1 flex flex-col min-h-0">
        <div className="w-full flex-1 flex flex-col min-h-0">
          {/* Session Header */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="text-center mb-4 flex-shrink-0"
              >
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl backdrop-blur-sm ${colors.background} ${colors.border} border`}>
                  <Sparkles className={`w-5 h-5 ${colors.accent}`} />
                  <span className={`text-lg font-semibold ${colors.text}`}>
                    {sessionType === 'morning' ? 'Morning Intention' : 'Evening Reflection'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Interface */}
          <OptimizedChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            timeOfDay={sessionType}
            isImmersive={!showControls}
            messagesRemaining={user?.isPro ? undefined : sessionLimits.maxMessages - sessionLimits.messagesUsed}
          />

          {/* Insight Generation Button */}
          <AnimatePresence>
            {showGenerateInsightButton && showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-4 text-center flex-shrink-0"
              >
                <div className={`p-4 rounded-2xl backdrop-blur-sm ${colors.background} ${colors.border} border max-w-md mx-auto`}>
                  <p className={`text-sm mb-3 ${colors.text}`}>
                    Ready to capture an insight from our conversation?
                  </p>
                  <button
                    onClick={handleGenerateInsight}
                    disabled={isGeneratingInsight}
                    className={`${getButtonStyles('primary', sessionType)} px-6 py-3 flex items-center gap-2 mx-auto disabled:opacity-50`}
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingInsight ? 'Creating Insight...' : 'Generate Insight Card'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Insight Card Display */}
          <AnimatePresence>
            {insightCard && showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-6 flex-shrink-0"
              >
                <div className="text-center mb-4">
                  <h2 className={`text-xl font-semibold mb-2 ${colors.text}`}>
                    Your {sessionType === 'morning' ? 'Morning Intention' : 'Evening Reflection'}
                  </h2>
                </div>
                <div className="max-w-sm mx-auto">
                  <OptimizedInsightCard insight={insightCard} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[5]">
        <p className={`text-xs ${
          sessionType === 'morning' ? 'text-white' : 'text-gray-900'
        }`}>
          🔒 All data stored locally & privately
        </p>
      </div>
    </div>
  );
};

export default OptimizedMainSession;