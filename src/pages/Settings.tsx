import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession } from '../utils/sceneUtils';
import NatureVideoBackground from '../components/NatureVideoBackground';
import { ArrowLeft, User, Crown, Shield, LogOut, Trash2 } from 'lucide-react';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const timeOfDay = getTimeOfDay();
  const currentScene = getSceneForSession(timeOfDay.period === 'morning' ? 'morning' : 'evening');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      localStorage.removeItem('insight-cards');
      localStorage.removeItem('session-limits');
      alert('All data has been cleared.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <NatureVideoBackground 
        scene={currentScene} 
        timeOfDay={timeOfDay.period === 'morning' ? 'morning' : 'evening'} 
      />
      
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className={`p-3 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
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
          Settings
        </div>
        
        <div className="w-11" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-8 px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Section */}
          <div className={`p-6 rounded-3xl backdrop-blur-sm border border-white/20 ${
            timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <User className={`w-6 h-6 ${
                timeOfDay.period === 'morning' ? 'text-blue-600' : 'text-blue-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Profile
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Email
                </label>
                <div className={`p-3 rounded-2xl border border-white/20 backdrop-blur-sm ${
                  timeOfDay.period === 'morning'
                    ? 'bg-white/20 text-gray-700'
                    : 'bg-white/10 text-gray-300'
                }`}>
                  {user?.email || 'Not signed in'}
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Plan
                </label>
                <div className={`p-3 rounded-2xl border border-white/20 backdrop-blur-sm flex items-center gap-2 ${
                  timeOfDay.period === 'morning'
                    ? 'bg-white/20'
                    : 'bg-white/10'
                }`}>
                  {user?.isPro && (
                    <Crown className={`w-4 h-4 ${
                      timeOfDay.period === 'morning' ? 'text-amber-600' : 'text-amber-400'
                    }`} />
                  )}
                  <span className={`font-medium ${
                    user?.isPro 
                      ? (timeOfDay.period === 'morning' ? 'text-amber-700' : 'text-amber-300')
                      : (timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-gray-300')
                  }`}>
                    {user?.isPro ? 'Pro Plan' : 'Free Plan'}
                  </span>
                </div>
              </div>
              {!user?.isPro && (
                <button
                  onClick={() => navigate('/pro-upgrade')}
                  className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium transition-all duration-200"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>

          {/* Privacy Section */}
          <div className={`p-6 rounded-3xl backdrop-blur-sm border border-white/20 ${
            timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className={`w-6 h-6 ${
                timeOfDay.period === 'morning' ? 'text-green-600' : 'text-green-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Privacy & Data
              </h2>
            </div>
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border border-white/20 backdrop-blur-sm ${
                timeOfDay.period === 'morning' ? 'bg-white/10' : 'bg-black/10'
              }`}>
                <div className={`text-sm ${
                  timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-gray-200'
                }`}>
                  Your conversations and insights are stored locally on your device and are completely private. 
                  We never share your personal reflections with anyone.
                </div>
              </div>
              <button 
                onClick={handleClearData}
                className={`w-full p-3 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  timeOfDay.period === 'morning'
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-700 border border-red-500/30'
                    : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/30'
                } backdrop-blur-sm`}
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className={`p-6 rounded-3xl backdrop-blur-sm border border-white/20 ${
            timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <LogOut className={`w-6 h-6 ${
                timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Account
              </h2>
            </div>
            <button
              onClick={handleLogout}
              className={`w-full p-3 rounded-2xl font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 ${
                timeOfDay.period === 'morning'
                  ? 'bg-white/20 hover:bg-white/30 text-gray-800'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Sign Out
            </button>
          </div>

          {/* App Info */}
          <div className="text-center">
            <p className={`text-sm ${
              timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Komorebi MindMate v1.0.0
            </p>
            <p className={`text-xs mt-1 ${
              timeOfDay.period === 'morning' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Your AI companion for mindful reflection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;