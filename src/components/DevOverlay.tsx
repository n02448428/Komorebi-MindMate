import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Code, 
  Navigation, 
  User, 
  Settings, 
  Eye, 
  X, 
  ChevronDown,
  ChevronRight,
  Home,
  Sunrise,
  Moon,
  Gallery,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  Bug,
  Zap
} from 'lucide-react';

interface DevOverlayProps {
  onRemove: () => void;
}

const DevOverlay: React.FC<DevOverlayProps> = ({ onRemove }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'nav' | 'auth' | 'theme' | 'viewport' | 'debug'>('nav');

  const pages = [
    { path: '/', name: 'Landing Page', icon: <Home className="w-4 h-4" /> },
    { path: '/morning', name: 'Morning Session', icon: <Sunrise className="w-4 h-4" /> },
    { path: '/evening', name: 'Evening Session', icon: <Moon className="w-4 h-4" /> },
    { path: '/insights', name: 'Insights Gallery', icon: <Gallery className="w-4 h-4" /> },
    { path: '/settings', name: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleQuickLogin = async () => {
    if (!user) {
      await login('dev@example.com', 'password');
    } else {
      logout();
    }
  };

  const handleViewportChange = (width: string) => {
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.style.width = width;
    }
  };

  const currentPage = pages.find(page => page.path === location.pathname);

  return (
    <div className="fixed top-4 right-4 z-[9999] font-mono">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gray-900 text-white p-3 rounded-lg shadow-lg hover:bg-gray-800 transition-all duration-200 flex items-center gap-2"
      >
        <Code className="w-5 h-5" />
        <span className="text-sm font-medium">DEV</span>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="mt-2 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 w-80 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-lg font-bold text-green-400">Dev Tools</h3>
            <button
              onClick={onRemove}
              className="text-red-400 hover:text-red-300 p-1 rounded"
              title="Remove Dev Overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Page Info */}
          <div className="p-3 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              {currentPage?.icon}
              <span className="text-blue-400">{currentPage?.name || 'Unknown Page'}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">{location.pathname}</div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-700">
            {[
              { id: 'nav', label: 'Nav', icon: <Navigation className="w-4 h-4" /> },
              { id: 'auth', label: 'Auth', icon: <User className="w-4 h-4" /> },
              { id: 'theme', label: 'Theme', icon: <Palette className="w-4 h-4" /> },
              { id: 'viewport', label: 'View', icon: <Monitor className="w-4 h-4" /> },
              { id: 'debug', label: 'Debug', icon: <Bug className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 p-2 text-xs flex items-center justify-center gap-1 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {/* Navigation Tab */}
            {activeTab === 'nav' && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-green-400 mb-3">Quick Navigation</h4>
                {pages.map((page) => (
                  <button
                    key={page.path}
                    onClick={() => navigate(page.path)}
                    className={`w-full p-2 rounded text-left text-sm flex items-center gap-2 transition-colors ${
                      location.pathname === page.path
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    {page.icon}
                    {page.name}
                  </button>
                ))}
              </div>
            )}

            {/* Auth Tab */}
            {activeTab === 'auth' && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-green-400">Authentication</h4>
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">
                    Status: {user ? 'Logged In' : 'Logged Out'}
                  </div>
                  {user && (
                    <div className="text-xs text-gray-400">
                      Email: {user.email}
                    </div>
                  )}
                  {user && (
                    <div className="text-xs text-gray-400">
                      Plan: {user.isPro ? 'Pro' : 'Free'}
                    </div>
                  )}
                  <button
                    onClick={handleQuickLogin}
                    className={`w-full p-2 rounded text-sm transition-colors ${
                      user
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {user ? 'Quick Logout' : 'Quick Login'}
                  </button>
                </div>
              </div>
            )}

            {/* Theme Tab */}
            {activeTab === 'theme' && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-green-400">Theme Controls</h4>
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">
                    Current: {theme === 'morning' ? 'Morning (Light)' : 'Evening (Dark)'}
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="w-full p-2 rounded text-sm bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center justify-center gap-2"
                  >
                    {theme === 'morning' ? <Moon className="w-4 h-4" /> : <Sunrise className="w-4 h-4" />}
                    Toggle Theme
                  </button>
                </div>
              </div>
            )}

            {/* Viewport Tab */}
            {activeTab === 'viewport' && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-green-400">Viewport Testing</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Desktop', width: '100%', icon: <Monitor className="w-4 h-4" /> },
                    { name: 'Tablet', width: '768px', icon: <Tablet className="w-4 h-4" /> },
                    { name: 'Mobile', width: '375px', icon: <Smartphone className="w-4 h-4" /> },
                  ].map((viewport) => (
                    <button
                      key={viewport.name}
                      onClick={() => handleViewportChange(viewport.width)}
                      className="w-full p-2 rounded text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors flex items-center gap-2"
                    >
                      {viewport.icon}
                      {viewport.name} ({viewport.width})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Debug Tab */}
            {activeTab === 'debug' && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-green-400">Debug Tools</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full p-2 rounded text-sm bg-orange-600 hover:bg-orange-700 text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reload Page
                  </button>
                  <button
                    onClick={() => console.log('Current State:', { user, theme, location: location.pathname })}
                    className="w-full p-2 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Log State
                  </button>
                  <div className="text-xs text-gray-400 p-2 bg-gray-800 rounded">
                    <div>Build: Development</div>
                    <div>React: {React.version}</div>
                    <div>Timestamp: {new Date().toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevOverlay;