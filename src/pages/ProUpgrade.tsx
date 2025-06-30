import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTimeOfDay } from '../utils/timeUtils';
import { getSceneForSession } from '../utils/sceneUtils';
import NatureVideoBackground from '../components/NatureVideoBackground';
import { ArrowLeft, User, Crown, Shield, LogOut, Trash2, Eye, EyeOff, Download, Edit3, Check } from 'lucide-react';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, logout, updateProfile } = useAuth();
  const [userName, setUserName] = useState(profile?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [nameEditMode, setNameEditMode] = useState(false);
  const [emailEditMode, setEmailEditMode] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Stabilize timeOfDay and currentScene to prevent background changes while typing
  const [timeOfDay] = useState(() => getTimeOfDay(profile?.name));
  const [currentScene] = useState(() => getSceneForSession(timeOfDay.period === 'morning' ? 'morning' : 'evening'));

  // Get video background setting
  const videoEnabled = JSON.parse(localStorage.getItem('video-background-enabled') || 'true');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      localStorage.removeItem('insight-cards');
      localStorage.removeItem('komorebi-chat-sessions');
      localStorage.removeItem('session-limits');
      localStorage.removeItem('session-start-time');
      localStorage.removeItem('current-session-messages');
      alert('All data has been cleared.');
    }
  };

  const handleDownloadAllData = async () => {
    setIsDownloading(true);
    
    try {
      // Gather all user data
      const userData = {
        user: {
          name: profile?.name,
          email: user?.email,
          isPro: profile?.is_pro,
          exportDate: new Date().toISOString()
        },
        insights: JSON.parse(localStorage.getItem('insight-cards') || '[]'),
        chatSessions: JSON.parse(localStorage.getItem('komorebi-chat-sessions') || '[]'),
        sessionLimits: JSON.parse(localStorage.getItem('session-limits') || '{}'),
        settings: {
          videoBackgroundEnabled: JSON.parse(localStorage.getItem('video-background-enabled') || 'true'),
          currentScene: localStorage.getItem('current-scene') || 'ocean'
        }
      };

      // Create downloadable content
      const dataString = JSON.stringify(userData, null, 2);
      const blob = new Blob([dataString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `komorebi-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download data. Please try again.');
    } finally {
      setIsDownloading(false);
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

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateProfile && user) {
      updateProfile({ name: userName });
      setNameSaved(true);
      setNameEditMode(false);
      setTimeout(() => setNameSaved(false), 3000);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      // Note: This is typically handled by Supabase Auth directly, not through profile updates.
      // For now, just update the local state and inform user this would require auth change
      alert("Email changes require authentication verification. This feature isn't fully implemented yet.");
      
      // For now, just confirm the action visually
      setEmailSaved(true);
      setEmailEditMode(false);
      setTimeout(() => setEmailSaved(false), 3000);
    }
  };

  const handleNameEdit = () => {
    setNameEditMode(true);
    setNameSaved(false);
  };

  const handleEmailEdit = () => {
    setEmailEditMode(true);
    setEmailSaved(false);
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
      <div className="relative z-10 pt-20 pb-16 px-4 md:px-6 h-screen overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Profile Section */}
          {user && (
            <div className={`p-4 md:p-6 rounded-3xl backdrop-blur-sm border border-white/20 ${
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
                {/* Name Field */}
                <form onSubmit={handleNameSubmit}>
                  <label className={`block text-sm font-medium mb-2 ${
                    timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Name
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Enter your name"
                      readOnly={!nameEditMode}
                      className={`w-full p-3 pr-12 rounded-2xl border border-white/20 backdrop-blur-sm transition-all duration-200 ${
                        nameEditMode
                          ? (timeOfDay.period === 'morning'
                              ? 'bg-white/30 text-gray-800 placeholder-gray-600 focus:bg-white/40'
                              : 'bg-black/20 text-white placeholder-gray-300 focus:bg-black/30')
                          : (timeOfDay.period === 'morning'
                              ? 'bg-white/10 text-gray-700 cursor-pointer'
                              : 'bg-black/10 text-gray-300 cursor-pointer')
                      } focus:outline-none focus:ring-2 focus:ring-white/30`}
                      onClick={!nameEditMode ? handleNameEdit : undefined}
                    />
                    {!nameEditMode ? (
                      <button
                        type="button"
                        onClick={handleNameEdit}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-70 group-focus-within:opacity-70 ${
                          timeOfDay.period === 'morning'
                            ? 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                        title="Edit name"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-all duration-200 ${
                          timeOfDay.period === 'morning'
                            ? 'text-green-600 hover:text-green-700 hover:bg-green-100/20'
                            : 'text-green-400 hover:text-green-300 hover:bg-green-500/20'
                        }`}
                        title="Save name"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {nameSaved && (
                    <div className={`mt-2 px-3 py-1 rounded-xl text-sm font-medium text-center ${
                      timeOfDay.period === 'morning'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-green-900/50 text-green-300'
                    } animate-fade-in`}>
                      Saved!
                    </div>
                  )}
                </form>

                {/* Email Field */}
                <form onSubmit={handleEmailSubmit}>
                  <label className={`block text-sm font-medium mb-2 ${
                    timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-gray-300'
                  }`}>
                    Email
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Enter your email"
                      readOnly={!emailEditMode}
                      className={`w-full p-3 pr-12 rounded-2xl border border-white/20 backdrop-blur-sm transition-all duration-200 ${
                        emailEditMode
                          ? (timeOfDay.period === 'morning'
                              ? 'bg-white/30 text-gray-800 placeholder-gray-600 focus:bg-white/40'
                              : 'bg-black/20 text-white placeholder-gray-300 focus:bg-black/30')
                          : (timeOfDay.period === 'morning'
                              ? 'bg-white/10 text-gray-700 cursor-pointer'
                              : 'bg-black/10 text-gray-300 cursor-pointer')
                      } focus:outline-none focus:ring-2 focus:ring-white/30`}
                      onClick={!emailEditMode ? handleEmailEdit : undefined}
                    />
                    {!emailEditMode ? (
                      <button
                        type="button"
                        onClick={handleEmailEdit}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-70 group-focus-within:opacity-70 ${
                          timeOfDay.period === 'morning'
                            ? 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                        title="Edit email"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-all duration-200 ${
                          timeOfDay.period === 'morning'
                            ? 'text-green-600 hover:text-green-700 hover:bg-green-100/20'
                            : 'text-green-400 hover:text-green-300 hover:bg-green-500/20'
                        }`}
                        title="Save email"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {emailSaved && (
                    <div className={`mt-2 px-3 py-1 rounded-xl text-sm font-medium text-center ${
                      timeOfDay.period === 'morning'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-green-900/50 text-green-300'
                    } animate-fade-in`}>
                      Saved!
                    </div>
                  )}
                </form>

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
                    {profile?.is_pro && (
                      <Crown className={`w-4 h-4 ${
                        timeOfDay.period === 'morning' ? 'text-amber-600' : 'text-amber-400'
                      }`} />
                    )}
                    <span className={`font-medium ${
                      profile?.is_pro 
                        ? (timeOfDay.period === 'morning' ? 'text-amber-700' : 'text-amber-300')
                        : (timeOfDay.period === 'morning' ? 'text-gray-700' : 'text-gray-300')
                    }`}>
                      {profile?.is_pro ? 'Pro Plan' : 'Free Plan'}
                    </span>
                  </div>
                </div>
                {!profile?.is_pro && (
                  <button
                    onClick={() => navigate('/upgrade')}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium transition-all duration-200"
                  >
                    Upgrade to Pro
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Appearance Settings */}
          <div className={`p-4 md:p-6 rounded-3xl backdrop-blur-sm border border-white/20 ${
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

          {/* Privacy Section */}
          <div className={`p-4 md:p-6 rounded-3xl backdrop-blur-sm border border-white/20 ${
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
              
              <div className="grid gap-3">
                {/* Download All Data Button */}
                <button 
                  onClick={handleDownloadAllData}
                  disabled={isDownloading}
                  className={`w-full p-3 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    timeOfDay.period === 'morning'
                      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-700 border border-green-500/30'
                      : 'bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-600/30'
                  } backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isDownloading ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Preparing Download...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download All Data
                    </>
                  )}
                </button>

                {/* Clear All Data Button */}
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
          </div>

          {/* Account Actions */}
          {user && (
            <div className={`p-4 md:p-6 rounded-3xl backdrop-blur-sm border border-white/20 ${
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
                }`}>
                Sign Out
              </button>
            </div>
          )}

          {/* App Info */}
          <div className="text-center pb-4">
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

export default Settings;