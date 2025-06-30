import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArchivedChatSession } from '../types';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession } from '../utils/sceneUtils';
import NatureVideoBackground from '../components/NatureVideoBackground';
import { ArrowLeft, Search, MessageCircle, Clock, Calendar, Filter, Sparkles, Sun, Moon, Copy, Download, Check, Trash2 } from 'lucide-react';
import { format, isValid } from 'date-fns';

const ChatArchive: React.FC = () => {
  const navigate = useNavigate();
  const [archivedSessions, setArchivedSessions] = useState<ArchivedChatSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'morning' | 'evening'>('all');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const timeOfDay = getTimeOfDay();
  const currentScene = getSceneForSession(timeOfDay.period === 'morning' ? 'morning' : 'evening');

  useEffect(() => {
    // Load archived sessions from localStorage
    const loadArchivedSessions = () => {
      try {
        const stored = localStorage.getItem('komorebi-chat-sessions');
        if (stored) {
          const sessions = JSON.parse(stored) as ArchivedChatSession[];
          // Sort by date, newest first
          const sortedSessions = sessions.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setArchivedSessions(sortedSessions);
        }
      } catch (error) {
        console.error('Error loading archived sessions:', error);
      }
    };

    loadArchivedSessions();
  }, []);

  const filteredSessions = archivedSessions.filter(session => {
    const matchesSearch = searchTerm === '' || 
      session.messages.some(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      session.insights?.some(insight =>
        insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.content.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter = filter === 'all' || session.type === filter;

    return matchesSearch && matchesFilter;
  });

  const handleBack = () => {
    navigate('/insights');
  };

  const toggleExpanded = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  const handleCopySession = async (session: ArchivedChatSession) => {
    try {
      const formattedSession = formatSessionForExport(session);
      await navigator.clipboard.writeText(formattedSession);
      setCopiedSessionId(session.id);
      setTimeout(() => setCopiedSessionId(null), 2000);
    } catch (error) {
      console.error('Failed to copy session:', error);
    }
  };

  const handleDownloadSession = (session: ArchivedChatSession) => {
    try {
      const formattedSession = formatSessionForExport(session);
      const blob = new Blob([formattedSession], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `komorebi-${session.type}-${format(session.createdAt, 'yyyy-MM-dd')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download session:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const session = archivedSessions.find(s => s.id === sessionId);
    if (!session) return;

    const confirmMessage = `Are you sure you want to delete this ${session.type} session from ${format(session.createdAt, 'MMM d, yyyy')}? This action cannot be undone.`;
    
    if (confirm(confirmMessage)) {
      setDeletingSessionId(sessionId);
      // Update state
      const updatedSessions = archivedSessions.filter(s => s.id !== sessionId);
      setArchivedSessions(updatedSessions);
      // Update localStorage
      localStorage.setItem('komorebi-chat-sessions', JSON.stringify(updatedSessions));
      setDeletingSessionId(null);
    }
  };

  const formatSessionForExport = (session: ArchivedChatSession): string => {
    const header = `Komorebi ${session.type === 'morning' ? 'Morning Intention' : 'Evening Reflection'}
Date: ${format(session.createdAt, 'MMMM d, yyyy')}
Time: ${format(session.createdAt, 'h:mm a')}
Duration: ${Math.round(session.duration / 60)} minutes

---

`;

    const messages = session.messages
      .map(msg => `${msg.role === 'user' ? 'You' : 'Komorebi'}: ${msg.content}`)
      .join('\n\n');

    const insights = session.insights && session.insights.length > 0
      ? `\n\n--- INSIGHTS ---\n\n${session.insights
          .map(insight => `${insight.title}\n${insight.content}`)
          .join('\n\n')}`
      : '';

    return header + messages + insights;
  };

  const getSessionTypeGradient = () => {
    switch (timeOfDay.period) {
      case 'morning':
        return 'from-amber-200/20 via-orange-100/10 to-yellow-200/20';
      case 'evening':
        return 'from-purple-900/30 via-indigo-800/20 to-blue-900/30';
      default:
        return 'from-blue-200/20 via-cyan-100/10 to-teal-200/20';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <NatureVideoBackground 
        scene={currentScene} 
        timeOfDay={timeOfDay.period === 'morning' ? 'morning' : 'evening'}
        className="absolute inset-0 z-0"
      />
      
      {/* Gradient Overlay */}
      <div className={`absolute inset-0 z-10 bg-gradient-to-br ${getSessionTypeGradient()}`} />
      
      {/* Content */}
      <div className="relative z-20 min-h-screen">
        {/* Header */}
        <div className="p-6 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105 ${
                timeOfDay.period === 'morning'
                  ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Insights</span>
            </button>

            <h1 className={`text-2xl font-light ${
              timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Chat Archive
            </h1>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-white/60'
              }`} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/30 ${
                  timeOfDay.period === 'morning'
                    ? 'bg-white/20 text-gray-800 placeholder-gray-500'
                    : 'bg-white/10 text-white placeholder-white/60'
                }`}
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-white/60'
              }`} />
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
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="p-6">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className={`w-12 h-12 mx-auto mb-4 ${
                timeOfDay.period === 'morning' ? 'text-gray-400' : 'text-white/40'
              }`} />
              <p className={`text-lg ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-white/80'
              }`}>
                {searchTerm || filter !== 'all' ? 'No sessions match your search' : 'No archived sessions yet'}
              </p>
              <p className={`text-sm mt-2 ${
                timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-white/60'
              }`}>
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter'
                  : 'Your completed sessions will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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
                            ? 'bg-amber-500/20 text-amber-700'
                            : 'bg-purple-500/20 text-purple-300'
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
                            timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-white/80'
                          }`}>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {isValid(new Date(session.createdAt)) 
                                ? format(new Date(session.createdAt), 'MMM d, yyyy')
                                : 'Invalid date'
                              }
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {Math.round(session.duration / 60)} min
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-4 h-4" />
                              {session.messages.length} messages
                            </div>
                            {session.insights && session.insights.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Sparkles className="w-4 h-4" />
                                {session.insights.length} insights
                              </div>
                            )}
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
                      <div className="p-6">
                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 mb-4">
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            disabled={deletingSessionId === session.id}
                            className={`p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                              timeOfDay.period === 'morning'
                                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-700 border-red-500/30'
                                : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border-red-600/30'
                            }`}
                            title="Delete conversation"
                          >
                            {deletingSessionId === session.id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleCopySession(session)}
                            disabled={deletingSessionId === session.id}
                            className={`p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105 ${
                              copiedSessionId === session.id
                                ? (timeOfDay.period === 'morning'
                                    ? 'bg-green-500/30 text-green-700 border-green-500/50'
                                    : 'bg-green-600/30 text-green-300 border-green-600/50')
                                : (timeOfDay.period === 'morning'
                                    ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                                    : 'bg-white/10 hover:bg-white/20 text-white')
                            }`}
                            title="Copy conversation"
                          >
                            {copiedSessionId === session.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDownloadSession(session)}
                            disabled={deletingSessionId === session.id}
                            className={`p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:scale-105 ${
                              timeOfDay.period === 'morning'
                                ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                            title="Download conversation"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Messages */}
                        <div className="space-y-4 mb-6">
                          {session.messages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] p-4 rounded-2xl ${
                                  message.role === 'user'
                                    ? (timeOfDay.period === 'morning'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-white text-gray-800')
                                    : (timeOfDay.period === 'morning'
                                        ? 'bg-white/30 text-gray-800'
                                        : 'bg-white/20 text-white')
                                }`}
                              >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {message.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Insights */}
                        {session.insights && session.insights.length > 0 && (
                          <div className="border-t border-white/10 pt-6">
                            <h4 className={`text-lg font-medium mb-4 flex items-center gap-2 ${
                              timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                            }`}>
                              <Sparkles className="w-5 h-5" />
                              Insights
                            </h4>
                            <div className="space-y-4">
                              {session.insights.map((insight, index) => (
                                <div
                                  key={index}
                                  className={`p-4 rounded-xl backdrop-blur-sm border border-white/20 ${
                                    timeOfDay.period === 'morning'
                                      ? 'bg-white/30'
                                      : 'bg-white/20'
                                  }`}
                                >
                                  <h5 className={`font-medium mb-2 ${
                                    timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                                  }`}>
                                    {insight.title}
                                  </h5>
                                  <p className={`text-sm leading-relaxed ${
                                    timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-white/90'
                                  }`}>
                                    {insight.content}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Privacy Notice - Bottom of page */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[5]">
        <p className={`text-[10px] sm:text-xs whitespace-nowrap ${
          timeOfDay.period === 'morning' 
            ? 'text-gray-900' 
            : 'text-white'
        }`}>
          🔒 All data stored locally & privately on your device
        </p>
      </div>
    </div>
  );
};

export default ChatArchive;