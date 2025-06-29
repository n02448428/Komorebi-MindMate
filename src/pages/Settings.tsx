import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession } from '../utils/sceneUtils';
import NatureVideoBackground from '../components/NatureVideoBackground';
import { ArrowLeft, User, Crown, Shield, LogOut, Trash2, Eye, EyeOff, Download } from 'lucide-react';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const timeOfDay = getTimeOfDay();
  const currentScene = getSceneForSession(timeOfDay.period === 'morning' ? 'morning' : 'evening');

  // Get video background setting
  const videoEnabled = JSON.parse(localStorage.getItem('video-background-enabled') || 'true');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDownloadData = () => {
    try {
      // Collect all user data
      const userData = {
        insightCards: JSON.parse(localStorage.getItem('insight-cards') || '[]'),
        chatSessions: JSON.parse(localStorage.getItem('komorebi-chat-sessions') || '[]'),
        sessionLimits: JSON.parse(localStorage.getItem('session-limits') || '{}'),
        settings: {
          videoEnabled: JSON.parse(localStorage.getItem('video-background-enabled') || 'true'),
          currentScene: localStorage.getItem('current-scene') || 'ocean'
        },
        exportDate: new Date().toISOString(),
        userEmail: user?.email || 'anonymous'
      };

      // Create and download file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `komorebi-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Your data has been downloaded successfully!');
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Failed to download data. Please try again.');
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your data? This includes all insight cards, conversation history, and settings. This action cannot be undone and your data can never be retrieved once deleted.')) {
      localStorage.removeItem('insight-cards');
      localStorage.removeItem('session-limits');
      localStorage.removeItem('session-start-time');
      localStorage.removeItem('komorebi-chat-sessions');
      localStorage.removeItem('current-scene');
      localStorage.removeItem('video-background-enabled');
      alert('All data has been permanently cleared.');
      // Refresh the page to reset the app state
      window.location.reload();
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const toggleVideoBackground = () => {
    const newVideoEnabled = !videoEnabled;
    localStorage.setItem('video-background-enabled', JSON.stringify(newVideoEnabled));
    // Refresh the page to apply the change
    window.location.reload();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {videoEnabled && (
        <NatureVideoBackground 
          scene={currentScene} 
          timeOfDay={timeOfDay.period === 'morning' ? 'morning' : 'evening'} 
        />
      )}
      {!videoEnabled && (
        <div className={`absolute inset-0 bg-gradient-to-br ${
          timeOfDay.period === 'morning' 
            ? 'from-amber-100 via-orange-50 to-yellow-100'
            : 'from-indigo-900 via-purple-900 to-blue-900'
        }`} />
      )}
      
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
          Settings
        </div>
        
        <div className="w-11" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-24 pb-8 px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Section */}
          {user && (
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
          )}

          {/* Appearance Settings */}
          <div className={`p-6 rounded-3xl backdrop-blur-sm border border-white/20 ${
            timeOfDay.period === 'morning' ? 'bg-white/20' : 'bg-white/10'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Eye className={`w-6 h-6 ${
                timeOfDay.period === 'morning' ? 'text-purple-600' : 'text-purple-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Appearance
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${
                    timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    Video Backgrounds
                  </div>
                  <div className={`text-sm ${
                    timeOfDay.period === 'morning' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    Show nature video backgrounds during sessions
                  </div>
                </div>
                <button
                  onClick={toggleVideoBackground}
                  className={`p-3 rounded-2xl transition-all duration-200 ${
                    videoEnabled
                      ? (timeOfDay.period === 'morning'
                          ? 'bg-green-500/20 text-green-700 border border-green-500/30'
                          : 'bg-green-600/20 text-green-300 border border-green-600/30')
                      : (timeOfDay.period === 'morning'
                          ? 'bg-gray-500/20 text-gray-700 border border-gray-500/30'
                          : 'bg-gray-600/20 text-gray-300 border border-gray-600/30')
                  } backdrop-blur-sm`}
                >
                  {videoEnabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Data Section */}
          <div className={`p-6 rounded-3xl border-2 ${
            timeOfDay.period === 'morning' 
              ? 'bg-white/40 border-white/40' 
              : 'bg-black/40 border-white/30'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className={`w-6 h-6 ${
                timeOfDay.period === 'morning' ? 'text-green-700' : 'text-green-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                timeOfDay.period === 'morning' ? 'text-gray-900' : 'text-white'
              }`}>
                Privacy & Data
              </h2>
            </div>
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl ${
                timeOfDay.period === 'morning' 
                  ? 'bg-white/50 border border-white/50' 
                  : 'bg-black/30 border border-white/20'
              }`}>
                <div className={`text-sm font-medium mb-2 ${
                  timeOfDay.period === 'morning' ? 'text-gray-900' : 'text-white'
                }`}>
                  🔒 Your Privacy is Protected
                </div>
                <div className={`text-sm ${
                  timeOfDay.period === 'morning' ? 'text-gray-800' : 'text-gray-200'
                }`}>
                  Your conversations and insights are stored locally on your device and are completely private. 
                  We never share your personal reflections with anyone. Insight cards are designed for sharing 
                  if you choose to do so.
                </div>
              </div>
              
              <button 
                onClick={handleDownloadData}
                className={`w-full p-3 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  timeOfDay.period === 'morning'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-700 hover:bg-green-800 text-white'
                }`}
              >
                <Download className="w-4 h-4" />
                Download All My Data
              </button>
              
              <button 
                onClick={handleClearData}
                className={`w-full p-3 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                  timeOfDay.period === 'morning'
                    ? 'bg-red-600 hover:bg-red-700 text-white border border-red-700'
                    : 'bg-red-700 hover:bg-red-800 text-white border border-red-800'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data Permanently
              </button>
            </div>
          </div>

          {/* Account Actions */}
          {user && (
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
          )}

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

      {/* Privacy Notice - Bottom of page */}
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[5]">
        <p className={`text-xs px-3 py-1 rounded-full backdrop-blur-sm border ${
          timeOfDay.period === 'morning' 
            ? 'bg-gray-800/80 text-gray-200 border-gray-700/50' 
            : 'bg-white/80 text-gray-800 border-white/50'
        }`}>
          🔒 All data stored locally & privately on your device
        </p>
      </div>
    </div>
  );
};

export default Settings;