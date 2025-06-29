import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Search, 
  MessageCircle,
  Calendar,
  Clock,
  Filter,
  Download,
  Trash2,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  date: string;
  duration: number;
  messageCount: number;
  sessionType: 'morning' | 'evening' | 'meditation';
  isFavorite: boolean;
  tags: string[];
}

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

const ChatArchive: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [sessionMessages, setSessionMessages] = useState<ChatMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'morning' | 'evening' | 'meditation'>('all');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockSessions: ChatSession[] = [
      {
        id: '1',
        title: 'Morning Mindfulness Session',
        preview: 'Discussed breathing techniques and morning routine...',
        date: '2024-01-15',
        duration: 15,
        messageCount: 12,
        sessionType: 'morning',
        isFavorite: true,
        tags: ['breathing', 'routine', 'mindfulness']
      },
      {
        id: '2',
        title: 'Evening Reflection',
        preview: 'Explored feelings about work stress and gratitude...',
        date: '2024-01-14',
        duration: 20,
        messageCount: 18,
        sessionType: 'evening',
        isFavorite: false,
        tags: ['stress', 'gratitude', 'reflection']
      },
      {
        id: '3',
        title: 'Meditation Guidance',
        preview: 'Guided meditation on self-compassion...',
        date: '2024-01-13',
        duration: 25,
        messageCount: 8,
        sessionType: 'meditation',
        isFavorite: true,
        tags: ['meditation', 'compassion', 'guidance']
      }
    ];
    
    setTimeout(() => {
      setChatSessions(mockSessions);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredSessions = chatSessions
    .filter(session => 
      filterType === 'all' || session.sessionType === filterType
    )
    .filter(session =>
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const toggleFavorite = (sessionId: string) => {
    setChatSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, isFavorite: !session.isFavorite }
          : session
      )
    );
  };

  const handleSessionClick = (session: ChatSession) => {
    setSelectedSession(session);
    
    // Mock messages - replace with actual API call
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        content: 'Hello! How are you feeling this morning?',
        isUser: false,
        timestamp: '2024-01-15T09:00:00Z'
      },
      {
        id: '2',
        content: 'I\'m feeling a bit anxious about the day ahead.',
        isUser: true,
        timestamp: '2024-01-15T09:01:00Z'
      },
      {
        id: '3',
        content: 'That\'s completely understandable. Let\'s try a breathing exercise to help you feel more centered.',
        isUser: false,
        timestamp: '2024-01-15T09:02:00Z'
      }
    ];
    
    setSessionMessages(mockMessages);
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'morning':
        return 'bg-amber-100 text-amber-800';
      case 'evening':
        return 'bg-purple-100 text-purple-800';
      case 'meditation':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chat Archive</h1>
                <p className="text-sm text-gray-600">
                  {filteredSessions.length} conversations found
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              {['all', 'morning', 'evening', 'meditation'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Conversations</h2>
              </div>
              
              <div className="max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No conversations found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredSessions.map((session) => (
                      <motion.div
                        key={session.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedSession?.id === session.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={() => handleSessionClick(session)}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-1">
                            {session.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(session.id);
                            }}
                            className="text-gray-400 hover:text-yellow-500 transition-colors"
                          >
                            <Star 
                              className={`w-4 h-4 ${
                                session.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''
                              }`} 
                            />
                          </button>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {session.preview}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionTypeColor(session.sessionType)}`}>
                            {session.sessionType}
                          </span>
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(session.duration)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          {format(new Date(session.date), 'MMM d, yyyy')}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[700px] flex flex-col">
              {selectedSession ? (
                <>
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-semibold text-gray-900">{selectedSession.title}</h2>
                        <p className="text-sm text-gray-500">
                          {format(new Date(selectedSession.date), 'MMMM d, yyyy')} • {selectedSession.messageCount} messages
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {sessionMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.isUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 opacity-70`}>
                            {format(new Date(message.timestamp), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a chat session to view the conversation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArchive;