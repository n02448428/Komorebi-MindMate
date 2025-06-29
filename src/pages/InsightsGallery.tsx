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
    <div className="min-h-screen relative">
      <NatureVideoBackground scene={currentScene} />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className={`p-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                  timeOfDay.period === 'morning'
                    ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className={`text-2xl font-bold ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Your Insights
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <button
                  onClick={() => setShowSessionArchive(!showSessionArchive)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 text-sm font-medium ${
                    timeOfDay.period === 'morning'
                      ? 'bg-white/20 hover:bg-white/30 text-gray-700'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  <span>Archive</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    showSessionArchive ? 'rotate-90' : ''
                  }`} />
                </button>
              )}

              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 ${
                timeOfDay.period === 'morning' ? 'bg-white/20 text-gray-700' : 'bg-white/10 text-white'
              }`}>
                <Calendar className="w-4 h-4" />
                <div className="text-sm font-medium">
                  {morningCount} morning • {eveningCount} evening
                </div>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 ${
                timeOfDay.period === 'morning' ? 'bg-white/20 text-gray-700' : 'bg-white/10 text-white'
              }`}>
                <Filter className="w-4 h-4" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as 'all' | 'morning' | 'evening')}
                  className="bg-transparent text-sm font-medium focus:outline-none"
                >
                  <option value="all">All</option>
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsGallery;