import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { InsightCard as InsightCardType, NatureScene } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession, natureScenes } from '../utils/sceneUtils';
import NatureVideoBackground from '../components/NatureVideoBackground';
import InsightCard from '../components/InsightCard';
import { ArrowLeft, Star, MessageCircle, Calendar, Sparkles, Crown, Settings, Archive } from 'lucide-react';

const InsightsGallery: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isGuest } = useAuth();
  const [insights, setInsights] = useState<InsightCardType[]>([]);
  const [pinnedInsight, setPinnedInsight] = useState<InsightCardType | null>(null);

  const timeOfDay = getTimeOfDay();
  const currentScene = getSceneForSession(timeOfDay.period === 'morning' ? 'morning' : 'evening');

  const getDisplayName = (): string => {
    if (profile?.name) return profile.name;
    if (user?.email) return user.email.split('@')[0] || 'Friend';
    return 'Friend';
  };

  // Function to get the correct storage based on user status
  const getStorage = () => {
    return user ? localStorage : (isGuest ? sessionStorage : localStorage);
  };

  useEffect(() => {
    // Load insights from localStorage
    const storage = getStorage();
    const savedInsights = JSON.parse(storage.getItem('insight-cards') || '[]');
    const parsedInsights = savedInsights.map((insight: any) => ({
      ...insight,
      createdAt: new Date(insight.createdAt),
      sceneType: insight.sceneType && Object.keys(natureScenes).includes(insight.sceneType) 
        ? insight.sceneType 
        : 'ocean' as NatureScene
    }));
    
    // Sort by date (newest first)
    parsedInsights.sort((a: InsightCardType, b: InsightCardType) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
    
    setInsights(parsedInsights);
    
    // Find pinned insight
    const pinned = parsedInsights.find((insight: InsightCardType) => insight.isPinned);
    setPinnedInsight(pinned || null);
  }, [user, isGuest]);

  const handleTogglePin = (insightId: string) => {
    const updatedInsights = insights.map(insight => {
      if (insight.id === insightId) {
        return { ...insight, isPinned: !insight.isPinned };
      } else {
        // If pinning a new card, unpin all others (only one can be pinned at a time)
        const isBeingPinned = insights.find(i => i.id === insightId)?.isPinned === false;
        return isBeingPinned ? { ...insight, isPinned: false } : insight;
      }
    });
    
    setInsights(updatedInsights);
    
    // Update pinned insight
    const newPinned = updatedInsights.find(insight => insight.isPinned);
    setPinnedInsight(newPinned || null);
    
    // Save to localStorage
    const storage = getStorage();
    storage.setItem('insight-cards', JSON.stringify(updatedInsights));
  };

  const recentInsights = insights.slice(0, 4); // Show 4 most recent

  // Get archived chat sessions count
  const archivedSessions = JSON.parse(localStorage.getItem('komorebi-chat-sessions') || '[]');
  const chatCount = archivedSessions.length;

  const handleBack = () => {
    navigate('/');
  };

  const handleChatArchive = () => {
    navigate('/archive');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleViewAllInsights = () => {
    navigate('/all-insights');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <NatureVideoBackground 
        scene={currentScene} 
        timeOfDay={timeOfDay.period === 'morning' ? 'morning' : 'evening'} 
      />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
        <button
          onClick={handleBack}
          className={`relative z-[999] p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
            timeOfDay.period === 'morning'
              ? 'bg-white/20 hover:bg-white/30 text-gray-700'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className={`text-2xl font-bold ${
          timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
        }`}>
          Your Journey
        </div>
        
        <button
          onClick={handleSettings}
          className={`relative z-[999] p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
            timeOfDay.period === 'morning'
              ? 'bg-white/20 hover:bg-white/30 text-gray-700'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-20 pb-4 px-4 md:px-6 h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Section */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Sparkles className={`w-8 h-8 ${
                timeOfDay.period === 'morning' ? 'text-amber-600' : 'text-purple-400'
              }`} />
            </div>
            <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${
              timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Welcome back, {getDisplayName()}
            </h1>
            <p className={`text-base ${
              timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              Your mindful reflection journey continues
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className={`p-4 md:p-6 rounded-2xl text-center backdrop-blur-sm border border-white/20 ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              <Calendar className={`w-8 h-8 mx-auto mb-2 ${
                timeOfDay.period === 'morning' ? 'text-blue-600' : 'text-blue-400'
              }`} />
              <div className={`text-xl md:text-2xl font-bold ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                {insights.length}
              </div>
              <div className={`text-sm ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Total Insights
              </div>
            </div>

            <div className={`p-4 md:p-6 rounded-2xl text-center backdrop-blur-sm border border-white/20 ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              <MessageCircle className={`w-8 h-8 mx-auto mb-2 ${
                timeOfDay.period === 'morning' ? 'text-green-600' : 'text-green-400'
              }`} />
              <div className={`text-xl md:text-2xl font-bold ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                {chatCount}
              </div>
              <div className={`text-sm ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Conversations
              </div>
            </div>

            <div className={`p-4 md:p-6 rounded-2xl text-center backdrop-blur-sm border border-white/20 ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              {profile?.is_pro ? (
                <Crown className={`w-8 h-8 mx-auto mb-2 ${
                  timeOfDay.period === 'morning' ? 'text-amber-600' : 'text-amber-400'
                }`} />
              ) : (
                <Sparkles className={`w-8 h-8 mx-auto mb-2 ${
                  timeOfDay.period === 'morning' ? 'text-purple-600' : 'text-purple-400'
                }`} />
              )}
              <div className={`text-lg md:text-xl font-bold ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                {profile?.is_pro ? 'Pro' : 'Free'}
              </div>
              <div className={`text-sm ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Plan
              </div>
            </div>
          </div>

          {/* Favorite Insight Card */}
          {pinnedInsight && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star className={`w-5 h-5 fill-current ${
                  timeOfDay.period === 'morning' ? 'text-amber-600' : 'text-amber-400'
                }`} />
                <h2 className={`text-xl font-semibold ${
                  timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                }`}>
                  Your Favorite Insight
                </h2>
              </div>
              <div className="max-w-sm mx-auto">
                <InsightCard 
                  insight={pinnedInsight} 
                  onTogglePin={handleTogglePin}
                />
              </div>
            </div>
          )}

          {/* Recent Insights */}
          {recentInsights.length > 0 ? (
            <div>
              {isGuest && (
                <div className={`text-center mb-6 p-3 rounded-xl ${
                  timeOfDay.period === 'morning' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-amber-900/30 text-amber-200 border border-amber-700/50'
                }`}>
                  <p className="text-sm">Guest mode: Your insights will be lost when you close your browser. <button onClick={() => navigate('/')} className="font-medium underline">Create an account</button> to save them.</p>
                </div>
              )}
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold ${
                  timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                }`}>
                  Recent Insights
                </h2>
                {insights.length > 3 && (
                  <button
                    onClick={handleViewAllInsights}
                    className={`text-sm font-medium transition-colors ${
                      timeOfDay.period === 'morning' 
                        ? 'text-blue-600 hover:text-blue-700' 
                        : 'text-blue-400 hover:text-blue-300'
                    }`}
                  >
                    View All ({insights.length})
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {recentInsights.map((insight) => (
                  <motion.div 
                    key={insight.id} 
                    className="animate-fade-in"
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <InsightCard 
                      insight={insight} 
                      onTogglePin={handleTogglePin}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className={`p-6 rounded-3xl backdrop-blur-sm border border-white/20 text-center ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              <Sparkles className={`w-12 h-12 mx-auto mb-4 ${
                timeOfDay.period === 'morning' ? 'text-amber-600' : 'text-amber-400'
              }`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>No insights yet</h3>
              <p className={`mb-6 ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>Start a reflection session to create your first insight</p>
              <button
                onClick={() => navigate('/session')}
                className={`px-6 py-3 rounded-xl ${timeOfDay.period === 'morning' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-purple-600 hover:bg-purple-700'} text-white font-medium`}
              >Start Reflection</button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={handleChatArchive}
              className={`p-4 md:p-6 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105 ${
                timeOfDay.period === 'morning' ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Archive className={`w-8 h-8 mx-auto mb-3 ${
                timeOfDay.period === 'morning' ? 'text-blue-600' : 'text-blue-400'
              }`} />
              <h3 className={`text-base md:text-lg font-semibold mb-2 ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Chat Archive
              </h3>
              <p className={`text-sm ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Browse and search your past conversations
              </p>
            </button>

            <button
              onClick={() => navigate('/')}
              className={`p-4 md:p-6 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105 ${
                timeOfDay.period === 'morning' ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Sparkles className={`w-8 h-8 mx-auto mb-3 ${
                timeOfDay.period === 'morning' ? 'text-purple-600' : 'text-purple-400'
              }`} />
              <h3 className={`text-base md:text-lg font-semibold mb-2 ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                New Session
              </h3>
              <p className={`text-sm ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Start a new mindful conversation
              </p>
            </button>
          </div>

          {/* Empty State */}
          {insights.length === 0 && (
            <div className={`p-8 md:p-12 rounded-2xl text-center backdrop-blur-sm border border-white/20 ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              <Sparkles className={`w-16 h-16 mx-auto mb-4 ${
                timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <h3 className={`text-lg md:text-xl font-semibold mb-2 ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Begin Your Journey
              </h3>
              <p className={`mb-4 md:mb-6 ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Start your first mindful session to create beautiful insights.
              </p>
              <button
                onClick={() => navigate('/')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 backdrop-blur-sm ${
                  timeOfDay.period === 'morning'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                Start Your First Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Notice - Bottom of page */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[5]">
        <p className={`text-[10px] sm:text-xs whitespace-nowrap ${
          timeOfDay.period === 'morning' 
            ? 'text-gray-900' 
            : 'text-white'
        }`}>
          🔒 All data stored locally & privately on your device
        </p>
      </div>
    </div>
  );
};

export default InsightsGallery;