import React from 'react';
import { Crown, User, Settings } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

interface MainSessionProps {
  sessionType?: 'morning' | 'evening';
  user?: any;
  handleInsights?: () => void;
  handleSettings?: () => void;
}

const MainSession: React.FC<MainSessionProps> = ({ 
  sessionType = 'morning', 
  user, 
  handleInsights, 
  handleSettings 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {true && (
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  {!user && (
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