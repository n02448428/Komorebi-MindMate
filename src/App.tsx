import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LandingPage from './pages/LandingPage';
import MainSession from './pages/MainSession';
import ProUpgrade from './pages/ProUpgrade';
import Settings from './pages/Settings';
import InsightsGallery from './pages/InsightsGallery';
import AllInsights from './pages/AllInsights';
import ChatArchive from './pages/ChatArchive';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/session" element={<MainSession />} />
            <Route path="/pro-upgrade" element={<ProUpgrade />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/insights" element={<InsightsGallery />} />
            <Route path="/all-insights" element={<AllInsights />} />
            <Route path="/chat-archive" element={<ChatArchive />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;