import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { BarChart3, TrendingUp, Calendar, Smile, Target, Star } from 'lucide-react';

const InsightsGallery: React.FC = () => {
  const { theme } = useTheme();
  const [morningSessions, setMorningSessions] = useState([]);
  const [eveningSessions, setEveningSessions] = useState([]);

  useEffect(() => {
    // Load sessions from localStorage
    const morningData = JSON.parse(localStorage.getItem('morning-sessions') || '[]');
    const eveningData = JSON.parse(localStorage.getItem('evening-sessions') || '[]');
    setMorningSessions(morningData);
    setEveningSessions(eveningData);
  }, []);

  const averageMorningMood = morningSessions.length > 0 
    ? (morningSessions.reduce((sum: number, session: any) => sum + session.mood, 0) / morningSessions.length).toFixed(1)
    : 0;

  const averageEveningMood = eveningSessions.length > 0 
    ? (eveningSessions.reduce((sum: number, session: any) => sum + session.mood, 0) / eveningSessions.length).toFixed(1)
    : 0;

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'morning' 
        ? 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50' 
        : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className={`w-8 h-8 ${
              theme === 'morning' ? 'text-blue-500' : 'text-blue-300'
            }`} />
            <h1 className={`text-3xl font-bold ${
              theme === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Insights Gallery
            </h1>
          </div>
          <p className={`text-lg ${
            theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Discover patterns and track your growth over time
          </p>
        </header>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className={`p-6 rounded-xl text-center ${
              theme === 'morning' 
                ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
                : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
            }`}>
              <Calendar className={`w-8 h-8 mx-auto mb-2 ${
                theme === 'morning' ? 'text-blue-500' : 'text-blue-400'
              }`} />
              <div className={`text-2xl font-bold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                {morningSessions.length}
              </div>
              <div className={`text-sm ${
                theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Morning Sessions
              </div>
            </div>

            <div className={`p-6 rounded-xl text-center ${
              theme === 'morning' 
                ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
                : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
            }`}>
              <Calendar className={`w-8 h-8 mx-auto mb-2 ${
                theme === 'morning' ? 'text-purple-500' : 'text-purple-400'
              }`} />
              <div className={`text-2xl font-bold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                {eveningSessions.length}
              </div>
              <div className={`text-sm ${
                theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Evening Sessions
              </div>
            </div>

            <div className={`p-6 rounded-xl text-center ${
              theme === 'morning' 
                ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
                : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
            }`}>
              <Smile className={`w-8 h-8 mx-auto mb-2 ${
                theme === 'morning' ? 'text-orange-500' : 'text-orange-400'
              }`} />
              <div className={`text-2xl font-bold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                {averageMorningMood}
              </div>
              <div className={`text-sm ${
                theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Avg Morning Mood
              </div>
            </div>

            <div className={`p-6 rounded-xl text-center ${
              theme === 'morning' 
                ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
                : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
            }`}>
              <Star className={`w-8 h-8 mx-auto mb-2 ${
                theme === 'morning' ? 'text-yellow-500' : 'text-yellow-400'
              }`} />
              <div className={`text-2xl font-bold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                {averageEveningMood}
              </div>
              <div className={`text-sm ${
                theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Avg Evening Mood
              </div>
            </div>
          </div>

          {/* Recent Sessions */}
          {morningSessions.length > 0 && (
            <div className={`p-6 rounded-xl ${
              theme === 'morning' 
                ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
                : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <Target className={`w-6 h-6 ${
                  theme === 'morning' ? 'text-orange-500' : 'text-orange-400'
                }`} />
                <h2 className={`text-xl font-semibold ${
                  theme === 'morning' ? 'text-gray-800' : 'text-white'
                }`}>
                  Recent Morning Sessions
                </h2>
              </div>
              <div className="space-y-4">
                {morningSessions.slice(-3).reverse().map((session: any, index: number) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    theme === 'morning' 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-gray-600 bg-gray-700'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className={`text-sm ${
                        theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
                      }`}>
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                      <div className={`text-sm font-medium ${
                        theme === 'morning' ? 'text-orange-600' : 'text-orange-400'
                      }`}>
                        Mood: {session.mood}/10
                      </div>
                    </div>
                    {session.intention && (
                      <div className={`text-sm ${
                        theme === 'morning' ? 'text-gray-700' : 'text-gray-200'
                      }`}>
                        <strong>Intention:</strong> {session.intention}
                      </div>
                    )}
                    {session.gratitude.length > 0 && (
                      <div className={`text-sm mt-2 ${
                        theme === 'morning' ? 'text-gray-700' : 'text-gray-200'
                      }`}>
                        <strong>Grateful for:</strong> {session.gratitude.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Evening Sessions */}
          {eveningSessions.length > 0 && (
            <div className={`p-6 rounded-xl ${
              theme === 'morning' 
                ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
                : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <Star className={`w-6 h-6 ${
                  theme === 'morning' ? 'text-purple-500' : 'text-purple-400'
                }`} />
                <h2 className={`text-xl font-semibold ${
                  theme === 'morning' ? 'text-gray-800' : 'text-white'
                }`}>
                  Recent Evening Sessions
                </h2>
              </div>
              <div className="space-y-4">
                {eveningSessions.slice(-3).reverse().map((session: any, index: number) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    theme === 'morning' 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-gray-600 bg-gray-700'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className={`text-sm ${
                        theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
                      }`}>
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                      <div className={`text-sm font-medium ${
                        theme === 'morning' ? 'text-purple-600' : 'text-purple-400'
                      }`}>
                        Mood: {session.mood}/10
                      </div>
                    </div>
                    {session.wins.length > 0 && (
                      <div className={`text-sm ${
                        theme === 'morning' ? 'text-gray-700' : 'text-gray-200'
                      }`}>
                        <strong>Wins:</strong> {session.wins.join(', ')}
                      </div>
                    )}
                    {session.lessons && (
                      <div className={`text-sm mt-2 ${
                        theme === 'morning' ? 'text-gray-700' : 'text-gray-200'
                      }`}>
                        <strong>Lessons:</strong> {session.lessons}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {morningSessions.length === 0 && eveningSessions.length === 0 && (
            <div className={`p-12 rounded-xl text-center ${
              theme === 'morning' 
                ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
                : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
            }`}>
              <TrendingUp className={`w-16 h-16 mx-auto mb-4 ${
                theme === 'morning' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                No sessions yet
              </h3>
              <p className={`${
                theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Complete your first morning or evening session to see insights here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsGallery;