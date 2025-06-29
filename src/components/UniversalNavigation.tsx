import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession } from '../utils/sceneUtils';
import { ChevronLeft, ChevronRight, Home, User, Settings, Crown, LogIn, Eye, EyeOff, SkipForward, Shuffle, RefreshCw, Archive, Sparkles, GalleryVertical as Gallery } from 'lucide-react';

interface UniversalNavigationProps {
  // Video background controls (for MainSession)
  videoEnabled?: boolean;
  onToggleVideo?: () => void;
  onNextScene?: () => void;
  onRandomScene?: () => void;
  onNewSession?: () => void;
  currentScene?: string;
  
  // Custom controls for specific pages
  customControls?: React.ReactNode;
  
  // Override default navigation behavior
  onNavigateHome?: () => void;
}

const UniversalNavigation: React.FC<UniversalNavigationProps> = ({
  videoEnabled,
  onToggleVideo,
  onNextScene,
  onRandomScene,
  onNewSession,
  currentScene,
  customControls,
  onNavigateHome
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showControls, setShowControls] = useState(false);

  const timeOfDay = getTimeOfDay(user?.name);
  const currentSceneName = currentScene;

  // Determine current page context
  const pageContext = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'main';
    if (path === '/insights') return 'insights';
    if (path === '/insights-gallery') return 'insights-gallery';
    if (path === '/chat-archive') return 'chat-archive';
    if (path === '/settings') return 'settings';
    if (path === '/pro-upgrade') return 'pro-upgrade';
    return 'other';
  }, [location.pathname]);

  // Navigation handlers
  const navigationHandlers = useMemo(() => ({
    handleHome: () => {
      if (onNavigateHome) {
        onNavigateHome();
      } else {
        navigate('/');
      }
    },
    handleInsights: () => navigate('/insights'),
    handleSettings: () => navigate('/settings'),
    handleUpgrade: () => navigate('/pro-upgrade'),
    handleLogin: () => navigate('/'),
    handleChatArchive: () => navigate('/chat-archive'),
    handleInsightsGallery: () => navigate('/insights-gallery')
  }), [navigate, onNavigateHome]);

  // Control button component
  const ControlButton: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    variant?: 'default' | 'primary';
  }> = ({ onClick, icon, title, variant = 'default' }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
        variant === 'primary'
          ? (timeOfDay.period === 'morning'
              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-700'
              : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-300')
          : (timeOfDay.period === 'morning'
              ? 'bg-white/20 hover:bg-white/30 text-gray-700'
              : 'bg-white/10 hover:bg-white/20 text-white')
      }`}
    >
      {icon}
    </button>
  );

  // Page-specific controls
  const renderPageControls = () => {
    switch (pageContext) {
      case 'main':
        return (
          <>
            {/* Background Controls */}
            {onToggleVideo && (
              <div className="flex gap-2">
                <ControlButton
                  onClick={onToggleVideo}
                  icon={videoEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  title={videoEnabled ? 'Hide video background' : 'Show video background'}
                />
                
                {videoEnabled && onNextScene && (
                  <ControlButton
                    onClick={onNextScene}
                    icon={<SkipForward className="w-4 h-4" />}
                    title="Next scene"
                  />
                )}
                
                {videoEnabled && onRandomScene && (
                  <ControlButton
                    onClick={onRandomScene}
                    icon={<Shuffle className="w-4 h-4" />}
                    title="Random scene"
                  />
                )}
              </div>
            )}

            {(onToggleVideo || onNewSession) && <Separator />}

            {/* Session Controls */}
            {onNewSession && (
              <ControlButton
                onClick={onNewSession}
                icon={<RefreshCw className="w-4 h-4" />}
                title="Start fresh session"
              />
            )}
          </>
        );
        
      case 'insights':
        return (
          <div className="flex gap-2">
            <ControlButton
              onClick={navigationHandlers.handleInsightsGallery}
              icon={<Gallery className="w-4 h-4" />}
              title="All Insights"
            />
            <ControlButton
              onClick={navigationHandlers.handleChatArchive}
              icon={<Archive className="w-4 h-4" />}
              title="Chat Archive"
            />
          </div>
        );
        
      case 'insights-gallery':
      case 'chat-archive':
        return (
          <ControlButton
            onClick={navigationHandlers.handleInsights}
            icon={<User className="w-4 h-4" />}
            title="Back to Journey"
          />
        );
        
      default:
        return null;
    }
  };

  // Separator component
  const Separator = () => (
    <div className={`w-px h-6 ${
      timeOfDay.period === 'morning' ? 'bg-gray-400/30' : 'bg-white/30'
    }`} />
  );

  // Framer Motion variants
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

  return (
    <div className="fixed top-6 right-6 z-[60] flex items-center gap-3">
      {/* Page Title (shown when controls are visible) */}
      <AnimatePresence>
        {showControls && pageContext === 'main' && currentSceneName && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className={`text-sm font-medium ${
              timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
            }`}
          >
            {currentSceneName}
          </motion.div>
        )}
      </AnimatePresence>

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
            {/* Page-specific controls */}
            {renderPageControls()}
            
            {/* Custom controls */}
            {customControls}
            
            {/* Always show separator before universal controls if there are page controls */}
            {(renderPageControls() || customControls) && <Separator />}

            {/* Universal Navigation Controls */}
            <div className="flex gap-2">
              {/* Home button (if not already on home) */}
              {pageContext !== 'main' && (
                <ControlButton
                  onClick={navigationHandlers.handleHome}
                  icon={<Home className="w-4 h-4" />}
                  title="Home"
                />
              )}

              {/* User-specific controls */}
              {!user ? (
                <ControlButton
                  onClick={navigationHandlers.handleLogin}
                  icon={<LogIn className="w-3 h-3" />}
                  title="Sign In"
                />
              ) : (
                <>
                  {!user.isPro && pageContext !== 'pro-upgrade' && (
                    <ControlButton
                      onClick={navigationHandlers.handleUpgrade}
                      icon={<Crown className="w-3 h-3" />}
                      title="Upgrade to Pro"
                      variant="primary"
                    />
                  )}
                  
                  {pageContext !== 'insights' && (
                    <ControlButton
                      onClick={navigationHandlers.handleInsights}
                      icon={<User className="w-4 h-4" />}
                      title="Your Journey"
                    />
                  )}
                  
                  {pageContext !== 'settings' && (
                    <ControlButton
                      onClick={navigationHandlers.handleSettings}
                      icon={<Settings className="w-4 h-4" />}
                      title="Settings"
                    />
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Universal Toggle Button - Always visible in top right */}
      <button
        onClick={() => setShowControls(!showControls)}
        className={`p-2 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
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

export default UniversalNavigation;