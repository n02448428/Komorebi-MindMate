import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Filter, Pin, Trash2, Download, Settings, Crown, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import InsightCard from '../components/InsightCard';
import NatureVideoBackground from '../components/NatureVideoBackground';
import UniversalNavigation from '../components/UniversalNavigation';

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

const AllInsights: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'morning' | 'evening'>('all');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user]);

  useEffect(() => {
    filterInsights();
  }, [insights, searchTerm, selectedType, showPinnedOnly]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInsights = () => {
    let filtered = [...insights];

    if (searchTerm) {
      filtered = filtered.filter(insight =>
        insight.quote.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(insight => insight.type === selectedType);
    }

    if (showPinnedOnly) {
      filtered = filtered.filter(insight => insight.is_pinned);
    }

    setFilteredInsights(filtered);
  };

  const togglePin = async (insightId: string) => {
    try {
      const insight = insights.find(i => i.id === insightId);
      if (!insight) return;

      const { error } = await supabase
        .from('insights')
        .update({ is_pinned: !insight.is_pinned })
        .eq('id', insightId);

      if (error) throw error;

      setInsights(prev => prev.map(i => 
        i.id === insightId ? { ...i, is_pinned: !i.is_pinned } : i
      ));
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const deleteInsight = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('insights')
        .delete()
        .eq('id', insightId);

      if (error) throw error;

      setInsights(prev => prev.filter(i => i.id !== insightId));
      setSelectedInsight(null);
    } catch (error) {
      console.error('Error deleting insight:', error);
    }
  };

  const exportInsights = () => {
    const dataStr = JSON.stringify(filteredInsights, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `insights_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-center text-white">
          <LogIn className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold mb-2">Please sign in</h1>
          <p className="text-blue-200 mb-6">You need to be logged in to view your insights</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <NatureVideoBackground enabled={true} currentScene="forest" />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-4 backdrop-blur-sm bg-black/20 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">All Insights</h1>
                <p className="text-white/70 text-sm">
                  {filteredInsights.length} of {insights.length} insights
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportInsights}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Export insights"
              >
                <Download className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Settings className="w-5 h-5 text-white" />
              </button>
              {!profile?.is_pro && (
                <button
                  onClick={() => navigate('/pro')}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold text-sm flex items-center gap-1 hover:from-yellow-300 hover:to-orange-400 transition-all"
                >
                  <Crown className="w-4 h-4" />
                  Pro
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="all">All Types</option>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
            </select>

            <button
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
              className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                showPinnedOnly
                  ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300'
                  : 'bg-white/10 border-white/20 text-white'
              }`}
            >
              <Pin className="w-4 h-4" />
              {showPinnedOnly ? 'Pinned Only' : 'All'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          ) : filteredInsights.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-white/50" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No insights found</h3>
              <p className="text-white/70">
                {searchTerm || selectedType !== 'all' || showPinnedOnly
                  ? 'Try adjusting your filters or search terms'
                  : 'Start your first session to generate insights'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedInsight(insight)}
                  className="cursor-pointer transform hover:scale-105 transition-transform"
                >
                  <InsightCard
                    insight={insight}
                    onPin={() => togglePin(insight.id)}
                    onDelete={() => deleteInsight(insight.id)}
                    showActions={true}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Expanded Insight Modal */}
        <AnimatePresence>
          {selectedInsight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedInsight(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedInsight.type === 'morning'
                        ? 'bg-yellow-400/20 text-yellow-300'
                        : 'bg-purple-400/20 text-purple-300'
                    }`}>
                      {selectedInsight.type}
                    </span>
                    <span className="text-white/60 text-sm">
                      {new Date(selectedInsight.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePin(selectedInsight.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedInsight.is_pinned
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteInsight(selectedInsight.id)}
                      className="p-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <blockquote className="text-white text-lg leading-relaxed mb-4 italic">
                  "{selectedInsight.quote}"
                </blockquote>

                <div className="text-white/60 text-sm">
                  Scene: {selectedInsight.scene_type}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <UniversalNavigation />
      </div>
    </div>
  );
};

export default AllInsights;