import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Play, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import NatureVideoBackground from '../components/NatureVideoBackground';
import { getTimeOfDay } from '../utils/timeUtils';

const LandingPage: React.FC = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const timeOfDay = getTimeOfDay();

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
    // For demo purposes - never do this in production code
    const demoEmail = 'demo@komorebi.app';
    const demoPassword = 'demo123456';
    
    setError('');
    try {
      // Check if user exists
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      });
      
      if (checkError && checkError.status === 400) {
        // User doesn't exist, create account
        const { error: signUpError } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
          options: {
            data: {
              name: 'Demo User',
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        // Now login
        await login(demoEmail, demoPassword);
      } else if (checkError) {
        // Other error
        throw checkError;
      } else {
        // User exists, just login
        await login(demoEmail, demoPassword);
      }
    } catch (err) {
      setError('Demo login failed. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Video */}
      <NatureVideoBackground timeOfDay={timeOfDay} />

      {/* Floating Sparkles */}
      <div className="absolute top-4 right-4 z-10">
        <Sparkles className="w-6 h-6 text-amber-500" />
      </div>

      {/* Login Button - Top Right */}
      <div className="absolute top-4 right-16 z-10">
        {!showLogin && (
          <button
            onClick={() => setShowLogin(true)}
            className="px-4 py-2 rounded-2xl backdrop-blur-sm bg-white/20 hover:bg-white/30 text-gray-800 font-medium transition-all duration-200 border border-white/20"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        {!showLogin ? (
          /* Landing Content */
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
                Your AI companion for
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                  mindful reflection
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                Experience the gentle art of self-discovery through conversations with AI, 
                surrounded by the calming beauty of nature.
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="backdrop-blur-sm bg-white/20 rounded-3xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Morning Intentions</h3>
                <p className="text-gray-700">
                  Start each day with clarity and purpose through gentle AI-guided conversations.
                </p>
              </div>
              <div className="backdrop-blur-sm bg-white/20 rounded-3xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Evening Reflections</h3>
                <p className="text-gray-700">
                  Wind down with thoughtful reflection on your day's experiences and insights.
                </p>
              </div>
              <div className="backdrop-blur-sm bg-white/20 rounded-3xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Insight Cards</h3>
                <p className="text-gray-700">
                  Receive beautiful, shareable cards with personalized wisdom from your sessions.
                </p>
              </div>
              <div className="backdrop-blur-sm bg-white/20 rounded-3xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Nature Immersion</h3>
                <p className="text-gray-700">
                  Reflect surrounded by stunning nature scenes that enhance your mindful experience.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleQuickLogin}
                disabled={loading}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-sm disabled:opacity-50"
              >
                <Play className="w-5 h-5" />
                {loading ? 'Starting...' : 'Try Demo'}
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="px-8 py-4 rounded-2xl backdrop-blur-sm bg-white/20 hover:bg-white/30 text-gray-800 font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 border border-white/20"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mt-6">
              Free to try • No credit card required • Private & secure
            </p>
          </div>
        ) : (
          /* Login Form */
          <div className="w-full max-w-md mx-auto">
            <div className="backdrop-blur-md bg-white/20 rounded-3xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome to Komorebi
                </h2>
                <p className="text-gray-700">
                  Sign in to begin your mindful journey
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 rounded-2xl border-0 bg-white/20 text-gray-800 placeholder-gray-600 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 rounded-2xl border-0 bg-white/20 text-gray-800 placeholder-gray-600 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-2xl bg-red-100/80 border border-red-300/50 text-red-700 text-sm backdrop-blur-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-white/20">
                <button
                  onClick={handleQuickLogin}
                  disabled={loading}
                  className="w-full p-4 rounded-2xl backdrop-blur-sm bg-white/20 hover:bg-white/30 text-gray-800 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Quick Demo Access
                </button>
                <p className="text-xs text-center mt-2 text-gray-600">
                  Try the experience with demo@komorebi.app
                </p>
              </div>

              <button
                onClick={() => setShowLogin(false)}
                className="w-full mt-4 p-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                ← Back to landing page
              </button>
            </div>
          </div>
        )}
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

export default LandingPage;