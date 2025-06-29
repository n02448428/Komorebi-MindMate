import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  User,
  Bell,
  Palette,
  Volume2,
  Shield,
  Download,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Check,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type ThemeMode = 'light' | 'dark' | 'system';
type NotificationSetting = 'all' | 'important' | 'none';

interface UserSettings {
  theme: ThemeMode;
  notifications: NotificationSetting;
  soundEnabled: boolean;
  backgroundVideos: boolean;
  sessionReminders: boolean;
  insightSharing: boolean;
  dataCollection: boolean;
}

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'system',
    notifications: 'all',
    soundEnabled: true,
    backgroundVideos: true,
    sessionReminders: true,
    insightSharing: false,
    dataCollection: true
  });
  
  const [activeSection, setActiveSection] = useState<string>('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Here you would typically save to your backend/storage
  };

  const handleExportData = () => {
    // Implement data export functionality
    console.log('Exporting user data...');
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = async () => {
    // Implement account deletion
    console.log('Deleting account...');
    setShowDeleteConfirm(false);
  };

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor
  };

  const settingSections = [
    { id: 'general', label: 'General', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'audio', label: 'Audio & Video', icon: Volume2 },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
    { id: 'account', label: 'Account', icon: User }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Session Reminders</label>
              <p className="text-xs text-gray-500">Get notified to start your mindfulness practice</p>
            </div>
            <button
              onClick={() => updateSetting('sessionReminders', !settings.sessionReminders)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.sessionReminders ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.sessionReminders ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { value: 'all', label: 'All Notifications', description: 'Receive all app notifications' },
            { value: 'important', label: 'Important Only', description: 'Only receive important updates' },
            { value: 'none', label: 'None', description: 'Turn off all notifications' }
          ].map((option) => (
            <div
              key={option.value}
              onClick={() => updateSetting('notifications', option.value as NotificationSetting)}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                settings.notifications === option.value
                  ? 'border-blue-600 bg-blue-600'
                  : 'border-gray-300'
              }`}>
                {settings.notifications === option.value && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(themeIcons).map(([theme, Icon]) => (
            <button
              key={theme}
              onClick={() => updateSetting('theme', theme as ThemeMode)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                settings.theme === theme
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${
                settings.theme === theme ? 'text-blue-600' : 'text-gray-600'
              }`} />
              <div className={`text-sm font-medium capitalize ${
                settings.theme === theme ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {theme}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAudioVideoSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Audio & Video</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Sound Effects</label>
              <p className="text-xs text-gray-500">Enable audio feedback and ambient sounds</p>
            </div>
            <button
              onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Background Videos</label>
              <p className="text-xs text-gray-500">Show nature videos during sessions</p>
            </div>
            <button
              onClick={() => updateSetting('backgroundVideos', !settings.backgroundVideos)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.backgroundVideos ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.backgroundVideos ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Data</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Insight Sharing</label>
              <p className="text-xs text-gray-500">Allow insights to be shared anonymously for research</p>
            </div>
            <button
              onClick={() => updateSetting('insightSharing', !settings.insightSharing)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.insightSharing ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.insightSharing ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Usage Analytics</label>
              <p className="text-xs text-gray-500">Help improve the app by sharing usage data</p>
            </div>
            <button
              onClick={() => updateSetting('dataCollection', !settings.dataCollection)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.dataCollection ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.dataCollection ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export My Data
          </button>
        </div>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Management</h3>
        
        {user && (
          <div className="p-4 bg-gray-50 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{user.email}</div>
                <div className="text-sm text-gray-500">Member since {new Date(user.created_at).getFullYear()}</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Sign Out
          </button>

          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'audio':
        return renderAudioVideoSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'account':
        return renderAccountSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">Customize your mindfulness experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <nav className="space-y-1">
                {settingSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderSectionContent()}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. All your data, including sessions and insights, will be permanently deleted.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAccount}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Settings;