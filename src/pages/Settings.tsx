import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Palette, Bell, Shield, LogOut } from 'lucide-react';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
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
            <SettingsIcon className={`w-8 h-8 ${
              theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
            }`} />
            <h1 className={`text-3xl font-bold ${
              theme === 'morning' ? 'text-gray-800' : 'text-white'
            }`}>
              Settings
            </h1>
          </div>
          <p className={`text-lg ${
            theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Customize your Komorebi MindMate experience
          </p>
        </header>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Section */}
          <div className={`p-6 rounded-xl ${
            theme === 'morning' 
              ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
              : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <User className={`w-6 h-6 ${
                theme === 'morning' ? 'text-blue-500' : 'text-blue-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Profile
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'morning' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className={`w-full p-3 rounded-lg border ${
                    theme === 'morning'
                      ? 'border-gray-300 bg-gray-100 text-gray-600'
                      : 'border-gray-600 bg-gray-700 text-gray-400'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'morning' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Plan
                </label>
                <div className={`p-3 rounded-lg border ${
                  theme === 'morning'
                    ? 'border-gray-300 bg-gray-100'
                    : 'border-gray-600 bg-gray-700'
                }`}>
                  <span className={`font-medium ${
                    user?.isPro 
                      ? (theme === 'morning' ? 'text-purple-600' : 'text-purple-400')
                      : (theme === 'morning' ? 'text-gray-600' : 'text-gray-400')
                  }`}>
                    {user?.isPro ? 'Pro Plan' : 'Free Plan'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className={`p-6 rounded-xl ${
            theme === 'morning' 
              ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
              : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Palette className={`w-6 h-6 ${
                theme === 'morning' ? 'text-purple-500' : 'text-purple-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Appearance
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${
                    theme === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    Theme
                  </div>
                  <div className={`text-sm ${
                    theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    Current: {theme === 'morning' ? 'Morning (Light)' : 'Evening (Dark)'}
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'morning'
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  Toggle Theme
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className={`p-6 rounded-xl ${
            theme === 'morning' 
              ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
              : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Bell className={`w-6 h-6 ${
                theme === 'morning' ? 'text-green-500' : 'text-green-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Notifications
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${
                    theme === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    Morning Reminders
                  </div>
                  <div className={`text-sm ${
                    theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    Get reminded to complete your morning session
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${
                    theme === 'morning' ? 'text-gray-800' : 'text-white'
                  }`}>
                    Evening Reminders
                  </div>
                  <div className={`text-sm ${
                    theme === 'morning' ? 'text-gray-600' : 'text-gray-300'
                  }`}>
                    Get reminded to complete your evening reflection
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Privacy Section */}
          <div className={`p-6 rounded-xl ${
            theme === 'morning' 
              ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
              : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <Shield className={`w-6 h-6 ${
                theme === 'morning' ? 'text-red-500' : 'text-red-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Privacy & Data
              </h2>
            </div>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                theme === 'morning' 
                  ? 'border-gray-200 bg-gray-50' 
                  : 'border-gray-600 bg-gray-700'
              }`}>
                <div className={`text-sm ${
                  theme === 'morning' ? 'text-gray-700' : 'text-gray-200'
                }`}>
                  Your journal entries are stored locally on your device and are not shared with anyone. 
                  This is a demo version - in a production app, data would be securely encrypted and stored.
                </div>
              </div>
              <button className={`w-full p-3 rounded-lg font-medium transition-colors ${
                theme === 'morning'
                  ? 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300'
                  : 'bg-red-900 hover:bg-red-800 text-red-200 border border-red-700'
              }`}>
                Clear All Data
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className={`p-6 rounded-xl ${
            theme === 'morning' 
              ? 'bg-white/80 backdrop-blur-sm shadow-lg' 
              : 'bg-gray-800/80 backdrop-blur-sm shadow-lg'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <LogOut className={`w-6 h-6 ${
                theme === 'morning' ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <h2 className={`text-xl font-semibold ${
                theme === 'morning' ? 'text-gray-800' : 'text-white'
              }`}>
                Account
              </h2>
            </div>
            <button
              onClick={handleLogout}
              className={`w-full p-3 rounded-lg font-medium transition-colors ${
                theme === 'morning'
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;