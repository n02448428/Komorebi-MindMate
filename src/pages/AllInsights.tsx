import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { InsightCard as InsightCardType, ArchivedChatSession, NatureScene } from '../types';
import { useAuth } from '../context/AuthContext';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession, getSceneDisplayName, natureScenes } from '../utils/sceneUtils';
import NatureVideoBackground from '../components/NatureVideoBackground';
import InsightCard from '../components/InsightCard';
import { ArrowLeft, Search, Filter, Calendar, Sun, Moon, X, Grid, List, Star, MessageCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import UniversalNavigation from '../components/UniversalNavigation';

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
  const [relatedChat, setRelatedChat] = useState<ArchivedChatSession | null>(null);
  const [showRelatedChat, setShowRelatedChat] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const timeOfDay = getTimeOfDay();
  const currentScene = getSceneForSession(timeOfDay.period === 'morning' ? 'morning' : 'evening');

  useEffect(() => {
    const loadInsights = () => {
      try {
        const savedInsights = JSON.parse(localStorage.getItem('insight-cards') || '[]');
        const parsedInsights = savedInsights.map((insight: any) => {
          return {
            ...insight,
            createdAt: new Date(insight.createdAt),
            // Ensure sceneType is valid or default to ocean
            sceneType: insight.sceneType && natureScenes[insight.sceneType as NatureScene] 
              ? insight.sceneType 
              : 'ocean' as NatureScene
          };
        });

        // Sort by date, newest first
        const sortedInsights = parsedInsights.sort((a: InsightCardType, b: InsightCardType) => 
          b.createdAt.getTime() - a.createdAt.getTime()
        );

        setInsights(sortedInsights);
      } catch (error) {
        console.error('Error loading insights:', error);
        setInsights([]);
      }
    };

    const loadChatSessions = () => {
      try {
        const sessionsData = localStorage.getItem('komorebi-chat-sessions');
        if (!sessionsData) return;
        
        const sessions = JSON.parse(sessionsData);
        const parsedSessions = sessions.map((session: any) => {
          return {
            ...session,
            createdAt: new Date(session.createdAt),
            messages: session.messages?.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })) || [],
            // Ensure sceneType is valid or default to ocean
            sceneType: session.sceneType && natureScenes[session.sceneType as NatureScene]
              ? session.sceneType
              : 'ocean' as NatureScene
          };
        });
        setArchivedChats(parsedSessions);
      } catch (error) {
        console.error('Error loading chat sessions:', error);
        setArchivedChats([]);
      }
    };

    loadInsights();
    loadChatSessions();
  }, []);

  // Group insights by date
  useEffect(() => {
    const grouped = insights.reduce((acc, insight) => {
      const dateKey = format(insight.createdAt, 'yyyy-MM-dd');
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(insight);
      return acc;
    }, {} as { [key: string]: InsightCardType[] });

    setGroupedInsights(grouped);
  }, [insights]);

  // Filter insights based on search and filter criteria
  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.quote.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'favorites' && insight.isPinned) || 
      (filter === 'morning' && insight.type === 'morning') ||
      (filter === 'evening' && insight.type === 'evening');
    
    return matchesSearch && matchesFilter;
  });

  // Get unique dates for the date filter
  const uniqueDates = Object.keys(groupedInsights).sort((a, b) => b.localeCompare(a));

  // Find related chat for an insight
  const findRelatedChat = useCallback((insightId: string, sessionId: string) => {
    const relatedChat = archivedChats.find(chat => 
      chat.id === sessionId || chat.insightCardId === insightId
    );
    return relatedChat;
  }, [archivedChats]);

  // Handle toggling pin status for an insight
  const handleTogglePin = (insightId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const updatedInsights = insights.map(insight => 
      insight.id === insightId 
        ? { ...insight, isPinned: !insight.isPinned }
        : insight
    );
    
    setInsights(updatedInsights);
    localStorage.setItem('insight-cards', JSON.stringify(updatedInsights));
  };

  // Handle deleting an insight
  const handleDeleteInsight = (insightId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDeleting(insightId);
    
    setTimeout(() => {
      const updatedInsights = insights.filter(insight => insight.id !== insightId);
      setInsights(updatedInsights);
      localStorage.setItem('insight-cards', JSON.stringify(updatedInsights));
      setIsDeleting(null);
    }, 300);
  };

  // Handle clicking an insight to expand it
  const handleInsightClick = (insight: InsightCardType) => {
    setExpandedInsight(insight);
    setShowRelatedChat(false);
    
    // Set the background based on the insight's scene
    if (insight.sceneType) {
      setExpandedBackground(insight.sceneType);
    }
    
    // Check for related chat
    if (insight.sessionId) {
      const chat = findRelatedChat(insight.id, insight.sessionId);
      setRelatedChat(chat || null);
    } else {
      setRelatedChat(null);
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
    setRelatedChat(null);
    setShowRelatedChat(false);
  };

  // Handle navigating to the related chat session
  const handleViewRelatedChat = (sessionId: string) => {
    navigate(`/chat-session/${sessionId}`);
  };

  // Handle going back to insights page
  const handleBack = () => {
    navigate('/insights');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <NatureVideoBackground 
        scene={expandedInsight ? (expandedInsight.sceneType || currentScene) : currentScene} 
        timeOfDay={timeOfDay.period === 'morning' ? 'morning' : 'evening'} 
      />

      <div className="absolute inset-0 z-10">
        <div className={`absolute inset-0 ${
          timeOfDay.period === 'morning' 
            ? 'bg-white/10' 
            : 'bg-black/20'
        }`} />

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
          <UniversalNavigation
            customControls={
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
                  <Grid className="w-4 h-4" />
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
                  <List className="w-4 h-4" />
                </button>
              </div>
            }
            onNavigateHome={handleBack}
          />
        </div>

        {/* Main Content */}
        <div 
          ref={containerRef}
          className="h-screen pt-24 pb-20 overflow-y-auto"
        >
          <div className="px-6 pt-4 pb-6 text-center">
            <h1 className={`text-3xl font-bold mb-2 ${
              timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Your Insight Gallery
            </h1>
            <p className={`${
              timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
            }`}>
              Explore your collection of mindful reflections
            </p>
          </div>
        
          {/* Search and Filters */}
          <div className="px-6 pb-4 sticky top-0 z-40 backdrop-blur-md bg-white/5">
            <div className="max-w-6xl mx-auto">
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <input
                  type="text"
                  placeholder="Search insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                    timeOfDay.period === 'morning'
                      ? 'bg-white/20 text-gray-800 placeholder-gray-600'
                      : 'bg-white/10 text-white placeholder-gray-400'
                  } focus:outline-none focus:ring-2 focus:ring-white/30`}
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { key: 'all', label: 'All', icon: Filter },
                  { key: 'morning', label: 'Morning', icon: Sun },
                  { key: 'evening', label: 'Evening', icon: Moon },
                  { key: 'favorites', label: 'Favorites', icon: Star }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                      filter === key
                        ? (timeOfDay.period === 'morning'
                            ? 'bg-white/30 text-gray-800'
                            : 'bg-white/20 text-white')
                        : (timeOfDay.period === 'morning'
                            ? 'bg-white/10 text-gray-600 hover:bg-white/20'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10')
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>

              {/* Date Filter for List View */}
              {layout === 'list' && uniqueDates.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedDate(null)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                      selectedDate === null
                        ? (timeOfDay.period === 'morning'
                            ? 'bg-white/30 text-gray-800'
                            : 'bg-white/20 text-white')
                        : (timeOfDay.period === 'morning'
                            ? 'bg-white/10 text-gray-600 hover:bg-white/20'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10')
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">All Dates</span>
                  </button>
                  {uniqueDates.slice(0, 5).map((date) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                        selectedDate === date
                          ? (timeOfDay.period === 'morning'
                              ? 'bg-white/30 text-gray-800'
                              : 'bg-white/20 text-white')
                          : (timeOfDay.period === 'morning'
                              ? 'bg-white/10 text-gray-600 hover:bg-white/20'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10')
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {format(new Date(date), 'MMM d')}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expanded Insight Modal */}
          <AnimatePresence>
            {expandedInsight && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} 
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative w-full max-w-md mb-4"
                >
                  <InsightCard 
                    insight={expandedInsight} 
                    isExpanded={true}
                    onClose={handleCloseExpanded}
                  />

                  {/* Related Chat Section */}
                  {relatedChat && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className={`mt-6 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                        timeOfDay.period === 'morning'
                          ? 'bg-white/20 hover:bg-white/30 text-gray-800'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      } w-full`}
                    >
                      <button 
                        onClick={() => setShowRelatedChat(!showRelatedChat)} 
                        className="w-full flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5" />
                          <span>Original Conversation</span>
                        </div>
                        {showRelatedChat ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                      
                      {/* Conversation Preview */}
                      {showRelatedChat && (
                        <div className="mt-4 max-h-[300px] overflow-y-auto rounded-xl">
                          {relatedChat.messages.length > 0 ? (
                            <div className="space-y-3">
                              {relatedChat.messages.slice(0, 6).map((message, idx) => (
                                <div 
                                  key={idx}
                                  className={`p-3 rounded-xl ${
                                    message.role === 'user' 
                                      ? 'ml-6 bg-white/20 text-right'
                                      : 'mr-6 bg-black/20'
                                  }`}
                                >
                                  <p className={`text-sm ${
                                    timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                                  }`}>
                                    {message.content}
                                  </p>
                                </div>
                              ))}
                              
                              {relatedChat.messages.length > 6 && (
                                <div className="text-center py-2">
                                  <button
                                    onClick={() => handleViewRelatedChat(relatedChat.id)}
                                    className={`px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                                      timeOfDay.period === 'morning'
                                        ? 'bg-white/20 hover:bg-white/30 text-gray-800'
                                        : 'bg-white/10 hover:bg-white/20 text-white'
                                    }`}
                                  >
                                    View Full Conversation
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className={`${
                                timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-white/80'
                              }`}>
                                No messages available
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Insights Content */}
          <div className="px-6 pb-16">
            <div className="max-w-6xl mx-auto">
              {filteredInsights.length === 0 ? (
                <div className="text-center py-20">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm ${
                    timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
                  } border border-white/20 mx-auto`}>
                    <Sparkles className={`w-10 h-10 ${
                      timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-white'
                    }`} />
                  </div>
                  
                  <h3 className={`text-2xl font-semibold mb-4 ${
                    timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    No insights found
                  </h3>
                  
                  <p className={`text-lg ${
                    timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    {searchTerm || filter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Start a conversation to create your first insight'
                    }
                  </p>
                </div>
              ) : (
                <>
                  {/* Grid Layout */}
                  {layout === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredInsights.map((insight) => (
                        <motion.div
                          key={insight.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          transition={{ duration: 0.3 }}
                          className={`${isDeleting === insight.id ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <InsightCard 
                            insight={insight} 
                            onClick={() => handleInsightClick(insight)}
                            onTogglePin={(e) => handleTogglePin(insight.id, e)}
                            onDelete={(e) => handleDeleteInsight(insight.id, e)}
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
                          className={`p-5 rounded-2xl backdrop-blur-sm border ${
                            timeOfDay.period === 'morning' 
                              ? `bg-white/20 hover:bg-white/30 ${insight.isPinned ? 'border-amber-400/50' : 'border-white/20'}` 
                              : `bg-white/10 hover:bg-white/20 ${insight.isPinned ? 'border-purple-400/50' : 'border-white/20'}`
                          } transition-all duration-200 hover:shadow-lg cursor-pointer ${
                          } ${isDeleting === insight.id ? 'opacity-50 pointer-events-none' : ''}`}
                          onClick={() => handleInsightClick(insight)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl ${
                                insight.type === 'morning'
                                  ? 'bg-amber-500/20 text-amber-600'
                                  : 'bg-purple-500/20 text-purple-400'
                              }`}>
                                {insight.type === 'morning' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className={`text-sm ${
                                    timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-white/70'
                                  }`}>
                                    {format(new Date(insight.createdAt), 'MMM d, yyyy • h:mm a')}
                                  </p>
                                  {insight.isPinned && (
                                    <Star className={`w-4 h-4 fill-current ${
                                      timeOfDay.period === 'morning' ? 'text-amber-500' : 'text-amber-400'
                                    }`} />
                                  )}
                                </div>
                                <p className={`text-lg font-medium line-clamp-2 mt-1 ${
                                  timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                                }`}>
                                  "{insight.quote}"
                                </p>
                                
                                {/* Scene info and connection to chat */}
                                <div className="mt-2 flex items-center gap-3">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    timeOfDay.period === 'morning' 
                                      ? 'bg-white/20 text-gray-700' 
                                      : 'bg-white/10 text-white/70'
                                  }`}>
                                    {getSceneDisplayName(insight.sceneType)}
                                  </span>
                                  
                                  {insight.sessionId && findRelatedChat(insight.id, insight.sessionId) && (
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                      timeOfDay.period === 'morning' 
                                        ? 'bg-green-500/20 text-green-700' 
                                        : 'bg-green-500/20 text-green-400'
                                    }`}>
                                      Linked conversation
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleTogglePin(insight.id, e)}
                                className={`p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                                  insight.isPinned
                                    ? (timeOfDay.period === 'morning'
                                        ? 'bg-amber-500/20 text-amber-600'
                                        : 'bg-amber-500/20 text-amber-400')
                                    : (timeOfDay.period === 'morning'
                                        ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                                        : 'bg-white/10 hover:bg-white/20 text-white')
                                }`}
                                title={insight.isPinned ? 'Unpin insight' : 'Pin insight'}
                              >
                                <Star className={`w-4 h-4 ${insight.isPinned ? 'fill-current' : ''}`} />
                              </button>
                              
                              {insight.sessionId && findRelatedChat(insight.id, insight.sessionId) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewRelatedChat(insight.sessionId);
                                  }}
                                  className={`p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                                    timeOfDay.period === 'morning'
                                      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-700'
                                      : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                                  }`}
                                  title="View original conversation"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* List Layout - All Dates */}
                  {layout === 'list' && !selectedDate && (
                    <div className="space-y-8">
                      {uniqueDates.map((date) => (
                        <div key={date}>
                          <h3 className={`text-xl font-semibold mb-4 ${
                            timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                          }`}>
                            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                          </h3>
                          <div className="space-y-4">
                            {groupedInsights[date].map((insight) => (
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
                                          {format(insight.createdAt, 'h:mm a')}
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
                                  
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => handleTogglePin(insight.id, e)}
                                      className={`p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                                        insight.isPinned
                                          ? (timeOfDay.period === 'morning'
                                              ? 'bg-amber-500/20 text-amber-600'
                                              : 'bg-amber-500/20 text-amber-400')
                                          : (timeOfDay.period === 'morning'
                                              ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                                              : 'bg-white/10 hover:bg-white/20 text-white')
                                      }`}
                                      title={insight.isPinned ? 'Unpin insight' : 'Pin insight'}
                                    >
                                      <Star className={`w-4 h-4 ${insight.isPinned ? 'fill-current' : ''}`} />
                                    </button>
                                    
                                    <button
                                      onClick={(e) => handleDeleteInsight(insight.id, e)}
                                      className={`p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                                        timeOfDay.period === 'morning'
                                          ? 'bg-white/20 hover:bg-red-500/20 text-gray-700 hover:text-red-600'
                                          : 'bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400'
                                      }`}
                                      title="Delete insight"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Privacy Notice - Bottom of page */}
          <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[5]">
            <p className={`text-xs backdrop-blur-sm px-2 py-1 rounded-full ${
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