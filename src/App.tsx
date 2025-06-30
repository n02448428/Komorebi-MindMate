import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import MainSession from './pages/MainSession';
import InsightsGallery from './pages/InsightsGallery';
import ChatArchive from './pages/ChatArchive';
import ProUpgrade from './pages/ProUpgrade';
import Settings from './pages/Settings';
import AllInsights from './pages/AllInsights';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root route always goes to session - no landing page */}
      <Route path="/" element={<Navigate to="/session" replace />} />
      
      {/* Authentication page for sign up/sign in */}
      <Route path="/auth" element={<AuthPage />} />
      
      {/* Main session - accessible to everyone (logged in users and guests) */}
      <Route path="/session" element={<MainSession />} />
      
      {/* Insights pages - accessible to everyone */}
      <Route path="/insights" element={<InsightsGallery />} />
      <Route path="/all-insights" element={<AllInsights />} />
      <Route path="/archive" element={<ChatArchive />} />
      
      {/* These routes still require authentication */}
      <Route
        path="/upgrade"
        element={
          <ProtectedRoute>
            <ProUpgrade />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      
      {/* Redirect any unknown routes to session */}
      <Route path="*" element={<Navigate to="/session" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;