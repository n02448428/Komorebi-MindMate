import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { InsightCard as InsightCardType, NatureScene, ArchivedChatSession } from '../types';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession, natureScenes } from '../utils/sceneUtils';
import { useAuth } from '../context/AuthContext';
import NatureVideoBackground from '../components/NatureVideoBackground';
import InsightCard from '../components/InsightCard';
import { ArrowLeft, Sparkles, Calendar, Filter, Archive, MessageCircle, Clock, Shield, ChevronRight } from 'lucide-react';

const InsightsGallery: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [insights, setInsights] = useState<InsightCardType[]>([]);
  const [filter, setFilter] = useState<'all' | 'morning' | 'evening'>('all');
  const [selectedCard, setSelectedCard] = useState<InsightCardType | null>(null);
  const [showSessionArchive, setShowSessionArchive] = useState(false);
  const [archivedSessions, setArchivedSessions] = useState<ArchivedChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ArchivedChatSession | null>(null);

  const timeOfDay = getTimeOfDay();
  const currentScene = getSceneForSession(timeOfDay.period === 'morning' ? 'morning' : 'evening');

  useEffect(() => {
    // Load insights from localStorage
    const savedInsights = JSON.parse(localStorage.getItem('insight-cards') || '[]');
    const parsedInsights = savedInsights.map((insight: any) => ({
      ...insight,
      createdAt: new Date(insight.createdAt),
      // Validate and fix sceneType if it's missing or invalid
      sceneType: insight.sceneType && Object.keys(natureScenes).includes(insight.sceneType) 
        ? insight.sceneType 
        : 'ocean' as NatureScene
    }));
    
    // Sort by date (newest first)
    parsedInsights.sort((a: InsightCardType, b: InsightCardType) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
    
    setInsights(parsedInsights);

    // Load archived sessions if user is logged in
    if (user) {
      loadArchivedSessions();
    }
  }, []);

  const loadArchivedSessions = () => {
    if (!user) return;

    const savedSessions = JSON.parse(localStorage.getItem('komorebi-chat-sessions') || '[]');
    const parsedSessions = savedSessions.map((session: any) => ({
      ...session,
      createdAt: new Date(session.createdAt),
      messages: session.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));

    // Apply retention filter based on user type
    const now = new Date();
    const retentionDays = user.isPro ? 365 * 10 : 7;
    const cutoffDate = new Date(now.getTime() - (retentionDays * 24 * 60 * 60 * 1000));
    
    const filteredSessions = parsedSessions.filter((session: ArchivedChatSession) => 
      session.createdAt > cutoffDate
    );

    // Sort by date (newest first)
    filteredSessions.sort((a: ArchivedChatSession, b: ArchivedChatSession) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );

    setArchivedSessions(filteredSessions);
  };

  const filteredInsights = insights.filter(insight => 
    filter === 'all' || insight.type === filter
  );

  const morningCount = insights.filter(i => i.type === 'morning').length;
  const eveningCount = insights.filter(i => i.type === 'evening').length;

  const handleBack = () => {
    navigate('/');
  };

  const handleExportData = () => {
    if (!user) return;

    const insights = JSON.parse(localStorage.getItem('insight-cards') || '[]');
    const sessions = JSON.parse(localStorage.getItem('komorebi-chat-sessions') || '[]');
    const limits = JSON.parse(localStorage.getItem('session-limits') || '{}');
    
    const exportData = {
      insights,
      archivedSessions: sessions,
      sessionLimits: limits,
      exportDate: new Date().toISOString(),
      userEmail: user.email,
      userType: user.isPro ? 'Pro' : 'Free'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `komorebi-complete-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
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
          Your Insights
        </div>
        
        <div className="w-11" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Stats */}
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
              <Sparkles className={`w-8 h-8 mx-auto mb-2 ${
                timeOfDay.period === 'morning' ? 'text-amber-600' : 'text-amber-400'
              }`} />
              <div className={`text-2xl font-bold ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                {morningCount}
              </div>
              <div className={`text-sm ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Morning Insights
              </div>
            </div>

            <div className={`p-6 rounded-2xl text-center backdrop-blur-sm border border-white/20 ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              <Sparkles className={`w-8 h-8 mx-auto mb-2 ${
                timeOfDay.period === 'morning' ? 'text-purple-600' : 'text-purple-400'
              }`} />
              <div className={`text-2xl font-bold ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                {eveningCount}
              </div>
              <div className={`text-sm ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Evening Reflections
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className={`p-4 rounded-2xl mb-6 backdrop-blur-sm border border-white/20 ${
            timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
          }`}>
            <div className="flex items-center gap-4">
              <Filter className={`w-5 h-5 ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <div className="flex gap-2">
                {(['all', 'morning', 'evening'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 capitalize ${
                      filter === filterType
                        ? (timeOfDay.period === 'morning'
                            ? 'bg-amber-500 text-white'
                            : 'bg-purple-600 text-white')
                        : (timeOfDay.period === 'morning'
                            ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                            : 'bg-white/10 hover:bg-white/20 text-gray-300')
                    } backdrop-blur-sm`}
                  >
                    {filterType === 'all' ? 'all' : filterType === 'morning' ? 'morning' : 'evening'}
                  </button>
                ))}
              </div>
              
              {/* Session Archive Button */}
              {user && (
                <button
                  onClick={() => setShowSessionArchive(!showSessionArchive)}
                  className={`ml-auto px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                    showSessionArchive
                      ? (timeOfDay.period === 'morning'
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-600 text-white')
                      : (timeOfDay.period === 'morning'
                          ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                          : 'bg-white/10 hover:bg-white/20 text-gray-300')
                  } backdrop-blur-sm`}
                >
                  <Archive className="w-4 h-4" />
                  Session Archive
                </button>
              )}
            </div>
          </div>

          {/* Data Privacy Notice */}
          {user && (
            <div className={`p-4 rounded-2xl border border-white/20 backdrop-blur-sm mb-6 ${
              timeOfDay.period === 'morning' ? 'bg-blue-500/10' : 'bg-blue-600/10'
            }`}>
              <div className="flex items-start gap-3">
                <Shield className={`w-5 h-5 mt-0.5 ${
                  timeOfDay.period === 'morning' ? 'text-blue-600' : 'text-blue-400'
                }`} />
                <div>
                  <h4 className={`font-semibold mb-1 ${
                    timeOfDay.period === 'morning' ? 'text-blue-800' : 'text-blue-300'
                  }`}>
                    Your Data Belongs to You
                  </h4>
                  <p className={`text-sm ${
                    timeOfDay.period === 'morning' ? 'text-blue-700' : 'text-blue-200'
                  }`}>
                    All conversations and insights are stored locally on your device. 
                    We never access your private reflections.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Insights Grid */}
          {filteredInsights.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInsights.map((insight) => (
                selectedCard?.id === insight.id ? (
                  // Placeholder to maintain grid layout when card is expanded
                  <div 
                    key={`placeholder-${insight.id}`}
                    className="aspect-[2/3] rounded-2xl opacity-0"
                    aria-hidden="true"
                  />
                ) : (
                  <motion.div 
                    key={insight.id} 
                    layoutId={`card-${insight.id}`}
                    className="animate-fade-in cursor-pointer"
                    onClick={() => setSelectedCard(insight)}
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <InsightCard insight={insight} />
                  </motion.div>
                )
              ))}
            </div>
          ) : (
          )}

            {/* Session Archive Section */}
            <AnimatePresence>
              {showSessionArchive && user && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-8 overflow-hidden"
                >
                  <div className={`p-6 rounded-2xl backdrop-blur-sm border border-white/20 ${
                    timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
                  }`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-xl font-semibold ${
                        timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                      }`}>
                        Conversation Archive
                      </h3>
                      <button
                        onClick={handleExportData}
                        className={`px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 text-sm font-medium ${
                          timeOfDay.period === 'morning'
                            ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        Export Data
                      </button>
                    </div>
                    
                    <div className={`text-xs mb-4 p-3 rounded-xl border border-white/20 ${
                      timeOfDay.period === 'morning' 
                        ? 'bg-blue-500/10 text-blue-700' 
                        : 'bg-blue-600/10 text-blue-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">
                          Retention Policy: {user.isPro ? 'Unlimited history' : '7 days for free users'}
                        </span>
                      </div>
                    </div>

                    {archivedSessions.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {archivedSessions.map((session) => (
                          <div
                            key={session.id}
                            className={`p-4 rounded-xl backdrop-blur-sm border border-white/20 cursor-pointer transition-all duration-200 ${
                              timeOfDay.period === 'morning'
                                ? 'bg-white/10 hover:bg-white/20'
                                : 'bg-black/10 hover:bg-black/20'
                            } ${selectedSession?.id === session.id ? 'ring-2 ring-white/30' : ''}`}
                            onClick={() => setSelectedSession(selectedSession?.id === session.id ? null : session)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  session.type === 'morning' 
                                    ? 'bg-amber-500' 
                                    : 'bg-purple-500'
                                }`} />
                                <div>
                                  <div className={`font-medium text-sm ${
                                    timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                                  }`}>
                                    {session.type === 'morning' ? 'Morning Intention' : 'Evening Reflection'}
                                  </div>
                                  <div className={`text-xs ${
                                    timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                                  }`}>
                                    {session.createdAt.toLocaleDateString()} • {session.messageCount} messages
                                    {session.duration && ` • ${session.duration}min`}
                                  </div>
                                </div>
                              </div>
                              <MessageCircle className={`w-4 h-4 ${
                                timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-400'
                              }`} />
                            </div>
                            
                            {/* Expanded Session View */}
                            {selectedSession?.id === session.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-4 pt-4 border-t border-white/20"
                              >
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                  {session.messages.map((message, index) => (
                                    <div key={index} className={`text-xs ${
                                      message.role === 'user' ? 'text-right' : 'text-left'
                                    }`}>
                                      <div className={`inline-block p-2 rounded-lg max-w-[80%] ${
                                        message.role === 'user'
                                          ? (timeOfDay.period === 'morning' 
                                              ? 'bg-amber-500/20 text-gray-800' 
                                              : 'bg-purple-500/20 text-white')
                                          : (timeOfDay.period === 'morning' 
                                              ? 'bg-gray-500/20 text-gray-700' 
                                              : 'bg-gray-600/20 text-gray-200')
                                      }`}>
                                        {message.content}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Archive className={`w-12 h-12 mx-auto mb-3 ${
                          timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                        <p className={`${
                          timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                        }`}>
                          No archived sessions yet. Complete a conversation to see it here.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            /* Empty State */
          ) : (
            <div className={`p-12 rounded-2xl text-center backdrop-blur-sm border border-white/20 ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              <Sparkles className={`w-16 h-16 mx-auto mb-4 ${
                timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                {filter === 'all' ? 'No insights yet' : `No ${filter} insights yet`}
              </h3>
              <p className={`mb-6 ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Complete your first session to see insights here.
              </p>
              <button
                onClick={handleBack}
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

      {/* Full-Screen Card Display */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-8"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedCard(null);
              }
            }}
          >
            <motion.div
              layoutId={`card-${selectedCard.id}`}
              className="relative w-[400px] h-[600px] max-w-[90vw] max-h-[90vh]"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              initial={false}
            >
              <InsightCard 
                insight={selectedCard} 
                isExpanded={true}
                onClose={() => setSelectedCard(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InsightsGallery;