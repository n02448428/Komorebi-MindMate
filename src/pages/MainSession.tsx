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
import { Sparkles, Settings } from 'lucide-react';

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
  const [showControls, setShowControls] = useState(false);
  const [sessionLimits, setSessionLimits] = useState<SessionLimits>({
    morningCompleted: false,
    eveningCompleted: false,
    messagesUsed: 0,
    maxMessages: user?.isPro ? 999 : 4,
  });

  const timeOfDay = getTimeOfDay(user?.name);
  const sessionTimeLimit = getSessionTimeLimit(user?.isPro || false);
  
  // Determine which session type to use based on time
  const sessionType = timeOfDay.period === 'morning' ? 'morning' : 'evening';
  
  // Check if user has completed BOTH sessions today (only block if both are done)
  const hasCompletedBothToday = user ? (
    hasCompletedTodaysSession(sessionLimits.lastMorningSession) &&
    hasCompletedTodaysSession(sessionLimits.lastEveningSession)
  ) : false;

  // Check if session time has expired (only for non-Pro users)
  const isSessionExpired = !user?.isPro && sessionStartTime && 
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

    // Load saved messages for the current session
    const savedMessages = localStorage.getItem('current-session-messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        if (parsedMessages.length > 0) {
          setMessages(parsedMessages);
          return; // Skip adding greeting if we restored messages
        }
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }

    // Add initial greeting message if no messages exist
    if (messages.length === 0) {
      const greetingMessage: Message = {
        id: 'greeting',
        content: timeOfDay.greeting,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages([greetingMessage]);
    }
  }, [user?.isPro, user, sessionType]);

  // Save messages when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('current-session-messages', JSON.stringify(messages));
    }
  }, [messages]);

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
    if (isLoading || (!user?.isPro && sessionLimits.messagesUsed >= sessionLimits.maxMessages) || isSessionExpired) return;

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
    const newUserMessagesSinceLastInsight = userMessagesSinceLastInsight + 1;
    
    // Update message counts
    setUserMessagesSinceLastInsight(newUserMessagesSinceLastInsight);
    saveSessionLimits({
      ...sessionLimits,
      messagesUsed: newMessagesUsed,
    });

    // Check if we should show the insight generation button (every 5 user messages)
    if (newUserMessagesSinceLastInsight % 5 === 0 && newUserMessagesSinceLastInsight > 0) {
      setShowGenerateInsightButton(true);
    }

    try {
      // Convert messages to conversation history format (excluding the greeting message)
      const conversationHistory = messages
        .filter(msg => msg.id !== 'greeting')
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Use Supabase AI chat service
      const response = await aiChatService.sendMessage(content, sessionType, conversationHistory, user?.name);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

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

  const handleGenerateInsightClick = async () => {
    setIsGeneratingInsight(true);
    setShowGenerateInsightButton(false);
    
    try {
      // Filter out the greeting message for insight generation
      const sessionMessages = messages.filter(msg => msg.id !== 'greeting');
      await generateInsightCard(sessionMessages);
      
      // Reset the counter
      setUserMessagesSinceLastInsight(0);
    } catch (error) {
      console.error('Error generating insight:', error);
      // Re-show the button if there was an error
      setShowGenerateInsightButton(true);
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const generateInsightCard = async (sessionMessages: Message[]) => {
    try {
      let response;
      
      try {
        // Try Supabase AI service first
        response = await aiChatService.generateInsightCard(sessionMessages, sessionType);
      } catch (error) {
        console.warn('Supabase AI service failed, using local fallback:', error);
        // Fallback to local insight generation
        response = await simulateInsightGeneration(sessionMessages, sessionType);
      }
      
      // Capture current video frame if video is enabled
      let videoStillUrl = null;
      if (videoEnabled && videoBackgroundRef.current) {
        // Wait a moment to ensure video is playing
        await new Promise(resolve => setTimeout(resolve, 500));
        videoStillUrl = videoBackgroundRef.current.captureFrame();
        console.log('Video frame capture result:', videoStillUrl ? 'Success' : 'Failed');
      }
      
      // Create a unique ID for this insight
      const insightId = Date.now().toString();
      const sessionId = Date.now().toString();
      
      const insight: InsightCardType = {
        id: insightId,
        quote: response.quote,
        type: sessionType,
        sessionId: sessionId,
        createdAt: new Date(),
        sceneType: currentScene,
        videoStillUrl: videoStillUrl || undefined,
      };
      
      setInsightCard(insight);
      
      // Only save to localStorage if user is logged in
      if (user) {
        const existingInsights = JSON.parse(localStorage.getItem('insight-cards') || '[]');
        existingInsights.push(insight);
        localStorage.setItem('insight-cards', JSON.stringify(existingInsights));
      }
      
      // Also archive the session and link it to this insight
      archiveCurrentSession(sessionId, insightId);
    } catch (error) {
      console.error('Error generating insight:', error);
      // Create a fallback insight with video capture
      try {
        let videoStillUrl = null;
        if (videoEnabled && videoBackgroundRef.current) {
          await new Promise(resolve => setTimeout(resolve, 500));
          videoStillUrl = videoBackgroundRef.current.captureFrame();
        }
        
        // Create unique IDs
        const insightId = Date.now().toString();
        const sessionId = Date.now().toString();
        
        const fallbackInsight: InsightCardType = {
          id: insightId,
          quote: sessionType === 'morning' 
            ? "Every moment is a fresh beginning, and today holds infinite possibilities for growth and joy."
            : "Today's experiences have shaped you in beautiful ways. Rest knowing you've grown through every challenge and triumph.",
          type: sessionType,
          sessionId: sessionId,
          createdAt: new Date(),
          sceneType: currentScene,
          videoStillUrl: videoStillUrl || undefined,
        };
        
        setInsightCard(fallbackInsight);
        
        if (user) {
          const existingInsights = JSON.parse(localStorage.getItem('insight-cards') || '[]');
          existingInsights.push(fallbackInsight);
          localStorage.setItem('insight-cards', JSON.stringify(existingInsights));
        }
        
        // Also archive the session and link it to this insight
        archiveCurrentSession(sessionId, insightId);
      } catch (fallbackError) {
        console.error('Fallback insight generation failed:', fallbackError);
        throw error;
      }
    }
  };

  // Local insight generation fallback
  const simulateInsightGeneration = async (sessionMessages: Message[], sessionType: 'morning' | 'evening') => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const conversationText = sessionMessages.filter(m => m.role === 'user').map(m => m.content).join(' ').toLowerCase();
    
    let quote = "";
    
    if (conversationText.includes('stress') || conversationText.includes('anxious') || conversationText.includes('overwhelmed')) {
      const stressInsights = sessionType === 'morning' 
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
      quote = stressInsights[Math.floor(Math.random() * stressInsights.length)];
    } else if (conversationText.includes('grateful') || conversationText.includes('happy') || conversationText.includes('excited')) {
      const positiveInsights = sessionType === 'morning'
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
      quote = positiveInsights[Math.floor(Math.random() * positiveInsights.length)];
    } else if (conversationText.includes('work') || conversationText.includes('career') || conversationText.includes('job')) {
      const workInsights = sessionType === 'morning'
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
      quote = workInsights[Math.floor(Math.random() * workInsights.length)];
    } else {
      const generalInsights = sessionType === 'morning'
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
      quote = generalInsights[Math.floor(Math.random() * generalInsights.length)];
    }
    
    return { quote };
  };

  // Archive the current session with link to insight card
  const archiveCurrentSession = (sessionId: string, insightId?: string) => {
    if (!user || messages.length <= 1) return; // Skip if no meaningful content
    
    const sessionEndTime = new Date();
    const sessionDuration = sessionStartTime 
      ? Math.round((sessionEndTime.getTime() - sessionStartTime.getTime()) / (1000 * 60))
      : undefined;

    const archivedSession: ArchivedChatSession = {
      id: sessionId,
      type: sessionType,
      messages: messages.filter(msg => msg.id !== 'greeting'), // Exclude greeting
      createdAt: sessionStartTime || sessionEndTime,
      sceneType: currentScene,
      messageCount: messages.filter(msg => msg.role === 'user').length, // Count only user messages
      duration: sessionDuration,
      insightCardId: insightId, // Link to the insight
    };

    // Save to localStorage
    const existingSessions = JSON.parse(localStorage.getItem('komorebi-chat-sessions') || '[]');
    existingSessions.push(archivedSession);
    
    // Keep only the most recent 50 sessions to prevent localStorage bloat
    if (existingSessions.length > 50) {
      existingSessions.splice(0, existingSessions.length - 50);
    }
    
    localStorage.setItem('komorebi-chat-sessions', JSON.stringify(existingSessions));
  };

  const handleNewSession = () => {
    // Before starting a new session, save the current session if it has meaningful content
    if (messages.length > 1) { // More than just the greeting
      archiveCurrentSession(Date.now().toString());
    }

    // Reset to just the greeting message
    const greetingMessage: Message = {
      id: 'greeting',
      content: timeOfDay.greeting,
      role: 'assistant',
      timestamp: new Date(),
    };
    setMessages([greetingMessage]);
    setInsightCard(null);
    setUserMessagesSinceLastInsight(0);
    setShowGenerateInsightButton(false);
    const startTime = new Date();
    setSessionStartTime(startTime);
    localStorage.setItem('session-start-time', startTime.toISOString());
    localStorage.removeItem('current-session-messages'); // Clear saved messages
    saveSessionLimits({
      ...sessionLimits,
      messagesUsed: 0,
    });
  };

  const handleUpgrade = () => {
    navigate('/pro-upgrade');
  };

  // Show session limit reached only if user has completed BOTH sessions today (for non-Pro users)
  if (user && !user.isPro && hasCompletedBothToday) {
    return (
      <div className="h-screen relative overflow-hidden">
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
        
        {/* Universal Navigation */}
        <UniversalNavigation />

        <SessionLimitReached
          nextSessionTime={getNextAvailableSession()}
          timeOfDay={sessionType}
          onUpgrade={handleUpgrade}
        />
      </div>
    );
  }

  // Show session expired message
  if (sessionStartTime && isSessionExpired) {
    return (
      <div className="h-screen relative overflow-hidden">
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
        
        {/* Universal Navigation */}
        <UniversalNavigation />

        <div className="flex items-center justify-center h-screen p-8">
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
              Your {sessionType === 'morning' ? 'Morning Intention' : 'Evening Reflection'}
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
      
      {/* Universal Navigation */}
      <UniversalNavigation 
        videoEnabled={videoEnabled}
        onToggleVideo={toggleVideoBackground}
        onNextScene={handleNextScene}
        onRandomScene={handleRandomScene}
        onNewSession={handleNewSession}
        currentScene={getSceneDisplayName(currentScene)}
      />

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-2 px-6 flex-1 flex flex-col min-h-0">
        <div className="w-full flex-1 flex flex-col min-h-0">
          {/* Session Type Display */}
          <div className="text-center mb-4 flex-shrink-0">
            <div className={`text-sm font-medium mb-1 ${
              sessionType === 'morning' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              Komorebi
            </div>
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/20 ${
              sessionType === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              <Sparkles className={`w-5 h-5 ${
                sessionType === 'morning' ? 'text-amber-600' : 'text-purple-400'
              }`} />
              <span className={`text-lg font-semibold ${
                sessionType === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                {sessionType === 'morning' ? 'Morning Intention' : 'Evening Reflection'}
              </span>
            </div>
          </div>

          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            timeOfDay={sessionType}
            isImmersive={true}
            messagesRemaining={user?.isPro ? undefined : sessionLimits.maxMessages - sessionLimits.messagesUsed}
          />

          {/* Insight Generation Button */}
          <AnimatePresence>
            {showGenerateInsightButton && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-center animate-fade-in flex-shrink-0"
              >
                <div className={`p-4 rounded-2xl backdrop-blur-sm border border-white/20 max-w-md mx-auto ${
                  sessionType === 'morning' ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  <p className={`text-sm mb-3 ${
                    sessionType === 'morning' ? 'text-gray-700' : 'text-white'
                  }`}>
                    You've shared 5 messages! Ready to capture an insight from our conversation?
                  </p>
                  <button
                    onClick={handleGenerateInsightClick}
                    disabled={isGeneratingInsight}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto ${
                      sessionType === 'morning'
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingInsight ? 'Creating Insight...' : 'Generate Insight Card'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Display Latest Insight Card */}
          <AnimatePresence>
            {insightCard && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="mt-6 animate-fade-in flex-shrink-0"
              >
                <div className="text-center mb-4">
                  <h2 className={`text-xl md:text-2xl font-semibold mb-2 ${
                    sessionType === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    Your {sessionType === 'morning' ? 'Morning Intention' : 'Evening Reflection'}
                  </h2>
                  <p className={`text-sm ${
                    sessionType === 'morning' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    A reflection from our conversation
                  </p>
                </div>
                <div className="max-w-sm mx-auto">
                  <InsightCard insight={insightCard} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Login prompt for non-logged in users */}
          <AnimatePresence>
            {!user && messages.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-center flex-shrink-0"
              >
                <div className={`p-4 rounded-2xl backdrop-blur-sm border border-white/20 max-w-md mx-auto ${
                  sessionType === 'morning' ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  <p className={`text-sm mb-3 ${
                    sessionType === 'morning' ? 'text-gray-700' : 'text-white'
                  }`}>
                    Sign in to save your insights and track your progress
                  </p>
                  <button
                    onClick={() => navigate('/auth')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium transition-all duration-200"
                  >
                    Sign In to Save
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Privacy Notice - Bottom of page */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[5]">
        <p className={`text-xs ${
          sessionType === 'morning' 
            ? 'text-white' 
            : 'text-gray-900'
        }`}>
          🔒 All data stored locally & privately on your device
        </p>
      </div>
    </div>
  );
};

export default MainSession;