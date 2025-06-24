import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sunrise, Heart, Target, Sparkles, ArrowRight } from 'lucide-react';

const MorningSession: React.FC = () => {
  const { theme } = useTheme();
  const [gratitude, setGratitude] = useState(['', '', '']);
  const [intention, setIntention] = useState('');
  const [goals, setGoals] = useState(['', '', '']);
  const [mood, setMood] = useState(5);

  const handleGratitudeChange = (index: number, value: string) => {
    const newGratitude = [...gratitude];
    newGratitude[index] = value;
    setGratitude(newGratitude);
  };

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const handleSave = () => {
    const sessionData = {
      date: new Date().toISOString(),
      gratitude: gratitude.filter(item => item.trim()),
      intention,
      goals: goals.filter(goal => goal.trim()),
      mood,
    };
    
    // Save to localStorage for demo
    const existingSessions = JSON.parse(localStorage.getItem('morning-sessions') || '[]');
    existingSessions.push(sessionData);
    localStorage.setItem('morning-sessions', JSON.stringify(existingSessions));
    
    alert('Morning session saved!');
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
            <Sunrise className={`w-8 h-8 ${
              theme === 'morning' ? 'text-orange-500' : 'text-orange-300'
            }`} />
            <h1 className={`text-3xl font-bold ${
              theme === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Good Morning
            </h1>
          </div>
          <p className={`text-lg ${
            theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Start your day with intention and gratitude
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
                How are you feeling?
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-sm ${
                theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Not great
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
                Amazing
              </span>
              <span className={`text-lg font-bold ${
                theme === 'morning' ? 'text-orange-600' : 'text-orange-400'
              }`}>
                {mood}/10
              </span>
            </div>
          </div>

          {/* Gratitude */}
          <div className={`p-6 rounded-xl ${
            theme === 'morning' 
              ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
              : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className={`w-6 h-6 ${
                theme === 'morning' ? 'text-yellow-500' : 'text-yellow-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Three things I'm grateful for
              </h2>
            </div>
            <div className="space-y-3">
              {gratitude.map((item, index) => (
                <input
                  key={index}
                  type="text"
                  value={item}
                  onChange={(e) => handleGratitudeChange(index, e.target.value)}
                  placeholder={`Gratitude ${index + 1}...`}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    theme === 'morning'
                      ? 'border-gray-300 bg-white text-gray-900 focus:border-yellow-500'
                      : 'border-gray-600 bg-gray-700 text-white focus:border-yellow-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Daily Intention */}
          <div className={`p-6 rounded-xl ${
            theme === 'morning' 
              ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
              : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Target className={`w-6 h-6 ${
                theme === 'morning' ? 'text-blue-500' : 'text-blue-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Today's intention
              </h2>
            </div>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="What do you want to focus on today? How do you want to show up?"
              rows={3}
              className={`w-full p-3 rounded-lg border transition-colors resize-none ${
                theme === 'morning'
                  ? 'border-gray-300 bg-white text-gray-900 focus:border-blue-500'
                  : 'border-gray-600 bg-gray-700 text-white focus:border-blue-500'
              }`}
            />
          </div>

          {/* Daily Goals */}
          <div className={`p-6 rounded-xl ${
            theme === 'morning' 
              ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
              : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <ArrowRight className={`w-6 h-6 ${
                theme === 'morning' ? 'text-green-500' : 'text-green-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Three priorities for today
              </h2>
            </div>
            <div className="space-y-3">
              {goals.map((goal, index) => (
                <input
                  key={index}
                  type="text"
                  value={goal}
                  onChange={(e) => handleGoalChange(index, e.target.value)}
                  placeholder={`Priority ${index + 1}...`}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    theme === 'morning'
                      ? 'border-gray-300 bg-white text-gray-900 focus:border-green-500'
                      : 'border-gray-600 bg-gray-700 text-white focus:border-green-500'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="text-center">
            <button
              onClick={handleSave}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                theme === 'morning'
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              }`}
            >
              Save Morning Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorningSession;