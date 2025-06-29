import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import MainSession from './pages/MainSession';
import Settings from './pages/Settings';
import ProUpgrade from './pages/ProUpgrade';
import InsightsGallery from './pages/InsightsGallery';
import ChatArchive from './pages/ChatArchive';
import AllInsights from './pages/AllInsights';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/session" element={<MainSession />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/pro" element={<ProUpgrade />} />
            <Route path="/insights" element={<InsightsGallery />} />
            <Route path="/chat-archive" element={<ChatArchive />} />
            <Route path="/all-insights" element={<AllInsights />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;