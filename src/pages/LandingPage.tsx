import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Play, ArrowRight, User, Crown, X } from 'lucide-react';
import NatureVideoBackground from '../components/NatureVideoBackground';
import { getTimeOfDay } from '../utils/timeUtils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage: React.FC = () => {
  const { login, signup, loading, startGuestSession } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const timeOfDay = getTimeOfDay();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signup(email, password, name);
    } catch (err) {
      setError('Signup failed. Please check your details and try again.');
    }
  };

  const handleGuestSession = () => {
    startGuestSession();
    navigate('/session');
  };

  const openGetStartedModal = () => {
    setShowGetStarted(true);
  };

  const closeGetStartedModal = () => {
    setShowGetStarted(false);
  };

  const showSignupForm = () => {
    setShowGetStarted(false);
    setShowSignup(true);
  };

  const showLoginForm = () => {
    setShowGetStarted(false);
    setShowLogin(true);
  };

  const backToLanding = () => {
    setShowLogin(false);
    setShowSignup(false);
    setShowGetStarted(false);
  };

  const handleUpgrade = () => {
    if (showGetStarted) {
      closeGetStartedModal();
    }
    navigate('/upgrade');
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
            onClick={() => showLoginForm()}
            className="px-4 py-2 rounded-2xl backdrop-blur-sm bg-white/20 hover:bg-white/30 text-gray-800 font-medium transition-all duration-200 border border-white/20"
          >
            Sign In
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        {!showLogin && !showSignup ? (
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
                onClick={handleGuestSession}
                aria-label="Continue as guest"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-sm disabled:opacity-50"
              >
                <Play className="w-5 h-5" />
                {loading ? 'Starting...' : 'Try Demo'}
              </button>
              <button
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
        ) : showLogin ? (
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
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold transition-all duration-200 disabled:opacity-50 backdrop-blur-sm"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={backToLanding}
                  onClick={() => setShowLogin(false)}
                  className="text-gray-700 hover:text-gray-900 text-sm transition-colors"
                >
                  Back to home
                </button>
              </div>

              <div className="mt-8">
                <div className="text-center text-sm text-gray-600 mb-4">
                  Don't have an account yet?
                </div>
                <button
                  onClick={showSignupForm}
                  className="w-full p-3 rounded-2xl border border-white/30 bg-white/10 hover:bg-white/20 text-gray-800 font-medium transition-all duration-200 backdrop-blur-sm"
                >
                  Create Free Account
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Signup Form */
          <div className="w-full max-w-md mx-auto">
            <div className="backdrop-blur-md bg-white/20 rounded-3xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Create Your Account
                </h2>
                <p className="text-gray-700">
                  Join the mindful reflection journey
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-4 rounded-2xl border-0 bg-white/20 text-gray-800 placeholder-gray-600 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                    placeholder="Your name"
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 rounded-2xl border-0 bg-white/20 text-gray-800 placeholder-gray-600 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                    placeholder="Your email address"
                    required
                  />
                </div>

                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 rounded-2xl border-0 bg-white/20 text-gray-800 placeholder-gray-600 focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                    placeholder="Choose a password"
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
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold transition-all duration-200 disabled:opacity-50 backdrop-blur-sm"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={backToLanding}
                  className="text-gray-700 hover:text-gray-900 text-sm transition-colors"
                >
                  Back to home
                </button>
              </div>

              <div className="mt-8">
                <div className="text-center text-sm text-gray-600 mb-4">
                  Already have an account?
                </div>
                <button
                  onClick={showLoginForm}
                  className="w-full p-3 rounded-2xl border border-white/30 bg-white/10 hover:bg-white/20 text-gray-800 font-medium transition-all duration-200 disabled:opacity-50 backdrop-blur-sm"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Get Started Modal */}
        <AnimatePresence>
          {showGetStarted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md bg-white/20 backdrop-blur-md rounded-3xl p-8 border border-white/20 relative"
              >
                {/* Close button */}
                <button
                  onClick={closeGetStartedModal}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-700 transition-all duration-200"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="text-center mb-8">
                  <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Begin Your Journey
                  </h2>
                  <p className="text-gray-600">
                    Choose how you'd like to experience Komorebi
                  </p>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={showSignupForm}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <User className="w-5 h-5" />
                    Create Free Account
                  </button>
                  
                  <button
                    onClick={handleGuestSession}
                    className="w-full p-4 rounded-2xl bg-white/20 hover:bg-white/30 text-gray-800 font-medium transition-all duration-200 flex items-center justify-center gap-2 border border-white/20"
                  >
                    <Play className="w-5 h-5" />
                    Continue as Guest
                  </button>
                  
                  <button
                    onClick={handleUpgrade}
                    className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/20 text-gray-800 font-medium transition-all duration-200 flex items-center justify-center gap-2 border border-white/20"
                  >
                    <Crown className="w-5 h-5" />
                    Upgrade to Pro
                  </button>
                  
                  <div className="text-center mt-6">
                    <p className="text-gray-600 text-sm">
                      Already have an account?{' '}
                      <button
                        onClick={showLoginForm}
                        className="text-amber-600 font-medium hover:text-amber-700"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LandingPage;