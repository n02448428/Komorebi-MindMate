import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { InsightCard as InsightCardType, ArchivedChatSession } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession, natureScenes } from '../utils/sceneUtils';
import NatureVideoBackground from '../components/NatureVideoBackground';
import InsightCard from '../components/InsightCard';
import { ArrowLeft, Search, Filter, Calendar, Sun, Moon, X, Grid, List, Star } from 'lucide-react';
import { format } from 'date-fns';

const AllInsights: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [insights, setInsights] = useState<InsightCardType[]>([]);
  const [archivedChats, setArchivedChats] = useState<ArchivedChatSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'morning' | 'evening' | 'favorites'>('all');
  const [expandedInsight, setExpandedInsight] = useState<InsightCardType | null>(null);
  const [expandedBackground, setExpandedBackground] = useState<string>('');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [groupedInsights, setGroupedInsights] = useState<{ [key: string]: InsightCardType[] }>({});
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const timeOfDay = getTimeOfDay();
  const currentScene = getSceneForSession(timeOfDay.period === 'morning' ? 'morning' : 'evening');

  // Load insights and chat sessions
  useEffect(() => {
    const loadInsights = () => {
      try {
        const savedInsights = JSON.parse(localStorage.getItem('insight-cards') || '[]');
        const parsedInsights = savedInsights.map((insight: any) => ({
          ...insight,
          createdAt: new Date(insight.createdAt)
        }));

        // Sort by date, newest first
        const sortedInsights = parsedInsights.sort((a: InsightCardType, b: InsightCardType) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );
        
        setInsights(sortedInsights);
      } catch (error) {
        console.error('Error loading insights:', error);
      }
    };

    const loadChatSessions = () => {
      try {
        const sessions = JSON.parse(localStorage.getItem('komorebi-chat-sessions') || '[]');
        const parsedSessions = sessions.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt)
        }));
        setArchivedChats(parsedSessions);
      } catch (error) {
        console.error('Error loading chat sessions:', error);
      }
    };

    loadInsights();
    loadChatSessions();
  }, []);

  // Group insights by month and year
  useEffect(() => {
    const grouped = filteredInsights.reduce((acc: { [key: string]: InsightCardType[] }, insight) => {
      const date = format(new Date(insight.createdAt), 'MMMM yyyy');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(insight);
      return acc;
    }, {});
    
    setGroupedInsights(grouped);

    // Reset selected date if it no longer exists in the filtered groups
    if (selectedDate && !Object.keys(grouped).includes(selectedDate)) {
      setSelectedDate(Object.keys(grouped)[0] || null);
    } else if (!selectedDate && Object.keys(grouped).length > 0) {
      // Select first date if none selected and there are groups
      setSelectedDate(Object.keys(grouped)[0]);
    }
  }, [insights, searchTerm, filter]);

  // Filter insights based on search and filter
  const filteredInsights = insights.filter(insight => {
    const matchesSearch = searchTerm === '' || 
      insight.quote.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'favorites' && insight.isPinned) || 
      insight.type === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Find related chat for an insight
  const findRelatedChat = useCallback((insightId: string, sessionId: string) => {
    return archivedChats.find(chat => chat.id === sessionId);
  }, [archivedChats]);

  // Handle toggling pin status for an insight
  const handleTogglePin = (insightId: string) => {
    const updatedInsights = insights.map(insight => {
      if (insight.id === insightId) {
        return { ...insight, isPinned: !insight.isPinned };
      } else if (filter === 'favorites') {
        // If we're in favorites view, we should remove the unpinned insight from view
        return insight;
      } else if (insight.isPinned && !insight.id === insightId) {
        // If this is not the insight being toggled but it is pinned, and the one being toggled
        // is being set to pinned, we need to unpin this one (only one pinned insight allowed)
        return { ...insight, isPinned: false };
      }
      return insight;
    });
    
    // If we're in favorites view and unpinning, update the expanded insight if it's the one being unpinned
    if (filter === 'favorites' && expandedInsight && expandedInsight.id === insightId) {
      const insightBeingToggled = insights.find(i => i.id === insightId);
      if (insightBeingToggled && insightBeingToggled.isPinned) {
        setExpandedInsight(null);
      }
    }
    
    setInsights(updatedInsights);
    localStorage.setItem('insight-cards', JSON.stringify(updatedInsights));
  };

  // Handle deleting an insight
  const handleDeleteInsight = (event: React.MouseEvent, insightId: string) => {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this insight? This cannot be undone.')) {
      setIsDeleting(insightId);
      
      setTimeout(() => {
        const updatedInsights = insights.filter(insight => insight.id !== insightId);
        setInsights(updatedInsights);
        localStorage.setItem('insight-cards', JSON.stringify(updatedInsights));
        
        if (expandedInsight && expandedInsight.id === insightId) {
          setExpandedInsight(null);
        }
        
        setIsDeleting(null);
      }, 300);
    }
  };

  // Handle clicking an insight to expand it
  const handleInsightClick = (insight: InsightCardType) => {
    setExpandedInsight(insight);
    
    // Set the background based on the insight's scene
    if (insight.sceneType) {
      setExpandedBackground(insight.sceneType);
    }
    
    // Scroll to top
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Handle closing the expanded insight view
  const handleCloseExpanded = () => {
    setExpandedInsight(null);
  };

  // Handle navigating to the related chat session
  const handleViewRelatedChat = (sessionId: string) => {
    // Store the sessionId in sessionStorage to allow the ChatArchive to jump to this session
    sessionStorage.setItem('jump-to-chat-session', sessionId);
    navigate('/chat-archive');
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/insights');
  };

  // Handle changing the selected date group
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <NatureVideoBackground 
        scene={expandedInsight ? expandedInsight.sceneType : currentScene} 
        timeOfDay={timeOfDay.period === 'morning' ? 'morning' : 'evening'} 
      />

      <div className="absolute inset-0 z-10">
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${
          timeOfDay.period === 'morning' 
            ? 'from-amber-100/20 via-orange-50 to-yellow-100/20'
            : 'from-indigo-900/30 via-purple-900/30 to-blue-900/30'
        }`} />

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
            All Insights
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLayout('grid')}
              className={`p-2 rounded-xl transition-all ${
                layout === 'grid'
                  ? (timeOfDay.period === 'morning'
                      ? 'bg-white/30 text-gray-800'
                      : 'bg-white/20 text-white')
                  : (timeOfDay.period === 'morning'
                      ? 'bg-white/10 text-gray-600'
                      : 'bg-white/5 text-gray-300')
              }`}
              title="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-2 rounded-xl transition-all ${
                layout === 'list'
                  ? (timeOfDay.period === 'morning'
                      ? 'bg-white/30 text-gray-800'
                      : 'bg-white/20 text-white')
                  : (timeOfDay.period === 'morning'
                      ? 'bg-white/10 text-gray-600'
                      : 'bg-white/5 text-gray-300')
              }`}
              title="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div 
          ref={containerRef}
          className="h-screen pt-20 pb-20 overflow-y-auto"
        >
          {/* Search and Filters */}
          <div className="px-6 pb-4 sticky top-0 z-40 backdrop-blur-md bg-white/5">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search your insights..."
                    className={`w-full p-3 pl-10 rounded-2xl transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                      timeOfDay.period === 'morning'
                        ? 'bg-white/20 text-gray-800 placeholder-gray-600 focus:bg-white/30'
                        : 'bg-white/10 text-white placeholder-gray-400 focus:bg-white/15'
                    } focus:outline-none focus:ring-2 focus:ring-white/30`}
                  />
                </div>
                
                <div className="flex gap-2">
                  {(['all', 'morning', 'evening', 'favorites'] as const).map(filterOption => (
                    <button
                      key={filterOption}
                      onClick={() => setFilter(filterOption)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                        filter === filterOption
                          ? (timeOfDay.period === 'morning'
                              ? 'bg-amber-500 text-white border-amber-400'
                              : 'bg-purple-600 text-white border-purple-500')
                          : (timeOfDay.period === 'morning'
                              ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                              : 'bg-white/10 hover:bg-white/15 text-white')
                      }`}
                    >
                      {filterOption === 'morning' && <Sun className="w-4 h-4" />}
                      {filterOption === 'evening' && <Moon className="w-4 h-4" />}
                      {filterOption === 'favorites' && <Star className="w-4 h-4" />}
                      {filterOption === 'all' && <Filter className="w-4 h-4" />}
                      <span className="capitalize text-sm font-medium">
                        {filterOption === 'all' ? 'All' : filterOption}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Month/Year Navigation */}
              {Object.keys(groupedInsights).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.keys(groupedInsights).map((date) => (
                    <button
                      key={date}
                      onClick={() => handleDateSelect(date)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                        selectedDate === date
                          ? (timeOfDay.period === 'morning'
                              ? 'bg-white/40 text-gray-800 border-white/40'
                              : 'bg-white/20 text-white border-white/30')
                          : (timeOfDay.period === 'morning'
                              ? 'bg-white/10 hover:bg-white/20 text-gray-700'
                              : 'bg-white/5 hover:bg-white/10 text-white/70')
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">{date}</span>
                      <span className="text-xs opacity-70 ml-1">({groupedInsights[date].length})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expanded Insight View */}
          <AnimatePresence>
            {expandedInsight && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative w-full max-w-md"
                >
                  <InsightCard 
                    insight={expandedInsight} 
                    isExpanded={true}
                    onClose={handleCloseExpanded}
                  />

                  {/* Related Chat Button */}
                  {expandedInsight.sessionId && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      onClick={() => handleViewRelatedChat(expandedInsight.sessionId)}
                      className={`mt-4 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 mx-auto block ${
                        timeOfDay.period === 'morning'
                          ? 'bg-white/20 hover:bg-white/30 text-gray-800'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      View Original Conversation
                    </motion.button>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Insights Content */}
          <div className="px-6 pb-20">
            <div className="max-w-6xl mx-auto">
              {filteredInsights.length === 0 ? (
                <div className={`p-12 rounded-2xl text-center backdrop-blur-sm border border-white/20 ${
                  timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  <Search className={`w-16 h-16 mx-auto mb-4 ${
                    timeOfDay.period === 'morning' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  
                  {searchTerm || filter !== 'all' ? (
                    <>
                      <h3 className={`text-xl font-semibold mb-2 ${
                        timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                      }`}>
                        No matching insights found
                      </h3>
                      <p className={`mb-6 ${
                        timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                      }`}>
                        Try adjusting your search or filter
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilter('all');
                        }}
                        className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                          timeOfDay.period === 'morning'
                            ? 'bg-amber-500 hover:bg-amber-600 text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        Clear filters
                      </button>
                    </>
                  ) : (
                    <>
                      <h3 className={`text-xl font-semibold mb-2 ${
                        timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                      }`}>
                        No insights yet
                      </h3>
                      <p className={`mb-6 ${
                        timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                      }`}>
                        Complete a session and create your first insight
                      </p>
                      <button
                        onClick={() => navigate('/')}
                        className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
                          timeOfDay.period === 'morning'
                            ? 'bg-amber-500 hover:bg-amber-600 text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        Start a Session
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {/* Date Heading for Selected Group */}
                  {selectedDate && groupedInsights[selectedDate] && (
                    <div className="mb-6">
                      <h2 className={`text-2xl font-semibold ${
                        timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                      }`}>
                        {selectedDate}
                      </h2>
                      <p className={`text-sm ${
                        timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                      }`}>
                        {groupedInsights[selectedDate].length} insight{groupedInsights[selectedDate].length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}

                  {/* Grid Layout */}
                  {layout === 'grid' && selectedDate && groupedInsights[selectedDate] && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
                      {groupedInsights[selectedDate].map((insight) => (
                        <motion.div 
                          key={insight.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3 }}
                          className={isDeleting === insight.id ? 'opacity-50 pointer-events-none' : ''}
                          onClick={() => handleInsightClick(insight)}
                        >
                          <InsightCard
                            insight={insight}
                            onTogglePin={(id) => handleTogglePin(id)}
                            onDelete={(e) => handleDeleteInsight(e, insight.id)}
                            isDeleting={isDeleting === insight.id}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* List Layout */}
                  {layout === 'list' && selectedDate && groupedInsights[selectedDate] && (
                    <div className="space-y-4">
                      {groupedInsights[selectedDate].map((insight) => (
                        <motion.div
                          key={insight.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className={`p-4 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 hover:bg-white/10 cursor-pointer ${
                            timeOfDay.period === 'morning' 
                              ? 'bg-white/20' 
                              : 'bg-white/10'
                          } ${isDeleting === insight.id ? 'opacity-50 pointer-events-none' : ''}`}
                          onClick={() => handleInsightClick(insight)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl ${
                                insight.type === 'morning'
                                  ? 'bg-amber-500/20 text-amber-700'
                                  : 'bg-purple-500/20 text-purple-300'
                              }`}>
                                {insight.type === 'morning' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className={`text-sm ${
                                    timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-400'
                                  }`}>
                                    {format(insight.createdAt, 'MMM d, yyyy • h:mm a')}
                                  </p>
                                  {insight.isPinned && (
                                    <Star className="w-4 h-4 fill-current text-amber-400" />
                                  )}
                                </div>
                                <p className={`text-lg font-medium line-clamp-2 ${
                                  timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                                }`}>
                                  "{insight.quote}"
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTogglePin(insight.id);
                                }}
                                className={`p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                                  insight.isPinned
                                    ? (timeOfDay.period === 'morning'
                                        ? 'bg-amber-500/30 text-amber-700 border-amber-500/50'
                                        : 'bg-purple-500/30 text-purple-300 border-purple-500/50')
                                    : (timeOfDay.period === 'morning'
                                        ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                                        : 'bg-white/10 hover:bg-white/20 text-white')
                                }`}
                                title={insight.isPinned ? "Remove from favorites" : "Add to favorites"}
                              >
                                <Star className={`w-4 h-4 ${insight.isPinned ? 'fill-current' : ''}`} />
                              </button>
                              
                              <button
                                onClick={(e) => handleDeleteInsight(e, insight.id)}
                                className={`p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                                  timeOfDay.period === 'morning'
                                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-700 border-red-500/30'
                                    : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border-red-600/30'
                                }`}
                                title="Delete insight"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              
                              {insight.sessionId && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewRelatedChat(insight.sessionId);
                                  }}
                                  className={`p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                                    timeOfDay.period === 'morning'
                                      ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                                      : 'bg-white/10 hover:bg-white/20 text-white'
                                  }`}
                                  title="View original conversation"
                                >
                                  <ArrowLeft className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
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
      </div>
    </div>
  );
};

export default AllInsights;