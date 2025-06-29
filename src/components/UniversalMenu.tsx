import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getTimeOfDay } from '../utils/timeUtils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  User, 
  Settings, 
  Crown, 
  LogIn, 
  Eye, 
  EyeOff, 
  SkipForward, 
  Shuffle, 
  RefreshCw,
  Archive,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

interface UniversalMenuProps {
  // MainSession specific props
  videoEnabled?: boolean;
  onToggleVideo?: () => void;
  onNextScene?: () => void;
  onRandomScene?: () => void;
  onNewSession?: () => void;
  showVideoControls?: boolean;
  
  // Custom menu items for specific pages
  customItems?: React.ReactNode;
  
  // Override default behavior
  hideDefaultItems?: boolean;
}

const UniversalMenu: React.FC<UniversalMenuProps> = ({
  videoEnabled,
  onToggleVideo,
  onNextScene,
  onRandomScene,
  onNewSession,
  showVideoControls = false,
  customItems,
  hideDefaultItems = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showControls, setShowControls] = useState(false);
  
  const timeOfDay = getTimeOfDay(user?.name);
  const isMainSession = location.pathname === '/';

  // Framer Motion variants for control panel animation
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

  const handleNavigation = (path: string) => {
    navigate(path);
    setShowControls(false); // Close menu after navigation
  };

  const handleAction = (action: () => void) => {
    action();
    // Keep menu open for actions, close for navigation
  };

  const getButtonStyle = () => {
    return `p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
      timeOfDay.period === 'morning'
        ? 'bg-white/20 hover:bg-white/30 text-gray-700'
        : 'bg-white/10 hover:bg-white/20 text-white'
    }`;
  };

  const getProButtonStyle = () => {
    return `px-3 py-1 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 flex items-center gap-1 cursor-pointer ${
      timeOfDay.period === 'morning'
        ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-700'
        : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300'
    }`;
  };

  const getSeparatorStyle = () => {
    return `w-px h-6 ${timeOfDay.period === 'morning' ? 'bg-gray-400/30' : 'bg-white/30'}`;
  };

  return (
    <div className="absolute right-6 top-6 flex items-center gap-3 z-50">
      {/* Animated Controls Panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={controlsVariants}
            className={`flex items-center gap-2 backdrop-blur-sm border border-white/20 rounded-2xl p-2 ${
              timeOfDay.period === 'morning' 
                ? 'bg-white/20' 
                : 'bg-white/10'
            }`}
          >
            {/* Custom Items */}
            {customItems && (
              <>
                {customItems}
                <div className={getSeparatorStyle()} />
              </>
            )}

            {/* MainSession Video Controls */}
            {showVideoControls && onToggleVideo && (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(onToggleVideo)}
                    title={videoEnabled ? 'Hide video background' : 'Show video background'}
                    className={getButtonStyle()}
                  >
                    {videoEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  
                  {videoEnabled && onNextScene && (
                    <button
                      onClick={() => handleAction(onNextScene)}
                      title="Next scene"
                      className={getButtonStyle()}
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  )}
                  
                  {videoEnabled && onRandomScene && (
                    <button
                      onClick={() => handleAction(onRandomScene)}
                      title="Random scene"
                      className={getButtonStyle()}
                    >
                      <Shuffle className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className={getSeparatorStyle()} />
              </>
            )}

            {/* MainSession Session Controls */}
            {isMainSession && onNewSession && (
              <>
                <button
                  onClick={() => handleAction(onNewSession)}
                  title="Start fresh session"
                  className={getButtonStyle()}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <div className={getSeparatorStyle()} />
              </>
            )}

            {/* Navigation Controls */}
            {!hideDefaultItems && (
              <>
                {/* Back to Home (only if not on main session) */}
                {!isMainSession && (
                  <button
                    onClick={() => handleNavigation('/')}
                    title="Home"
                    className={getButtonStyle()}
                  >
                    <Home className="w-4 h-4" />
                  </button>
                )}

                {/* User Journey/Insights */}
                {user && (
                  <button
                    onClick={() => handleNavigation('/insights')}
                    title="Your Journey"
                    className={getButtonStyle()}
                  >
                    <User className="w-4 h-4" />
                  </button>
                )}

                {/* Chat Archive */}
                {user && (
                  <button
                    onClick={() => handleNavigation('/chat-archive')}
                    title="Chat Archive"
                    className={getButtonStyle()}
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}

                {/* Settings */}
                <button
                  onClick={() => handleNavigation('/settings')}
                  title="Settings"
                  className={getButtonStyle()}
                >
                  <Settings className="w-4 h-4" />
                </button>

                <div className={getSeparatorStyle()} />

                {/* User Controls */}
                {!user && (
                  <button
                    onClick={() => handleNavigation('/')}
                    className={`px-3 py-1 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                      timeOfDay.period === 'morning'
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
                    onClick={() => handleNavigation('/pro-upgrade')}
                    className={getProButtonStyle()}
                  >
                    <Crown className="w-3 h-3" />
                    <span className="text-xs font-medium">Pro</span>
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Universal Toggle Button - Always positioned in top right */}
      <button
        onClick={() => setShowControls(!showControls)}
        className={`p-2 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 z-[60] ${
          timeOfDay.period === 'morning'
            ? 'bg-white/20 hover:bg-white/30 text-gray-700'
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        title={showControls ? 'Hide menu' : 'Show menu'}
      >
        {showControls ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default UniversalMenu;