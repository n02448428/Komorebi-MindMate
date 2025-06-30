import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  EyeOff, Eye, SkipForward, Shuffle, RefreshCw, LogIn, Crown, 
  User, Settings, MessageCircle
} from 'lucide-react';
import { aiChatService } from '../lib/supabase';

interface SessionControlsPanelProps {
  sessionType: 'morning' | 'evening';
  showControls: boolean;
  videoEnabled: boolean;
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

const SessionControlsPanel: React.FC<SessionControlsPanelProps> = ({
  sessionType,
  showControls,
  videoEnabled,
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
  const controlsVariants = {
    hidden: {
      x: '100%',
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  // Test AI response function for debugging
  const handleTestAI = async () => {
    console.log('🧪 Testing AI response...');
    try {
      const response = await aiChatService.sendMessage(
        'Hello, this is a test message',
        sessionType,
        [],
        'TestUser'
      );
      console.log('🧪 AI Test Response:', response);
      alert(`AI responded: ${response.message}`);
    } catch (error) {
      console.error('🧪 AI Test Failed:', error);
      alert(`AI test failed: ${error.message}`);
    }
  };

  return (
    <AnimatePresence>
      {showControls && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={controlsVariants}
          className={`flex items-center gap-2 backdrop-blur-sm border border-white/20 rounded-2xl p-2 ${
            sessionType === 'morning' 
              ? 'bg-white/20' 
              : 'bg-white/10'
          }`}
        >
            {/* AI Test Button (only in development) */}
            {import.meta.env.DEV && (
              <button
                onClick={handleTestAI}
                title="Test AI Response"
                className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                  sessionType === 'morning'
                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-700'
                    : 'bg-green-600/20 hover:bg-green-600/30 text-green-300'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            )}
            
            {/* Background Controls */}
            <div className="flex gap-2">
              <button
                onClick={onToggleVideo}
                title={videoEnabled ? 'Hide video background' : 'Show video background'}
                className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                  sessionType === 'morning'
                    ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {videoEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              
              {videoEnabled && (
                <>
                  <button
                    onClick={onNextScene}
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
                    onClick={onRandomScene}
                    title="Random scene"
                    className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                      sessionType === 'morning'
                        ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Separator */}
            <div className={`w-px h-6 ${
              sessionType === 'morning' ? 'bg-gray-400/30' : 'bg-white/30'
            }`} />

            {/* Session Controls */}
            <button
              onClick={onNewSession}
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
                onClick={onLogin}
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
            
            {user && profile?.is_pro !== true && (
              <button
                onClick={onUpgrade}
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
                  onClick={onInsights}
                  className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                    sessionType === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                </button>
                <button
                  onClick={onSettings}
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
  );
};

export default SessionControlsPanel;