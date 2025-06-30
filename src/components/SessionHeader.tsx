import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { getSceneDisplayName } from '../utils/sceneUtils';
import SessionControlsPanel from './SessionControlsPanel';

interface SessionHeaderProps {
  sessionType: 'morning' | 'evening';
  currentScene: string;
  videoEnabled: boolean;
  showControls: boolean;
  onToggleControls: () => void;
  user: any;
  profile: any;
  onToggleVideo: () => void;
  onNextScene: () => void;
  onRandomScene: () => void;
  onNewSession: () => void;
  onLogin: () => void;
  onUpgrade: () => void;
  onInsights: () => void;
  onSettings: () => void;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({
  sessionType,
  currentScene,
  videoEnabled,
  showControls,
  onToggleControls,
  user,
  profile,
  onToggleVideo,
  onNextScene,
  onRandomScene,
  onNewSession,
  onLogin,
  onUpgrade,
  onInsights,
  onSettings
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 p-6">
      {/* Left side - Title (only shown when controls are visible) */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute left-6 top-6"
          >
            <div className={`text-2xl font-bold ${
              sessionType === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Komorebi
            </div>
            {videoEnabled && (
              <div className={`text-sm font-medium mt-0.5 ${
                sessionType === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                {getSceneDisplayName(currentScene)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right side - Controls Container */}
      <div className="absolute right-6 top-6 flex items-center gap-3">
        {/* Animated Controls Panel */}
        <SessionControlsPanel
          sessionType={sessionType}
          showControls={showControls}
          videoEnabled={videoEnabled}
          user={user}
          profile={profile}
          onToggleVideo={onToggleVideo}
          onNextScene={onNextScene}
          onRandomScene={onRandomScene}
          onNewSession={onNewSession}
          onLogin={onLogin}
          onUpgrade={onUpgrade}
          onInsights={onInsights}
          onSettings={onSettings}
        />
        
        {/* Universal Toggle Button */}
        <button
          onClick={onToggleControls}
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

      {/* Session Type Display */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-24 left-1/2 transform -translate-x-1/2 text-center"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SessionHeader;