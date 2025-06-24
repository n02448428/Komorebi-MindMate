import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Star, TrendingUp, Heart, BookOpen } from 'lucide-react';

const EveningSession: React.FC = () => {
  const { theme } = useTheme();
  const [wins, setWins] = useState(['', '', '']);
  const [challenges, setChallenges] = useState('');
  const [lessons, setLessons] = useState('');
  const [tomorrow, setTomorrow] = useState('');
  const [mood, setMood] = useState(5);

  const handleWinChange = (index: number, value: string) => {
    const newWins = [...wins];
    newWins[index] = value;
    setWins(newWins);
  };

  const handleSave = () => {
    const sessionData = {
      date: new Date().toISOString(),
      wins: wins.filter(win => win.trim()),
      challenges,
      lessons,
      tomorrow,
      mood,
    };
    
    // Save to localStorage for demo
    const existingSessions = JSON.parse(localStorage.getItem('evening-sessions') || '[]');
    existingSessions.push(sessionData);
    localStorage.setItem('evening-sessions', JSON.stringify(existingSessions));
    
    alert('Evening session saved!');
  };

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
            <Moon className={`w-8 h-8 ${
              theme === 'morning' ? 'text-purple-500' : 'text-purple-300'
            }`} />
            <h1 className={`text-3xl font-bold ${
              theme === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Good Evening
            </h1>
          </div>
          <p className={`text-lg ${
            theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Reflect on your day and prepare for tomorrow
          </p>
        </header>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Mood Check */}
          <div className={`p-6 rounded-xl ${
            theme === 'morning' 
              ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
              : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Heart className={`w-6 h-6 ${
                theme === 'morning' ? 'text-red-500' : 'text-red-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                How was your day?
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm ${
                theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Challenging
              </span>
              <input
                type="range"
                min="1"
                max="10"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="flex-1"
              />
              <span className={`text-sm ${
                theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Wonderful
              </span>
              <span className={`text-lg font-bold ${
                theme === 'morning' ? 'text-purple-600' : 'text-purple-400'
              }`}>
                {mood}/10
              </span>
            </div>
          </div>

          {/* Daily Wins */}
          <div className={`p-6 rounded-xl ${
            theme === 'morning' 
              ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
              : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Star className={`w-6 h-6 ${
                theme === 'morning' ? 'text-yellow-500' : 'text-yellow-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Today's wins (big or small)
              </h2>
            </div>
            <div className="space-y-3">
              {wins.map((win, index) => (
                <input
                  key={index}
                  type="text"
                  value={win}
                  onChange={(e) => handleWinChange(index, e.target.value)}
                  placeholder={`Win ${index + 1}...`}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    theme === 'morning'
                      ? 'border-gray-300 bg-white text-gray-900 focus:border-yellow-500'
                      : 'border-gray-600 bg-gray-700 text-white focus:border-yellow-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Challenges */}
          <div className={`p-6 rounded-xl ${
            theme === 'morning' 
              ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
              : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className={`w-6 h-6 ${
                theme === 'morning' ? 'text-orange-500' : 'text-orange-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                What challenged me today?
              </h2>
            </div>
            <textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Describe any difficulties, obstacles, or moments of struggle..."
              rows={3}
              className={`w-full p-3 rounded-lg border transition-colors resize-none ${
                theme === 'morning'
                  ? 'border-gray-300 bg-white text-gray-900 focus:border-orange-500'
                  : 'border-gray-600 bg-gray-700 text-white focus:border-orange-500'
              }`}
            />
          </div>

          {/* Lessons Learned */}
          <div className={`p-6 rounded-xl ${
            theme === 'morning' 
              ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
              : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className={`w-6 h-6 ${
                theme === 'morning' ? 'text-blue-500' : 'text-blue-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                What did I learn?
              </h2>
            </div>
            <textarea
              value={lessons}
              onChange={(e) => setLessons(e.target.value)}
              placeholder="Insights, realizations, or lessons from today's experiences..."
              rows={3}
              className={`w-full p-3 rounded-lg border transition-colors resize-none ${
                theme === 'morning'
                  ? 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                  : 'border-gray-600 bg-gray-700 text-white focus:border-blue-500'
              }`}
            />
          </div>

          {/* Tomorrow's Focus */}
          <div className={`p-6 rounded-xl ${
            theme === 'morning' 
              ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
              : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Moon className={`w-6 h-6 ${
                theme === 'morning' ? 'text-purple-500' : 'text-purple-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Tomorrow I want to focus on...
              </h2>
            </div>
            <textarea
              value={tomorrow}
              onChange={(e) => setTomorrow(e.target.value)}
              placeholder="What would you like to prioritize or improve tomorrow?"
              rows={3}
              className={`w-full p-3 rounded-lg border transition-colors resize-none ${
                theme === 'morning'
                  ? 'border-gray-300 bg-white text-gray-900 focus:border-purple-500'
                  : 'border-gray-600 bg-gray-700 text-white focus:border-purple-500'
              }`}
            />
          </div>

          {/* Save Button */}
          <div className="text-center">
            <button
              onClick={handleSave}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                theme === 'morning'
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              Save Evening Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EveningSession;