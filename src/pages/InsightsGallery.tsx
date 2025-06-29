import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings, Crown, LogIn, ChevronLeft, ChevronRight, RefreshCw, User, Pin, Calendar, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

interface Insight {
  id: string;
  quote: string;
  type: 'morning' | 'evening';
  scene_type: string;
  is_pinned: boolean;
  image_url?: string;
  created_at: string;
}

export default function InsightsGallery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [filter, setFilter] = useState<'all' | 'morning' | 'evening' | 'pinned'>('all');

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user, filter]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('insights')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'morning' || filter === 'evening') {
        query = query.eq('type', filter);
      } else if (filter === 'pinned') {
        query = query.eq('is_pinned', true);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePinToggle = async (insightId: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('insights')
        .update({ is_pinned: !currentPinned })
        .eq('id', insightId);

      if (error) throw error;
      
      setInsights(prev => 
        prev.map(insight => 
          insight.id === insightId 
            ? { ...insight, is_pinned: !currentPinned }
            : insight
        )
      );
    } catch (error) {
      console.error('Error updating pin status:', error);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleInsights = () => {
    navigate('/insights');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const nextInsight = () => {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  const prevInsight = () => {
    setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your insights</h2>
          <button
            onClick={handleLogin}
            className="bg-white text-purple-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-lg">Loading your insights...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 pt-4 px-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2"
              >
                <button
                  onClick={handleInsights}
                  className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors text-white"
                >
                  <User className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSettings}
                  className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors text-white"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
          {(['all', 'morning', 'evening', 'pinned'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-white text-purple-900'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-32 pb-16">
        {insights.length === 0 ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              {filter === 'all' ? 'No insights yet' : `No ${filter} insights`}
            </h2>
            <p className="text-white/80 mb-6">
              Complete some chat sessions to generate insights
            </p>
            <button
              onClick={() => navigate('/session')}
              className="bg-white text-purple-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start a Session
            </button>
          </div>
        ) : (
          <div className="max-w-2xl w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      insights[currentIndex].type === 'morning' 
                        ? 'bg-yellow-400' 
                        : 'bg-purple-400'
                    }`} />
                    <span className="text-white/80 text-sm font-medium">
                      {insights[currentIndex].type} insight
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePinToggle(
                        insights[currentIndex].id, 
                        insights[currentIndex].is_pinned
                      )}
                      className={`p-2 rounded-lg transition-colors ${
                        insights[currentIndex].is_pinned
                          ? 'bg-yellow-400 text-yellow-900'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1 text-white/60 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(insights[currentIndex].created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>

                <blockquote className="text-white text-xl leading-relaxed italic mb-6">
                  "{insights[currentIndex].quote}"
                </blockquote>

                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">
                    Scene: {insights[currentIndex].scene_type}
                  </span>
                  <span className="text-white/60 text-sm">
                    {currentIndex + 1} of {insights.length}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            {insights.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={prevInsight}
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex gap-2">
                  {insights.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextInsight}
                  className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}