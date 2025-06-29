import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Archive, Star, Calendar, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Insight {
  id: string;
  quote: string;
  type: 'morning' | 'evening';
  scene_type: string;
  is_pinned: boolean;
  image_url?: string;
  created_at: string;
  session_id?: string;
}

export default function InsightsGallery() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'morning' | 'evening' | 'pinned'>('all');

  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user, filter]);

  const fetchInsights = async () => {
    try {
      let query = supabase
        .from('insights')
        .select(`
          *,
          chat_sessions!inner(user_id)
        `)
        .eq('chat_sessions.user_id', user?.id)
        .order('created_at', { ascending: false });

      if (filter === 'pinned') {
        query = query.eq('is_pinned', true);
      } else if (filter !== 'all') {
        query = query.eq('type', filter);
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

  const togglePinInsight = async (insightId: string, currentPinned: boolean) => {
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
      console.error('Error updating insight:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Insights Gallery</h1>
            </div>
            
            <button
              onClick={() => navigate('/chat-archive')}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Archive className="w-4 h-4" />
              <span>Archived Chats</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { key: 'all', label: 'All Insights' },
              { key: 'morning', label: 'Morning' },
              { key: 'evening', label: 'Evening' },
              { key: 'pinned', label: 'Pinned' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
            <p className="text-gray-600">
              Complete some chat sessions to generate personalized insights.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {insights.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {insight.image_url && (
                    <div className="h-48 bg-gray-100 relative">
                      <img
                        src={insight.image_url}
                        alt="Insight visualization"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          insight.type === 'morning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {insight.type}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          {insight.scene_type}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => togglePinInsight(insight.id, insight.is_pinned)}
                        className={`p-1 rounded-full transition-colors ${
                          insight.is_pinned
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${insight.is_pinned ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    <blockquote className="text-gray-800 mb-4 leading-relaxed">
                      "{insight.quote}"
                    </blockquote>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(insight.created_at)}
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