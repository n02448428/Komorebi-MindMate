import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import MorningSession from './pages/MorningSession';
import EveningSession from './pages/EveningSession';
import InsightsGallery from './pages/InsightsGallery';
import Settings from './pages/Settings';
import DevOverlay from './components/DevOverlay';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/morning" /> : <LandingPage />} />
      <Route path="/morning" element={
        <ProtectedRoute>
          <MorningSession />
        </ProtectedRoute>
      } />
      <Route path="/evening" element={
        <ProtectedRoute>
          <EveningSession />
        </ProtectedRoute>
      } />
      <Route path="/insights" element={
        <ProtectedRoute>
          <InsightsGallery />
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
  const [showDevOverlay, setShowDevOverlay] = useState(true);

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppRoutes />
          {showDevOverlay && (
            <DevOverlay onRemove={() => setShowDevOverlay(false)} />
          )}
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;