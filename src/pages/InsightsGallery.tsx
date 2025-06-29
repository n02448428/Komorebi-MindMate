import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { InsightCard as InsightCardType, NatureScene } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession, natureScenes } from '../utils/sceneUtils';
import NatureVideoBackground from '../components/NatureVideoBackground';
import InsightCard from '../components/InsightCard';
import { ArrowLeft, Star, MessageCircle, Calendar, Sparkles, Crown, Settings, Archive } from 'lucide-react';

const InsightsGallery: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [insights, setInsights] = useState<InsightCardType[]>([]);
  const [pinnedInsight, setPinnedInsight] = useState<InsightCardType | null>(null);

  const timeOfDay = getTimeOfDay();
  const currentScene = getSceneForSession(timeOfDay.period === 'morning' ? 'morning' : 'evening');

  useEffect(() => {
    // Load insights from localStorage
    const savedInsights = JSON.parse(localStorage.getItem('insight-cards') || '[]');
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
  }, []);

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
    localStorage.setItem('insight-cards', JSON.stringify(updatedInsights));
  };

  const morningCount = insights.filter(i => i.type === 'morning').length;
  const eveningCount = insights.filter(i => i.type === 'evening').length;
  const recentInsights = insights.slice(0, 3); // Show 3 most recent

  // Get archived chat sessions count
  const archivedSessions = JSON.parse(localStorage.getItem('komorebi-chat-sessions') || '[]');
  const chatCount = archivedSessions.length;

  const handleBack = () => {
    navigate('/');
  };

  const handleChatArchive = () => {
    navigate('/chat-archive');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleViewAllInsights = () => {
    navigate('/insights-gallery');
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
      <div className="relative z-10 pt-24 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className={`w-8 h-8 ${
                timeOfDay.period === 'morning' ? 'text-amber-600' : 'text-purple-400'
              }`} />
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${
              timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Welcome back, {user?.email?.split('@')[0] || 'Friend'}
            </h1>
            <p className={`text-lg ${
              timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              Your mindful reflection journey continues
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className={`p-6 rounded-2xl text-center backdrop-blur-sm border border-white/20 ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              <Calendar className={`w-8 h-8 mx-auto mb-2 ${
                timeOfDay.period === 'morning' ? 'text-blue-600' : 'text-blue-400'
              }`} />
              <div className={`text-2xl font-bold ${
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

            <div className={`p-6 rounded-2xl text-center backdrop-blur-sm border border-white/20 ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              <MessageCircle className={`w-8 h-8 mx-auto mb-2 ${
                timeOfDay.period === 'morning' ? 'text-green-600' : 'text-green-400'
              }`} />
              <div className={`text-2xl font-bold ${
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

            <div className={`p-6 rounded-2xl text-center backdrop-blur-sm border border-white/20 ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              {user?.isPro ? (
                <Crown className={`w-8 h-8 mx-auto mb-2 ${
                  timeOfDay.period === 'morning' ? 'text-amber-600' : 'text-amber-400'
                }`} />
              ) : (
                <Sparkles className={`w-8 h-8 mx-auto mb-2 ${
                  timeOfDay.period === 'morning' ? 'text-purple-600' : 'text-purple-400'
                }`} />
              )}
              <div className={`text-xl font-bold ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                {user?.isPro ? 'Pro' : 'Free'}
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
            <div className="mb-8">
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
              <div className="max-w-lg mx-auto">
                <InsightCard 
                  insight={pinnedInsight} 
                  onTogglePin={handleTogglePin}
                />
              </div>
            </div>
          )}

          {/* Recent Insights */}
          {recentInsights.length > 0 && (
            <div className="mb-8">
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
              <div className="grid md:grid-cols-3 gap-6">
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
          )}

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={handleChatArchive}
              className={`p-6 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105 ${
                timeOfDay.period === 'morning' ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Archive className={`w-8 h-8 mx-auto mb-3 ${
                timeOfDay.period === 'morning' ? 'text-blue-600' : 'text-blue-400'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${
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
              className={`p-6 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105 ${
                timeOfDay.period === 'morning' ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              <Sparkles className={`w-8 h-8 mx-auto mb-3 ${
                timeOfDay.period === 'morning' ? 'text-purple-600' : 'text-purple-400'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${
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
            <div className={`p-12 rounded-2xl text-center backdrop-blur-sm border border-white/20 ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              <Sparkles className={`w-16 h-16 mx-auto mb-4 ${
                timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Begin Your Journey
              </h3>
              <p className={`mb-6 ${
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
        <p className={`text-xs opacity-30 ${
          timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          🔒 All data stored locally & privately on your device
        </p>
      </div>
    </div>
  );
};

export default InsightsGallery;