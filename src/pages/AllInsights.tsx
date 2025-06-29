import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { InsightCard as InsightCardType } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession } from '../utils/sceneUtils';
import NatureVideoBackground from '../components/NatureVideoBackground';
import UniversalNavigation from '../components/UniversalNavigation';
import InsightCard from '../components/InsightCard';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';

const AllInsights: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [insights, setInsights] = useState<InsightCardType[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<InsightCardType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedInsight, setExpandedInsight] = useState<InsightCardType | null>(null);
  const [deletingInsightId, setDeletingInsightId] = useState<string | null>(null);

  const timeOfDay = getTimeOfDay();
  const currentScene = getSceneForSession(timeOfDay.period === 'morning' ? 'morning' : 'evening');

  useEffect(() => {
    // Load insights from localStorage
    const loadInsights = () => {
      try {
        const stored = localStorage.getItem('insight-cards');
        if (stored) {
          const parsedInsights = JSON.parse(stored).map((insight: any) => ({
            ...insight,
            createdAt: new Date(insight.createdAt)
          }));
          
          // Sort by date, newest first
          const sortedInsights = parsedInsights.sort((a: InsightCardType, b: InsightCardType) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          );
          setInsights(sortedInsights);
        }
      } catch (error) {
        console.error('Error loading insights:', error);
      }
    };

    loadInsights();
  }, []);

  // Filter insights when search query changes
  useEffect(() => {
    let filtered = insights;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(insight => 
        insight.quote.toLowerCase().includes(query)
      );
    }
    
    setFilteredInsights(filtered);
  }, [insights, searchQuery]);

  const handleBack = () => {
    navigate('/insights');
  };

  const handleExpandInsight = (insight: InsightCardType) => {
    setExpandedInsight(insight);
  };

  const handleCloseExpanded = () => {
    setExpandedInsight(null);
  };

  const handleTogglePin = useCallback((insightId: string) => {
    setInsights(prev => {
      const updatedInsights = prev.map(insight => {
        if (insight.id === insightId) {
          return { ...insight, isPinned: !insight.isPinned };
        } else if (insight.isPinned) {
          // If we're pinning a new insight, unpin all others
          const isBeingPinned = !prev.find(i => i.id === insightId)?.isPinned;
          return isBeingPinned ? { ...insight, isPinned: false } : insight;
        }
        return insight;
      });
      
      // Save to localStorage
      localStorage.setItem('insight-cards', JSON.stringify(updatedInsights));
      return updatedInsights;
    });
  }, []);

  const handleDeleteInsight = useCallback(async (event: React.MouseEvent, insightId: string) => {
    event.stopPropagation();
    event.preventDefault();
    
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this insight? This action cannot be undone."
    );
    
    if (confirmDelete) {
      setDeletingInsightId(insightId);
      
      try {
        // Update state
        const updatedInsights = insights.filter(insight => insight.id !== insightId);
        setInsights(updatedInsights);
        
        // Update localStorage
        localStorage.setItem('insight-cards', JSON.stringify(updatedInsights));
      } catch (error) {
        console.error('Error deleting insight:', error);
      } finally {
        setDeletingInsightId(null);
      }
    }
  }, [insights]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <NatureVideoBackground 
        scene={currentScene} 
        timeOfDay={timeOfDay.period === 'morning' ? 'morning' : 'evening'} 
      />
      
      {/* Content Container */}
      <div className="relative z-10 min-h-screen">
        {/* Universal Navigation */}
        <UniversalNavigation />

        {/* Header */}
        <div className="p-6 pt-20">
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
              timeOfDay.period === 'morning'
                ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 mb-6">
          <div className={`p-4 rounded-2xl backdrop-blur-sm border border-white/20 ${
            timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
          }`}>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-300'
              }`} />
              <input
                type="text"
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-200 ${
                  timeOfDay.period === 'morning'
                    ? 'bg-white/30 text-gray-800 placeholder-gray-600 focus:bg-white/40'
                    : 'bg-black/20 text-white placeholder-gray-300 focus:bg-black/30'
                } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30`}
              />
            </div>
          </div>
        </div>

        {/* Insights Display */}
        <div className="px-6 pb-12">
          {filteredInsights.length === 0 ? (
            <div className={`p-12 rounded-2xl text-center backdrop-blur-sm border border-white/20 ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              <Sparkles className={`w-12 h-12 mx-auto mb-4 ${
                timeOfDay.period === 'morning' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <h3 className={`text-lg md:text-xl font-semibold mb-2 ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                No insights found
              </h3>
              <p className={`text-sm mb-4 ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Generate your first insight during a reflection session'}
              </p>
              <button
                onClick={() => {
                  if (searchQuery) {
                    setSearchQuery('');
                  } else {
                    navigate('/session');
                  }
                }}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  timeOfDay.period === 'morning'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {searchQuery ? 'Clear search' : 'Start a session'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredInsights.map((insight) => (
                <motion.div
                  key={insight.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleExpandInsight(insight)}
                >
                  <InsightCard 
                    insight={insight} 
                    onTogglePin={handleTogglePin}
                    onDelete={(e) => handleDeleteInsight(e, insight.id)}
                    isDeleting={deletingInsightId === insight.id}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Expanded Insight Modal */}
        <AnimatePresence>
          {expandedInsight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseExpanded}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative"
                onClick={(e) => e.stopPropagation()}
              >
                <InsightCard 
                  insight={expandedInsight}
                  isExpanded={true}
                  onClose={handleCloseExpanded}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Privacy Notice - Bottom of page */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[5]">
        <p className={`text-xs ${
          timeOfDay.period === 'morning' 
            ? 'text-white' 
            : 'text-gray-900'
        }`}>
          🔒 All data stored locally & privately on your device
        </p>
      </div>
    </div>
  );
};

export default AllInsights;