import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArchivedChatSession } from '../types';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession, getSceneDisplayName } from '../utils/sceneUtils';
import NatureVideoBackground from '../components/NatureVideoBackground';
import { ArrowLeft, Search, MessageCircle, Clock, Calendar, Filter, Sparkles, Sun, Moon, Copy, Download, Check } from 'lucide-react';
import { format } from 'date-fns';

const ChatArchive: React.FC = () => {
  const navigate = useNavigate();
  const [archivedSessions, setArchivedSessions] = useState<ArchivedChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'morning' | 'evening'>('all');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  const timeOfDay = getTimeOfDay();
  const currentScene = getSceneForSession(timeOfDay.period === 'morning' ? 'morning' : 'evening');

  useEffect(() => {
    // Load archived sessions from localStorage
    const savedSessions = JSON.parse(localStorage.getItem('komorebi-chat-sessions') || '[]');
    const parsedSessions = savedSessions.map((session: any) => ({
      ...session,
      createdAt: new Date(session.createdAt),
    }));
    
    // Sort by date (newest first)
    parsedSessions.sort((a: ArchivedChatSession, b: ArchivedChatSession) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
    
    setArchivedSessions(parsedSessions);
  }, []);

  // Filter and search sessions
  const filteredSessions = archivedSessions.filter(session => {
    const matchesFilter = filter === 'all' || session.type === filter;
    const matchesSearch = searchQuery === '' || 
      session.messages.some(message => 
        message.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  const handleBack = () => {
    navigate('/insights');
  };

  const toggleSessionExpansion = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  const handleCopyChat = async (session: ArchivedChatSession) => {
    try {
      const chatText = `${session.type === 'morning' ? 'Morning Intention' : 'Evening Reflection'} - ${format(session.createdAt, 'MMM d, yyyy')}\n\n${session.messages.map(msg => `${msg.role === 'user' ? 'You' : 'Komorebi'}: ${msg.content}`).join('\n\n')}`;
      
      await navigator.clipboard.writeText(chatText);
      setCopiedSessionId(session.id);
      setTimeout(() => setCopiedSessionId(null), 2000);
    } catch (error) {
      console.error('Failed to copy chat:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      const chatText = `${session.type === 'morning' ? 'Morning Intention' : 'Evening Reflection'} - ${format(session.createdAt, 'MMM d, yyyy')}\n\n${session.messages.map(msg => `${msg.role === 'user' ? 'You' : 'Komorebi'}: ${msg.content}`).join('\n\n')}`;
      textArea.value = chatText;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
    }
  };

  const highlightSearchText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className={`${
          timeOfDay.period === 'morning' 
            ? 'bg-amber-300/50 text-amber-900' 
            : 'bg-purple-300/50 text-purple-900'
        } px-1 rounded`}>
          {part}
        </mark>
      ) : part
    );
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
          Chat Archive
        </div>
        
        <div className="w-11" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Search and Filter */}
          <div className={`p-4 rounded-2xl mb-6 backdrop-blur-sm border border-white/20 ${
            timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
          }`}>
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your conversations..."
                className={`w-full pl-10 pr-4 py-3 rounded-xl border-0 transition-all duration-200 placeholder-opacity-70 ${
                  timeOfDay.period === 'morning'
                    ? 'bg-white/30 text-gray-800 placeholder-gray-600 focus:bg-white/40'
                    : 'bg-black/20 text-white placeholder-gray-300 focus:bg-black/30'
                } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30`}
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-4">
              <Filter className={`w-5 h-5 ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <div className="flex gap-2">
                {(['all', 'morning', 'evening'] as const).map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 capitalize flex items-center gap-2 ${
                      filter === filterType
                        ? (timeOfDay.period === 'morning'
                            ? 'bg-amber-500 text-white'
                            : 'bg-purple-600 text-white')
                        : (timeOfDay.period === 'morning'
                            ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                            : 'bg-white/10 hover:bg-white/20 text-gray-300')
                    } backdrop-blur-sm`}
                  >
                    {filterType === 'morning' && <Sun className="w-4 h-4" />}
                    {filterType === 'evening' && <Moon className="w-4 h-4" />}
                    {filterType === 'all' && <MessageCircle className="w-4 h-4" />}
                    {filterType}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sessions List */}
          {filteredSessions.length > 0 ? (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <motion.div
                  key={session.id}
                  className={`p-6 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 cursor-pointer ${
                    timeOfDay.period === 'morning' ? 'bg-white/20 hover:bg-white/30' : 'bg-white/10 hover:bg-white/20'
                  }`}
                  onClick={() => toggleSessionExpansion(session.id)}
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {/* Session Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {session.type === 'morning' ? (
                        <Sun className={`w-5 h-5 ${
                          timeOfDay.period === 'morning' ? 'text-amber-600' : 'text-amber-400'
                        }`} />
                      ) : (
                        <Moon className={`w-5 h-5 ${
                          timeOfDay.period === 'morning' ? 'text-purple-600' : 'text-purple-400'
                        }`} />
                      )}
                      <div>
                        <h3 className={`font-semibold ${
                          timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                        }`}>
                          {session.type === 'morning' ? 'Morning Intention' : 'Evening Reflection'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`flex items-center gap-1 ${
                            timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                          }`}>
                            <Calendar className="w-4 h-4" />
                            {format(session.createdAt, 'MMM d, yyyy')}
                          </span>
                          <span className={`flex items-center gap-1 ${
                            timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                          }`}>
                            <MessageCircle className="w-4 h-4" />
                            {session.messageCount} messages
                          </span>
                          {session.duration && (
                            <span className={`flex items-center gap-1 ${
                              timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                            }`}>
                              <Clock className="w-4 h-4" />
                              {session.duration}m
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className={`text-sm px-3 py-1 rounded-full backdrop-blur-sm ${
                      session.type === 'morning'
                        ? 'bg-amber-500/20 text-amber-700 border border-amber-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {getSceneDisplayName(session.sceneType)}
                    </div>
                  </div>

                  {/* Session Preview */}
                  <div className={`text-sm ${
                    timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-gray-200'
                  }`}>
                    {session.messages.length > 0 && (
                      <p className="line-clamp-2">
                        {highlightSearchText(session.messages[0].content, searchQuery)}
                      </p>
                    )}
                  </div>

                  {/* Expanded Messages */}
                  {expandedSession === session.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-white/20"
                    >
                      <div className="space-y-3">
                        {session.messages.map((message, index) => (
                          <div key={index} className={`p-3 rounded-xl ${
                            message.role === 'user'
                              ? (timeOfDay.period === 'morning'
                                  ? 'bg-white/20 ml-8'
                                  : 'bg-white/10 ml-8')
                              : (timeOfDay.period === 'morning'
                                  ? 'bg-black/10 mr-8'
                                  : 'bg-black/20 mr-8')
                          }`}>
                            <div className={`text-xs font-medium mb-1 ${
                              timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {message.role === 'user' ? 'You' : 'Komorebi'}
                            </div>
                            <p className={`text-sm ${
                              timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-gray-200'
                            }`}>
                              {highlightSearchText(message.content, searchQuery)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className={`p-12 rounded-2xl text-center backdrop-blur-sm border border-white/20 ${
              timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
            }`}>
              {searchQuery ? (
                <>
                  <Search className={`w-16 h-16 mx-auto mb-4 ${
                    timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <h3 className={`text-xl font-semibold mb-2 ${
                    timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    No matches found
                  </h3>
                  <p className={`mb-4 ${
                    timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      timeOfDay.period === 'morning'
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <MessageCircle className={`w-16 h-16 mx-auto mb-4 ${
                    timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <h3 className={`text-xl font-semibold mb-2 ${
                    timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    No conversations yet
                  </h3>
                  <p className={`mb-6 ${
                    timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    Your past conversations will appear here once you complete your first session.
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 backdrop-blur-sm ${
                      timeOfDay.period === 'morning'
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    Start Your First Conversation
                  </button>
                </>
              )}
            </div>
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
  );
};

export default ChatArchive;