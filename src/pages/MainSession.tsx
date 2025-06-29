import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { aiChatService } from '../lib/supabase';
import { Message, InsightCard as InsightCardType, SessionLimits, NatureScene, ArchivedChatSession } from '../types';
import { getTimeOfDay, hasCompletedTodaysSession, getNextAvailableSession, getSessionTimeLimit } from '../utils/timeUtils';
import { getSceneForSession, getNextScene, getSceneDisplayName, getAllScenesForSession } from '../utils/sceneUtils';
import NatureVideoBackground, { NatureVideoBackgroundRef } from '../components/NatureVideoBackground';
import UniversalNavigation from '../components/UniversalNavigation';
import ChatInterface from '../components/ChatInterface';
import InsightCard from '../components/InsightCard';
import SessionLimitReached from '../components/SessionLimitReached';
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  SkipForward, 
  Shuffle, 
  RefreshCw, 
  LogIn, 
  Crown, 
  User, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

const controlsVariants = {
  hidden: { 
    opacity: 0, 
    x: 100,
    transition: { duration: 0.3 }
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  }
};

const MainSession: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoBackgroundRef = useRef<NatureVideoBackgroundRef>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [insightCard, setInsightCard] = useState<InsightCardType | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [currentScene, setCurrentScene] = useState<NatureScene>('ocean');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [userMessagesSinceLastInsight, setUserMessagesSinceLastInsight] = useState(0);
  const [showGenerateInsightButton, setShowGenerateInsightButton] = useState(false);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [sessionLimits, setSessionLimits] = useState<SessionLimits>({
    morningCompleted: false,
    eveningCompleted: false,
    messagesUsed: 0,
    maxMessages: user?.isPro ? 999 : 4,
  });

  const timeOfDay = getTimeOfDay(user?.name);
  const sessionTimeLimit = getSessionTimeLimit(user?.isPro || false);

  // Check if user has completed both sessions today (for non-Pro users)
  const hasCompletedBothToday = user && !user.isPro && 
    hasCompletedTodaysSession(user.id, 'morning') && 
    hasCompletedTodaysSession(user.id, 'evening');

  // Initialize scene based on time of day
  useEffect(() => {
    const initialScene = getSceneForSession(timeOfDay);
    setCurrentScene(initialScene);
  }, [timeOfDay]);

  // Load session limits
  useEffect(() => {
    if (user) {
      const loadSessionLimits = async () => {
        try {
          const morningCompleted = await hasCompletedTodaysSession(user.id, 'morning');
          const eveningCompleted = await hasCompletedTodaysSession(user.id, 'evening');
          
          setSessionLimits({
            morningCompleted,
            eveningCompleted,
            messagesUsed: 0, // This will be updated as messages are sent
            maxMessages: user.isPro ? 999 : 4,
          });
        } catch (error) {
          console.error('Error loading session limits:', error);
        }
      };

      loadSessionLimits();
    }
  }, [user]);

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Show insight generation button after 3 user messages
  useEffect(() => {
    if (userMessagesSinceLastInsight >= 3 && !showGenerateInsightButton && !insightCard) {
      setShowGenerateInsightButton(true);
    }
  }, [userMessagesSinceLastInsight, showGenerateInsightButton, insightCard]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Check message limits for non-Pro users
    if (user && !user.isPro && sessionLimits.messagesUsed >= sessionLimits.maxMessages) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setUserMessagesSinceLastInsight(prev => prev + 1);

    // Update message count
    setSessionLimits(prev => ({
      ...prev,
      messagesUsed: prev.messagesUsed + 1
    }));

    // Set session start time on first message
    if (!sessionStartTime) {
      setSessionStartTime(new Date());
    }

    try {
      const response = await aiChatService.sendMessage(
        content,
        timeOfDay,
        currentScene,
        user?.id
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInsight = async () => {
    if (isGeneratingInsight || messages.length === 0) return;

    setIsGeneratingInsight(true);
    setShowGenerateInsightButton(false);

    try {
      const conversationContext = messages
        .slice(-6) // Last 6 messages for context
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const insight = await aiChatService.generateInsight(
        conversationContext,
        timeOfDay,
        user?.id
      );

      setInsightCard({
        id: Date.now().toString(),
        title: insight.title,
        content: insight.content,
        category: insight.category,
        timestamp: new Date(),
        sessionType: timeOfDay,
      });

      setUserMessagesSinceLastInsight(0);
    } catch (error) {
      console.error('Error generating insight:', error);
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const handleNextScene = () => {
    const availableScenes = getAllScenesForSession(timeOfDay);
    const nextScene = getNextScene(currentScene, availableScenes);
    setCurrentScene(nextScene);
    
    // Update video background
    if (videoBackgroundRef.current) {
      videoBackgroundRef.current.changeScene(nextScene);
    }
  };

  const handleRandomScene = () => {
    const availableScenes = getAllScenesForSession(timeOfDay);
    const filteredScenes = availableScenes.filter(scene => scene !== currentScene);
    const randomScene = filteredScenes[Math.floor(Math.random() * filteredScenes.length)];
    setCurrentScene(randomScene);
    
    // Update video background
    if (videoBackgroundRef.current) {
      videoBackgroundRef.current.changeScene(randomScene);
    }
  };

  const toggleVideoBackground = () => {
    setVideoEnabled(!videoEnabled);
  };

  const handleNewSession = () => {
    setMessages([]);
    setInsightCard(null);
    setSessionStartTime(null);
    setUserMessagesSinceLastInsight(0);
    setShowGenerateInsightButton(false);
    setIsGeneratingInsight(false);
    
    // Reset message count for current session
    setSessionLimits(prev => ({
      ...prev,
      messagesUsed: 0
    }));
  };

  const handleUpgrade = () => {
    navigate('/pro-upgrade');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleInsights = () => {
    navigate('/insights');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  // Show session limit reached only if user has completed BOTH sessions today (for non-Pro users)
  if (user && !user.isPro && hasCompletedBothToday) {
    return <SessionLimitReached onUpgrade={handleUpgrade} />;
  }

  const sessionType = timeOfDay;

  const getSessionTypeGradient = () => {
    switch (sessionType) {
      case 'morning':
        return 'from-amber-200/20 via-orange-100/10 to-yellow-200/20';
      case 'evening':
        return 'from-purple-900/30 via-indigo-800/20 to-blue-900/30';
      default:
        return 'from-blue-200/20 via-cyan-100/10 to-teal-200/20';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      {videoEnabled && (
        <NatureVideoBackground 
          ref={videoBackgroundRef}
          scene={currentScene}
          className="absolute inset-0 z-0"
        />
      )}
      
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 z-10 bg-gradient-to-br ${getSessionTypeGradient()}`} />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="flex items-center justify-between">
          {/* Left Side - Scene Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                variants={controlsVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex items-center gap-3"
              >
                {/* Video Toggle */}
                <button
                  onClick={toggleVideoBackground}
                  title={videoEnabled ? "Disable video background" : "Enable video background"}
                  className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                    sessionType === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {videoEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Scene Controls */}
                <div className="text-center">
                  <div className={`text-xs font-medium mb-1 ${
                    sessionType === 'morning' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    {getSceneDisplayName(currentScene)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleNextScene}
                      title="Next scene"
                      className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                        sessionType === 'morning'
                          ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleRandomScene}
                      title="Random scene"
                      className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                        sessionType === 'morning'
                          ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Side - User Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                variants={controlsVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex items-center gap-3"
              >
                {/* New Session Button */}
                <button
                  onClick={handleNewSession}
                  title="Start fresh session"
                  className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                    sessionType === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* Separator */}
                <div className={`w-px h-6 ${
                  sessionType === 'morning' ? 'bg-gray-400/30' : 'bg-white/30'
                }`} />

                {/* User Controls */}
                {!user && (
                  <button
                    onClick={handleLogin}
                    className={`px-3 py-1 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                      sessionType === 'morning'
                        ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <LogIn className="w-3 h-3" />
                    <span className="text-xs font-medium">Sign In</span>
                  </button>
                )}
                
                {user && !user.isPro && (
                  <button
                    onClick={handleUpgrade}
                    className={`px-3 py-1 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                      sessionType === 'morning'
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-700'
                        : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300'
                    }`}
                  >
                    <Crown className="w-3 h-3" />
                    <span className="text-xs font-medium">Pro</span>
                  </button>
                )}

                {user && (
                  <>
                    <button
                      onClick={handleInsights}
                      className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                        sessionType === 'morning'
                          ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <User className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSettings}
                      className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                        sessionType === 'morning'
                          ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Universal Toggle Button - Always positioned in top right */}
          <button
            onClick={() => setShowControls(!showControls)}
            className={`p-2 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 z-[60] ${
              sessionType === 'morning'
                ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={showControls ? 'Hide controls' : 'Show controls'}
          >
            {showControls ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Welcome Message */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1 className={`text-4xl md:text-6xl font-light mb-4 ${
              sessionType === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              {sessionType === 'morning' ? 'Good Morning' : 'Good Evening'}
            </h1>
            
            <p className={`text-lg md:text-xl font-light ${
              sessionType === 'morning' ? 'text-gray-600' : 'text-white/80'
            }`}>
              {sessionType === 'morning' 
                ? 'Start your day with intention and clarity'
                : 'Reflect on your day and find peace'
              }
            </p>

            {/* Session Limits Display for Non-Pro Users */}
            {user && !user.isPro && (
              <div className={`mt-4 text-sm ${
                sessionType === 'morning' ? 'text-gray-500' : 'text-white/60'
              }`}>
                Messages: {sessionLimits.messagesUsed}/{sessionLimits.maxMessages}
              </div>
            )}
          </motion.div>

          {/* Generate Insight Button */}
          <AnimatePresence>
            {showGenerateInsightButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleGenerateInsight}
                disabled={isGeneratingInsight}
                className={`mb-6 px-6 py-3 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200 flex items-center gap-2 ${
                  sessionType === 'morning'
                    ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                } ${isGeneratingInsight ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isGeneratingInsight ? 'Generating Insight...' : 'Generate Insight'}
                </span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Insight Card */}
          <AnimatePresence>
            {insightCard && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 w-full max-w-md"
              >
                <InsightCard
                  insight={insightCard}
                  onClose={() => setInsightCard(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Interface */}
        <div className="p-4">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            sessionType={sessionType}
            disabled={user && !user.isPro && sessionLimits.messagesUsed >= sessionLimits.maxMessages}
            onUpgrade={user && !user.isPro ? handleUpgrade : undefined}
          />
        </div>
      </div>

      {/* Universal Navigation */}
      <UniversalNavigation />
    </div>
  );
};

export default MainSession;