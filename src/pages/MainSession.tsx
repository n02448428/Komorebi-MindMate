import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ChatInterface from '../components/ChatInterface';
import NatureVideoBackground from '../components/NatureVideoBackground';
import { getTimeBasedGreeting, getSessionType } from '../utils/timeUtils';
import { getSceneForSession } from '../utils/sceneUtils';

const MainSession: React.FC = () => {
  const { user } = useAuth();
  const [showHeader, setShowHeader] = useState(true);
  const [sessionType, setSessionType] = useState<'morning' | 'evening'>('morning');

  useEffect(() => {
    setSessionType(getSessionType());
  }, []);

  const handleInsights = () => {
    // Navigate to insights
  };

  const handleSettings = () => {
    // Navigate to settings
  };

  const scene = getSceneForSession(sessionType);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <NatureVideoBackground scene={scene} />
      
      <div className="relative z-10 w-full h-full flex flex-col">
        <div className="flex-1 flex flex-col">
          <AnimatePresence>
            {showHeader && (
              <div className="w-full p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`text-2xl font-bold ${
                      sessionType === 'morning' ? 'text-gray-800' : 'text-white'
                    }`}
                  >
                    {getTimeBasedGreeting()}
                  </motion.h1>
                </div>

                <div className="flex items-center gap-3">
                  {!user?.is_pro && (
                    <button
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
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MainSession;