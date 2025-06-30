import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { hasCompletedTodaysSession, getNextAvailableSession, getSessionTimeLimit } from '../utils/timeUtils';
import { getStorageItem, setStorageItem, getSessionStorageItem, setSessionStorageItem } from '../utils/storageUtils';
import { archiveCurrentSession, completeSession } from '../utils/sessionUtils';

// Custom hooks
import { useSessionState } from '../hooks/useSessionState';
import { useBackgroundSettings } from '../hooks/useBackgroundSettings';
import { useInsightGeneration } from '../hooks/useInsightGeneration';
import { useSessionLimits } from '../hooks/useSessionLimits';

// Components
import NatureVideoBackground, { NatureVideoBackgroundRef } from '../components/NatureVideoBackground';
import ChatInterface from '../components/ChatInterface';
import InsightCard from '../components/InsightCard';
import SessionHeader from '../components/SessionHeader';
import SessionPrompts from '../components/SessionPrompts';
import SessionStatusMessages from '../components/SessionStatusMessages';

const MainSession: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isGuest } = useAuth();
  const videoBackgroundRef = useRef<NatureVideoBackgroundRef>(null);
  const [showControls, setShowControls] = useState(false);

  // Storage abstraction
  const storage = {
    get: <T,>(key: string, defaultValue: T): T => {
      if (user) return getStorageItem(key, defaultValue);
      return getSessionStorageItem(key, defaultValue);
    },
    set: <T,>(key: string, value: T): void => {
      if (user) setStorageItem(key, value);
      else setSessionStorageItem(key, value);
    }
  };

  // Session limits management
  const { sessionLimits, saveSessionLimits } = useSessionLimits({
    user,
    isGuest,
    profile,
    storage
  });

  // Session state management
  const {
    messages,
    isLoading,
    sessionStartTime,
    userMessagesSinceLastInsight,
    sessionType,
    handleSendMessage,
    resetSession,
    setUserMessagesSinceLastInsight
  } = useSessionState({
    profile,
    user,
    isGuest,
    sessionLimits,
    saveSessionLimits,
    storage
  });

  // Background settings management
  const {
    currentScene,
    videoEnabled,
    handleNextScene,
    handleRandomScene,
    toggleVideoBackground
  } = useBackgroundSettings({
    sessionType,
    storage
  });

  // Insight generation management
  const {
    insightCard,
    showGenerateInsightButton,
    isGeneratingInsight,
    setShowGenerateInsightButton,
    handleGenerateInsightClick
  } = useInsightGeneration({
    sessionType,
    currentScene,
    videoEnabled,
    user,
    isGuest,
    storage
  });

  // Derived state
  const sessionTimeLimit = getSessionTimeLimit(profile?.is_pro === true);
  const hasCompletedBothToday = user ? (
    hasCompletedTodaysSession(sessionLimits.lastMorningSession) &&
    hasCompletedTodaysSession(sessionLimits.lastEveningSession)
  ) : false;
  const isSessionExpired = profile?.is_pro !== true && sessionStartTime && 
    (new Date().getTime() - sessionStartTime.getTime()) > (sessionTimeLimit * 60 * 1000);

  // Event handlers
  const handleNewSession = () => {
    // Archive current session if it has meaningful content
    if (messages.length > 1) {

      archiveCurrentSession(
        Date.now().toString(),
        sessionType as 'morning' | 'evening',
        messages,
        sessionStartTime,
        currentScene,
        insightCard?.id,
        user,
        isGuest,
        storage
      );

      // Mark current session type as completed for today  
      completeSession(sessionType as 'morning' | 'evening', sessionLimits, saveSessionLimits);
    }

    resetSession();
  };

  const handleUpgrade = () => {
    navigate('/upgrade');
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleInsights = () => {
    navigate('/insights');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleGenerateInsight = async () => {
    await handleGenerateInsightClick(messages, videoBackgroundRef);
    setUserMessagesSinceLastInsight(0);
  };

  // Update insight button visibility based on user messages
  React.useEffect(() => {
    if (userMessagesSinceLastInsight % 5 === 0 && userMessagesSinceLastInsight > 0) {
      setShowGenerateInsightButton(true);
    }
  }, [userMessagesSinceLastInsight]);

  // Auto-start session effect
  React.useEffect(() => {
    if (!sessionStartTime && !hasCompletedBothToday && !isSessionExpired) {
      const startTime = new Date();
      storage.set('session-start-time', startTime.toISOString());
    }
  }, [sessionStartTime, hasCompletedBothToday, isSessionExpired]);

  // Show controls after delay
  React.useEffect(() => {
    const timer = setTimeout(() => setShowControls(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Render status messages
  if (user && profile?.is_pro !== true && hasCompletedBothToday) {
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
        
        <SessionHeader
          sessionType={sessionType}
          currentScene={currentScene}
          videoEnabled={videoEnabled}
          showControls={showControls}
          onToggleControls={() => setShowControls(!showControls)}
        />
        
        <SessionStatusMessages
          sessionType={sessionType}
          user={user}
          profile={profile}
          nextSessionTime={getNextAvailableSession()}
          onUpgrade={handleUpgrade}
          onInsights={handleInsights}
          onSettings={handleSettings}
          onNewSession={handleNewSession}
        />
      </div>
    );
  }

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
        
        <SessionHeader
          sessionType={sessionType}
          currentScene={currentScene}
          videoEnabled={videoEnabled}
          showControls={showControls}
          onToggleControls={() => setShowControls(!showControls)}
        />
        
        <SessionStatusMessages
          sessionType={sessionType}
          user={user}
          profile={profile}
          sessionTimeLimit={sessionTimeLimit}
          onUpgrade={handleUpgrade}
          onInsights={handleInsights}
          onSettings={handleSettings}
          onNewSession={handleNewSession}
        />
      </div>
    );
  }

  // Main session interface
  return (
    <div className="h-screen relative overflow-hidden flex flex-col">
      {videoEnabled && (
        <NatureVideoBackground 
          ref={videoBackgroundRef}
          scene={currentScene}
          timeOfDay={sessionType as 'morning' | 'evening'}
        />
      )}
      {!videoEnabled && (
        <div className={`absolute inset-0 bg-gradient-to-br ${
          (sessionType as 'morning' | 'evening') === 'morning'
            ? 'from-amber-100 via-orange-50 to-yellow-100'
            : 'from-indigo-900 via-purple-900 to-blue-900'
        }`} />
      )}
      
      {/* Header */}
      <SessionHeader
        sessionType={sessionType as 'morning' | 'evening'}
        currentScene={currentScene}
        videoEnabled={videoEnabled}
        showControls={showControls}
        onToggleControls={() => setShowControls(!showControls)}
        user={user}
        profile={profile}
        onToggleVideo={toggleVideoBackground}
        onNextScene={handleNextScene}
        onRandomScene={handleRandomScene}
        onNewSession={handleNewSession}
        onLogin={handleLogin}
        onUpgrade={handleUpgrade}
        onInsights={handleInsights}
        onSettings={handleSettings}
      />

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-2 px-6 flex-1 flex flex-col min-h-0">
        <div className="w-full flex-1 flex flex-col min-h-0">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            timeOfDay={sessionType as 'morning' | 'evening'}
            isImmersive={!showControls}
            messagesUntilInsight={userMessagesSinceLastInsight > 0 ? 5 - (userMessagesSinceLastInsight % 5) : 5}
          />

          {/* Session Prompts */}
          <SessionPrompts
            sessionType={sessionType as 'morning' | 'evening'}
            showControls={showControls}
            user={user}
            isGuest={isGuest}
            messages={messages}
            showGenerateInsightButton={showGenerateInsightButton}
            isGeneratingInsight={isGeneratingInsight}
            onGenerateInsight={handleGenerateInsight}
            onNavigateToAuth={() => navigate('/auth')}
          />

          {/* Display Latest Insight Card */}
          <AnimatePresence>
            {insightCard && showControls && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="mt-6 animate-fade-in flex-shrink-0"
              >
                <div className="text-center mb-4">
                  <h2 className={`text-xl md:text-2xl font-semibold mb-2 ${
                    (sessionType as 'morning' | 'evening') === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    Your {(sessionType as 'morning' | 'evening') === 'morning' ? 'Morning Intention' : 'Evening Reflection'}
                  </h2>
                  <p className={`text-sm ${
                    (sessionType as 'morning' | 'evening') === 'morning' ? 'text-gray-600' : 'text-gray-300'
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
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[5]">
        <p className={`text-[10px] sm:text-xs whitespace-nowrap ${
          (sessionType as 'morning' | 'evening') === 'morning'
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