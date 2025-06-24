import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InsightCard as InsightCardType, NatureScene } from '../types';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession, natureScenes } from '../utils/sceneUtils';
import NatureVideoBackground from '../components/NatureVideoBackground';
import InsightCard from '../components/InsightCard';
import { ArrowLeft, Sparkles, Calendar, Filter } from 'lucide-react';

const InsightsGallery: React.FC = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<InsightCardType[]>([]);
  const [filter, setFilter] = useState<'all' | 'morning' | 'evening'>('all');

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
  }, []);

  const filteredInsights = insights.filter(insight => 
    filter === 'all' || insight.type === filter
  );

  const morningCount = insights.filter(i => i.type === 'morning').length;
  const eveningCount = insights.filter(i => i.type === 'evening').length;

  const handleBack = () => {
    navigate('/');
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
          <div className={`p-4 rounded-2xl mb-8 backdrop-blur-sm border border-white/20 ${
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
                    {filterType}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Insights Grid */}
          {filteredInsights.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInsights.map((insight) => (
                <div key={insight.id} className="animate-fade-in">
                  <InsightCard insight={insight} />
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
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
    </div>
  );
};

export default InsightsGallery;