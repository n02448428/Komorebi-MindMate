import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArchivedChatSession, InsightCard as InsightCardType } from '../types';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession, getSceneDisplayName } from '../utils/sceneUtils';
import NatureVideoBackground from '../components/NatureVideoBackground';
import InsightCard from '../components/InsightCard';
import UniversalNavigation from '../components/UniversalNavigation';
import { ArrowLeft, Search, MessageCircle, Clock, Calendar, Filter, Sparkles, Sun, Moon, Copy, Download, Check, Trash2, RefreshCw } from 'lucide-react';
import { format, isValid } from 'date-fns';

const ChatArchive: React.FC = () => {
  const navigate = useNavigate();
  const [archivedSessions, setArchivedSessions] = useState<ArchivedChatSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'morning' | 'evening'>('all');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [jumpToSessionId, setJumpToSessionId] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightCardType[]>([]);
  const [currentScene, setCurrentScene] = useState<string>(getSceneForSession(timeOfDay.period === 'morning' ? 'morning' : 'evening'));

  const timeOfDay = getTimeOfDay();

  // Setup a ref for expanded session to scroll to
  const expandedSessionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load archived sessions from localStorage
    const loadArchivedSessions = () => {
      try {
        const savedSessions = localStorage.getItem('komorebi-chat-sessions');
        if (savedSessions) {
          const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
            ...session,
            createdAt: new Date(session.createdAt)
          }));
          // Sort by creation date (newest first)
          parsedSessions.sort((a: ArchivedChatSession, b: ArchivedChatSession) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setArchivedSessions(parsedSessions);
        }
      } catch (error) {
        console.error('Error loading archived sessions:', error);
      }
    };

    // Load insights from localStorage
    const loadInsights = () => {
      try {
        const savedInsights = localStorage.getItem('insight-cards');
        if (savedInsights) {
          const parsedInsights = JSON.parse(savedInsights).map((insight: any) => ({
            ...insight,
            createdAt: new Date(insight.createdAt)
          }));
          setInsights(parsedInsights);
        }
      } catch (error) {
        console.error('Error loading insights:', error);
      }
    };
    
    // Check if we need to jump to a specific session
    const checkForJumpToSession = () => {
      const sessionId = sessionStorage.getItem('jump-to-chat-session');
      if (sessionId) {
        setJumpToSessionId(sessionId);
        sessionStorage.removeItem('jump-to-chat-session');
      }
    };

    loadArchivedSessions();
    loadInsights();
    checkForJumpToSession();
  }, []);

  // Effect to handle auto-expanding the target session
  useEffect(() => {
    if (jumpToSessionId && archivedSessions.length > 0) {
      setExpandedSession(jumpToSessionId);
      
      // Find the session to get its scene
      const session = archivedSessions.find(s => s.id === jumpToSessionId);
      if (session && session.sceneType) {
        setCurrentScene(session.sceneType);
      }
      
      // Wait for render then scroll
      setTimeout(() => {
        if (expandedSessionRef.current) {
          expandedSessionRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 300);
      
      setJumpToSessionId(null);
    }
  }, [jumpToSessionId, archivedSessions]);

  // Filter sessions based on search term and filter
  const filteredSessions = archivedSessions.filter(session => {
    const matchesSearch = searchTerm === '' || 
      session.messages.some(message => 
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesFilter = filter === 'all' || session.type === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getSessionTypeGradient = () => {
    return timeOfDay.period === 'morning' 
      ? 'from-transparent via-white/5 to-white/10'
      : 'from-transparent via-black/5 to-black/10';
  };

  const handleBack = () => {
    navigate('/');
  };

  const toggleExpanded = (sessionId: string) => {
    // If clicking on already expanded session, collapse it
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      return;
    }
    
    // Otherwise expand the clicked session
    setExpandedSession(sessionId);
    
    // Set the background scene to match the session's
    const session = archivedSessions.find(s => s.id === sessionId);
    if (session && session.sceneType) {
      setCurrentScene(session.sceneType);
    }
  };

  const handleCopySession = async (session: ArchivedChatSession) => {
    const sessionText = `${session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session - ${format(new Date(session.createdAt), 'MMMM d, yyyy')}\n\n${session.messages.map(msg => `${msg.role === 'user' ? 'You' : 'Komorebi'}: ${msg.content}`).join('\n\n')}`;
    
    try {
      await navigator.clipboard.writeText(sessionText);
      setCopiedSessionId(session.id);
      setTimeout(() => setCopiedSessionId(null), 2000);
    } catch (error) {
      console.error('Failed to copy session:', error);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (deletingSessionId === sessionId) {
      // Confirm deletion
      const updatedSessions = archivedSessions.filter(session => session.id !== sessionId);
      setArchivedSessions(updatedSessions);

      // Update localStorage
      localStorage.setItem('komorebi-chat-sessions', JSON.stringify(updatedSessions));
      
      // If we're showing an expanded session that's being deleted, close it
      if (expandedSession === sessionId) {
        setExpandedSession(null);
      }
      
      setDeletingSessionId(null);
    } else {
      // First click - show confirmation
      setDeletingSessionId(sessionId);
      setTimeout(() => setDeletingSessionId(null), 3000); // Auto-cancel after 3 seconds
    }
  };

  const handleDownloadSession = (session: ArchivedChatSession) => {
    const sessionText = `${session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session - ${format(new Date(session.createdAt), 'MMMM d, yyyy')}\n\n${session.messages.map(msg => `${msg.role === 'user' ? 'You' : 'Komorebi'}: ${msg.content}`).join('\n\n')}`;
    
    const blob = new Blob([sessionText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `komorebi-${session.type}-${format(new Date(session.createdAt), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video - uses the scene from the expanded session or default */}
      <NatureVideoBackground 
        scene={currentScene}
        timeOfDay={timeOfDay.period === 'morning' ? 'morning' : 'evening'}
        className="absolute inset-0 z-0"
      />
      
      {/* Content */}
      <div className="relative z-20 min-h-screen">
        {/* Header */}
        <UniversalNavigation onNavigateHome={handleBack} />

        <div className="p-6 pt-24 border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h1 className={`text-3xl font-bold mb-2 ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Conversation Archive
              </h1>
              <p className={`${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Browse through your past reflections and insights
              </p>
            </div>
            
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-white/50'
              }`} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 ${
                  timeOfDay.period === 'morning'
                    ? 'bg-white/20 text-gray-800 placeholder-gray-500'
                    : 'bg-white/10 text-white placeholder-white/50'
                }`}
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-white/50'
              }`} />
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'morning' | 'evening')}
                  className={`pl-10 pr-8 py-3 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 appearance-none cursor-pointer ${
                    timeOfDay.period === 'morning' 
                      ? 'bg-white/20 text-gray-800' 
                      : 'bg-white/10 text-white' 
                  }`}
                >
                  <option value="all">All Sessions</option>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className={`w-12 h-12 mx-auto mb-4 ${
                timeOfDay.period === 'morning' ? 'text-gray-400' : 'text-white/40'
              }`} />
              <h3 className={`text-xl font-medium mb-2 ${
                timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-white/80'
              }`}>
                No conversations found
              </h3>
              <p className={`${
                timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-white/60'
              }`}>
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter settings'
                  : 'Start your first session to see conversations here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  ref={session.id === expandedSession ? expandedSessionRef : null}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`rounded-2xl backdrop-blur-sm border border-white/20 overflow-hidden ${
                    timeOfDay.period === 'morning'
                      ? 'bg-white/20'
                      : 'bg-white/10'
                  }`}
                >
                  {/* Session Header */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-white/5 transition-colors duration-200"
                    onClick={() => toggleExpanded(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          session.type === 'morning' 
                            ? 'bg-amber-500/20 text-amber-600' 
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {session.type === 'morning' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </div>
                        
                        <div>
                          <h3 className={`text-lg font-medium ${
                            timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                          }`}>
                            {session.type === 'morning' ? 'Morning Intention' : 'Evening Reflection'}
                          </h3>
                          <div className={`flex items-center gap-4 text-sm ${
                            timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-white/70'
                          }`}>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {isValid(new Date(session.createdAt)) 
                                ? format(new Date(session.createdAt), 'MMMM d, yyyy')
                                : 'Invalid date'
                              }
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {session.duration ? `${Math.round(session.duration / 60)} min` : 'Unknown duration'}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {session.messageCount || session.messages.length} messages
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`transform transition-transform duration-200 ${
                        expandedSession === session.id ? 'rotate-180' : ''
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedSession === session.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-6 space-y-6">
                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 mb-4">
                          <button
                            onClick={() => handleCopySession(session)}
                            className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                              timeOfDay.period === 'morning'
                                ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                            title="Copy session"
                          >
                            {copiedSessionId === session.id ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDownloadSession(session)}
                            className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                              timeOfDay.period === 'morning'
                                ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                            title="Download session"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                              deletingSessionId === session.id
                                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30'
                                : timeOfDay.period === 'morning'
                                  ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                                  : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                            title={deletingSessionId === session.id ? "Click again to confirm deletion" : "Delete session"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Session Details */}
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Left Column - Messages */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <MessageCircle className={`w-5 h-5 ${
                                timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-white/70'
                              }`} />
                              <h3 className={`font-medium ${
                                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                              }`}>
                                Conversation
                              </h3>
                            </div>
                            
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                              {session.messages.map((message, index) => (
                                <div
                                  key={index}
                                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[85%] p-3 rounded-2xl ${
                                      message.role === 'user'
                                        ? (timeOfDay.period === 'morning'
                                            ? 'bg-white/25 text-gray-800'
                                            : 'bg-white/15 text-white')
                                        : (timeOfDay.period === 'morning'
                                            ? 'bg-black/10 text-gray-800'
                                            : 'bg-black/20 text-white')
                                    } ${message.role === 'user' ? 'rounded-br-lg' : 'rounded-bl-lg'}`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap">
                                      {message.content}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Right Column - Associated Insight */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className={`w-5 h-5 ${
                                timeOfDay.period === 'morning' ? 'text-amber-600' : 'text-purple-400'
                              }`} />
                              <h3 className={`font-medium ${
                                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                              }`}>
                                {session.insightCardId ? 'Associated Insight' : 'Session Details'}
                              </h3>
                            </div>
                            
                            {session.insightCardId ? (
                              <div>
                                {/* Find the associated insight card */}
                                {insights.find(insight => insight.id === session.insightCardId) ? (
                                  <div className="max-w-[300px] mx-auto">
                                    <InsightCard 
                                      insight={insights.find(insight => insight.id === session.insightCardId)!} 
                                    />
                                  </div>
                                ) : (
                                  <div className={`p-4 rounded-xl text-center ${
                                    timeOfDay.period === 'morning' 
                                      ? 'bg-white/10 text-gray-700'
                                      : 'bg-black/20 text-white/80'
                                  }`}>
                                    <p>Insight card not found</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className={`p-4 rounded-xl backdrop-blur-sm border border-white/10 ${
                                timeOfDay.period === 'morning' 
                                  ? 'bg-white/10' 
                                  : 'bg-black/10'
                              }`}>
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className={`${
                                      timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-white/80'
                                    }`}>Date</span>
                                    <span className={`${
                                      timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                                    }`}>
                                      {format(new Date(session.createdAt), 'MMMM d, yyyy')}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={`${
                                      timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-white/80'
                                    }`}>Time</span>
                                    <span className={`${
                                      timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                                    }`}>
                                      {format(new Date(session.createdAt), 'h:mm a')}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={`${
                                      timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-white/80'
                                    }`}>Duration</span>
                                    <span className={`${
                                      timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                                    }`}>
                                      {Math.round(session.duration / 60)} minutes
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={`${
                                      timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-white/80'
                                    }`}>Message Count</span>
                                    <span className={`${
                                      timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                                    }`}>
                                      {session.messages.length}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={`${
                                      timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-white/80'
                                    }`}>Scene</span>
                                    <span className={`${
                                      timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                                    }`}>
                                      {getSceneDisplayName(session.sceneType)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-50">
          <p className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm ${
            timeOfDay.period === 'morning' 
              ? 'text-white bg-black/10'
              : 'text-gray-900 bg-white/10'
          }`}>
            🔒 All data stored locally & privately on your device
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatArchive;