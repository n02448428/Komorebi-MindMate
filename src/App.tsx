import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import MainSession from './pages/MainSession';
import InsightsGallery from './pages/InsightsGallery';
import AllInsights from './pages/AllInsights';
import ChatArchive from './pages/ChatArchive';
import ProUpgrade from './pages/ProUpgrade';
import Settings from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <MainSession /> : <LandingPage />} />
      <Route path="/insights" element={
        <ProtectedRoute>
          <InsightsGallery />
        </ProtectedRoute>
      } />
      <Route path="/insights-gallery" element={
        <ProtectedRoute>
          <AllInsights />
        </ProtectedRoute>
      } />
      <Route path="/chat-archive" element={
        <ProtectedRoute>
          <ChatArchive />
        </ProtectedRoute>
      } />
      <Route path="/pro-upgrade" element={
        <ProtectedRoute>
          <ProUpgrade />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;