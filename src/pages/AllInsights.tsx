import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Filter, Star, Calendar, Image as ImageIcon, Quote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Insight {
  id: string;
  quote: string;
  type: 'morning' | 'evening';
  scene_type: string;
  created_at: string;
  is_pinned: boolean;
  image_url?: string;
}

export default function AllInsights() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'morning' | 'evening'>('all');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [user]);

  const fetchInsights = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('insights')
        .select(`
          id,
          quote,
          type,
          scene_type,
          created_at,
          is_pinned,
          image_url,
          chat_sessions!inner (
            user_id
          )
        `)
        .eq('chat_sessions.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePin = async (insightId: string, currentPinned: boolean) => {
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
      console.error('Error toggling pin:', error);
    }
  };

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.quote.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || insight.type === filterType;
    const matchesPinned = !showPinnedOnly || insight.is_pinned;
    
    return matchesSearch && matchesType && matchesPinned;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    return type === 'morning' 
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-indigo-100 text-indigo-800 border-indigo-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Insights</h1>
                <p className="text-sm text-gray-600">
                  {filteredInsights.length} insights found
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mt-4">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
            </select>

            {/* Pinned Filter */}
            <button
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                showPinnedOnly
                  ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Star className={`w-4 h-4 ${showPinnedOnly ? 'fill-current' : ''}`} />
              Pinned Only
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-16">
            <Quote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || filterType !== 'all' || showPinnedOnly
                ? 'No insights match your filters'
                : 'No insights yet'
              }
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' || showPinnedOnly
                ? 'Try adjusting your search or filters'
                : 'Start a session to generate your first insight'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {insight.image_url && (
                    <div className="aspect-video bg-gray-100 relative">
                      <img
                        src={insight.image_url}
                        alt="Insight"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(insight.type)}`}>
                          {insight.type}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {insight.scene_type}
                        </span>
                      </div>
                      <button
                        onClick={() => togglePin(insight.id, insight.is_pinned)}
                        className={`p-1 rounded-lg transition-colors ${
                          insight.is_pinned
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${insight.is_pinned ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Quote */}
                    <blockquote className="text-gray-800 text-sm leading-relaxed mb-4 italic">
                      "{insight.quote}"
                    </blockquote>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(insight.created_at)}
                      </div>
                      {insight.image_url && (
                        <div className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Image
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}