import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Crown, 
  LogIn, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  User,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Calendar,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NatureVideoBackground from '../components/NatureVideoBackground';
import ChatInterface from '../components/ChatInterface';
import SessionLimitReached from '../components/SessionLimitReached';

type SessionType = 'morning' | 'evening' | 'meditation';
type SceneType = 'forest' | 'ocean' | 'mountain' | 'rain';

const MainSession: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [sessionType, setSessionType] = useState<SessionType>('morning');
  const [currentScene, setCurrentScene] = useState<SceneType>('forest');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  
  const sessionIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (sessionStarted) {
      sessionIntervalRef.current = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
      }
    }

    return () => {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
      }
    };
  }, [sessionStarted]);

  const handleNextScene = () => {
    const scenes: SceneType[] = ['forest', 'ocean', 'mountain', 'rain'];
    const currentIndex = scenes.indexOf(currentScene);
    const nextIndex = (currentIndex + 1) % scenes.length;
    setCurrentScene(scenes[nextIndex]);
  };

  const toggleVideoBackground = () => {
    setVideoEnabled(!videoEnabled);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleNewSession = () => {
    setSessionStarted(!sessionStarted);
    if (sessionStarted) {
      setSessionDuration(0);
    }
  };

  const getSceneDisplayName = (scene: SceneType): string => {
    switch (scene) {
      case 'forest': return 'Forest';
      case 'ocean': return 'Ocean';
      case 'mountain': return 'Mountain';
      case 'rain': return 'Rain';
      default: return 'Forest';
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionTypeGradient = () => {
    switch (sessionType) {
      case 'morning':
        return 'from-amber-200/20 via-orange-100/10 to-yellow-200/20';
      case 'evening':
        return 'from-purple-900/30 via-indigo-800/20 to-blue-900/30';
      case 'meditation':
        return 'from-emerald-200/20 via-teal-100/10 to-cyan-200/20';
      default:
        return 'from-blue-200/20 via-cyan-100/10 to-teal-200/20';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      {videoEnabled && (
        <NatureVideoBackground 
          scene={currentScene}
          className="absolute inset-0 z-0"
        />
      )}
      
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 z-10 bg-gradient-to-br ${getSessionTypeGradient()}`} />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 pt-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="p-2 rounded-xl backdrop-blur-sm border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
          </div>

          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2"
              >
                {/* Scene Controls */}
                <button
                  onClick={handleNextScene}
                  className={`px-3 py-1 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 flex items-center gap-1 ${
                    sessionType === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <span className="text-xs font-medium">
                    {getSceneDisplayName(currentScene)}
                  </span>
                </button>

                {/* Video Toggle */}
                <button
                  onClick={toggleVideoBackground}
                  className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                    sessionType === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {videoEnabled ? (
                    <Video className="w-4 h-4" />
                  ) : (
                    <VideoOff className="w-4 h-4" />
                  )}
                </button>

                {/* Settings */}
                <button
                  onClick={() => navigate('/settings')}
                  className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                    sessionType === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* User Menu */}
                {user ? (
                  <button
                    onClick={() => signOut()}
                    className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                      sessionType === 'morning'
                        ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <User className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/login')}
                    className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                      sessionType === 'morning'
                        ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col">
        {/* Session Info */}
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
              {sessionType === 'morning' ? 'Good Morning' : 
               sessionType === 'evening' ? 'Good Evening' : 
               'Meditation Session'}
            </h1>
            
            {sessionStarted && (
              <div className={`text-2xl font-mono ${
                sessionType === 'morning' ? 'text-gray-600' : 'text-white/80'
              }`}>
                {formatDuration(sessionDuration)}
              </div>
            )}
          </motion.div>

          {/* Session Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <button
              onClick={handleNewSession}
              className={`px-8 py-3 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200 font-medium ${
                sessionStarted 
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-100 border-red-400/30'
                  : sessionType === 'morning'
                  ? 'bg-white/20 hover:bg-white/30 text-gray-800'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {sessionStarted ? 'End Session' : 'Start Session'}
            </button>

            {sessionStarted && (
              <button
                onClick={toggleRecording}
                className={`p-3 rounded-full backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                  isRecording
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-100 border-red-400/30'
                    : sessionType === 'morning'
                    ? 'bg-white/20 hover:bg-white/30 text-gray-800'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
            )}
          </motion.div>
        </div>

        {/* Chat Interface */}
        <div className="p-4">
          <ChatInterface sessionType={sessionType} />
        </div>
      </div>

      {/* Click to show controls */}
      <div 
        className="absolute inset-0 z-30"
        onClick={() => setShowControls(true)}
      />
    </div>
  );
};

export default MainSession;