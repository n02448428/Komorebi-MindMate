import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Play, ArrowRight } from 'lucide-react';
import NatureVideoBackground from '../components/NatureVideoBackground';
import { useState, useEffect } from 'react';
import { getTimeOfDay } from '../utils/timeUtils';
import { useState, useEffect } from 'react';

const LandingPage: React.FC = () => {
  const { login, signup, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const timeOfDay = getTimeOfDay();

  // Reset form errors when switching modes
  useEffect(() => {
    setError('');
  }, [isSignUpMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuth = async (e: React.FormEvent) => {
  useEffect(() => {
    setError('');
  }, [isSignUpMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUpMode) {
        await signup(formData.email, formData.password, formData.name);
      } else {
        await login(formData.email, formData.password);
      }
        await signup(formData.email, formData.password, formData.name);
      } else {
        await login(formData.email, formData.password);
      }
    } catch (err) {
      const message = isSignUpMode
        ? 'Sign up failed. Please try a different email or password.'
        : 'Login failed. Please check your credentials and try again.';
      const message = isSignUpMode
        ? 'Sign up failed. Please try a different email or password.'
        : 'Login failed. Please check your credentials and try again.';
      setError(message);
    }
  };

  const handleQuickLogin = async () => {
    setError('');
    setDemoLoading(true);
    setDemoLoading(true);
    try {
      // Create a temporary demo user with a unique email
      const timestamp = Date.now();
      const demoEmail = `demo-${timestamp}@komorebi.app`;
      const demoPassword = 'password123';
      
      await signup(demoEmail, demoPassword, 'Demo User');
    } catch (err) {
      setError('Quick login failed. Please try again.');
      setDemoLoading(false);
      setDemoLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError('');
  };

  const toggleAuthMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <NatureVideoBackground 
        scene="ocean" 
        timeOfDay={timeOfDay.period === 'morning' || timeOfDay.period === 'evening' ? timeOfDay.period : 'morning'} 
      />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-amber-500" />
          <span className="text-2xl font-bold text-gray-800">Komorebi</span>
        </div>
        
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
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5" />
                {demoLoading ? 'Starting...' : 'Try Demo'}
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
              {/* Form Header */}
              {/* Form Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {isSignUpMode ? "Create Your Account" : "Welcome Back"}
                </h2>
                <p className="text-gray-700">
                  {isSignUpMode ? "Sign up to start your mindful journey" : "Sign in to continue your mindful journey"}
                </p>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {/* Name Field (only for signup) */}
                {isSignUpMode && (
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-4 rounded-2xl border-0 bg-white/20 text-gray-800 placeholder-gray-600 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                      placeholder="Your name"
                    />
                  </div>
                )}

              {/* Auth Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {/* Name Field (only for signup) */}
                {isSignUpMode && (
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-4 rounded-2xl border-0 bg-white/20 text-gray-800 placeholder-gray-600 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                      placeholder="Your name"
                    />
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    placeholder="Email address"
                  />
                </div>

                {/* Password Field */}
                {/* Password Field */}
                <div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onChange={handleChange}
                    className="w-full p-4 rounded-2xl border-0 bg-white/20 text-gray-800 placeholder-gray-600 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                    placeholder="Password"
                    required
                  />
                </div>

                {/* Error Message */}
                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-2xl bg-red-100/80 border border-red-300/50 text-red-700 text-sm backdrop-blur-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (isSignUpMode ? 'Creating Account...' : 'Signing In...') : (isSignUpMode ? 'Sign Up' : 'Sign In')}
                </button>
                
                {/* Auth Mode Toggle */}
                <div className="text-center mt-4">
                  <button 
                    type="button"
                    onClick={toggleAuthMode}
                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {isSignUpMode 
                      ? "Already have an account? Sign In" 
                      : "Don't have an account? Sign Up"}
                  </button>
                </div>
                
                {/* Auth Mode Toggle */}
                <div className="text-center mt-4">
                  <button 
                    type="button"
                    onClick={toggleAuthMode}
                    className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    {isSignUpMode 
                      ? "Already have an account? Sign In" 
                      : "Don't have an account? Sign Up"}
                  </button>
                </div>
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
                  Try the experience with demo@komorebi.app/password123
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