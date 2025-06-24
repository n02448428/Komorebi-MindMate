import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sunrise, Moon, Sparkles, Heart, Brain, Target } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleQuickLogin = async () => {
    setError('');
    try {
      await login('dev@example.com', 'password');
    } catch (err) {
      setError('Quick login failed. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      theme === 'morning' 
        ? 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50' 
        : 'bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            {theme === 'morning' ? (
              <Sunrise className="w-8 h-8 text-orange-500" />
            ) : (
              <Moon className="w-8 h-8 text-blue-300" />
            )}
            <h1 className={`text-4xl font-bold ${
              theme === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Komorebi MindMate
            </h1>
            <Sparkles className={`w-8 h-8 ${
              theme === 'morning' ? 'text-yellow-500' : 'text-purple-300'
            }`} />
          </div>
          <p className={`text-xl ${
            theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Your daily companion for mindful reflection and growth
          </p>
        </header>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  theme === 'morning' ? 'bg-orange-100' : 'bg-blue-800'
                }`}>
                  <Sunrise className={`w-6 h-6 ${
                    theme === 'morning' ? 'text-orange-600' : 'text-blue-300'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold mb-2 ${
                    theme === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    Morning Intentions
                  </h3>
                  <p className={`${
                    theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    Start each day with purpose. Set intentions, practice gratitude, and align with your goals.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  theme === 'morning' ? 'bg-purple-100' : 'bg-purple-800'
                }`}>
                  <Moon className={`w-6 h-6 ${
                    theme === 'morning' ? 'text-purple-600' : 'text-purple-300'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold mb-2 ${
                    theme === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    Evening Reflection
                  </h3>
                  <p className={`${
                    theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    End your day with mindful reflection. Celebrate wins, learn from challenges, and prepare for tomorrow.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full ${
                  theme === 'morning' ? 'bg-green-100' : 'bg-green-800'
                }`}>
                  <Brain className={`w-6 h-6 ${
                    theme === 'morning' ? 'text-green-600' : 'text-green-300'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-xl font-semibold mb-2 ${
                    theme === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    Insights & Growth
                  </h3>
                  <p className={`${
                    theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    Track patterns, discover insights, and watch your personal growth unfold over time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className={`p-8 rounded-2xl shadow-xl ${
            theme === 'morning' 
              ? 'bg-white/80 backdrop-blur-sm' 
              : 'bg-gray-800/80 backdrop-blur-sm'
          }`}>
            <div className="text-center mb-6">
              <h2 className={`text-2xl font-bold mb-2 ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Welcome Back
              </h2>
              <p className={`${
                theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Sign in to continue your mindfulness journey
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'morning' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    theme === 'morning'
                      ? 'border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500'
                      : 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'morning' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    theme === 'morning'
                      ? 'border-gray-300 bg-white text-gray-900 focus:border-orange-500 focus:ring-orange-500'
                      : 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full p-3 rounded-lg font-medium transition-colors ${
                  theme === 'morning'
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-300">
              <button
                onClick={handleQuickLogin}
                disabled={isLoading}
                className={`w-full p-3 rounded-lg font-medium transition-colors ${
                  theme === 'morning'
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Quick Login (Demo)
              </button>
              <p className={`text-xs text-center mt-2 ${
                theme === 'morning' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Use dev@example.com / password for demo access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;