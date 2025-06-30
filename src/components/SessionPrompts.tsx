import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface SessionPromptsProps {
  sessionType: 'morning' | 'evening';
  showControls: boolean;
  user: any;
  isGuest: boolean;
  messages: any[];
  showGenerateInsightButton: boolean;
  isGeneratingInsight: boolean;
  onGenerateInsight: () => void;
  onNavigateToAuth: () => void;
}

const SessionPrompts: React.FC<SessionPromptsProps> = ({
  sessionType,
  showControls,
  user,
  isGuest,
  messages,
  showGenerateInsightButton,
  isGeneratingInsight,
  onGenerateInsight,
  onNavigateToAuth
}) => {
  return (
    <>
      {/* Insight Generation Button */}
      <AnimatePresence>
        {showGenerateInsightButton && showControls && (
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
                onClick={onGenerateInsight}
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

      {/* Guest User Prompts */}
      <AnimatePresence>
        {isGuest && messages.length > 1 && showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-center flex-shrink-0 animate-pulse"
          >
            <div className={`p-4 rounded-2xl backdrop-blur-sm border border-white/20 max-w-md mx-auto ${
              sessionType === 'morning' ? 'bg-white/20 border-amber-400/50' : 'bg-white/10 border-amber-400/50'
            }`}>
              <p className={`text-sm mb-3 ${
                sessionType === 'morning' ? 'text-gray-700' : 'text-white'
              }`}>
                <strong>Guest Mode:</strong> Your data will be lost when you close the browser. 
                Create a free account to save your insights and conversations.
              </p>
              <button
                onClick={onNavigateToAuth}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  sessionType === 'morning'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Sign Up Now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anonymous User Prompts */}
      <AnimatePresence>
        {!user && !isGuest && messages.length > 1 && showControls && (
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
                onClick={onNavigateToAuth}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium transition-all duration-200"
              >
                Sign In to Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SessionPrompts;