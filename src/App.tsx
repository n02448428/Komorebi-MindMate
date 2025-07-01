import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy load all page components
const AuthPage = lazy(() => import('./pages/AuthPage'));
const MainSession = lazy(() => import('./pages/MainSession'));
const InsightsGallery = lazy(() => import('./pages/InsightsGallery'));
const ChatArchive = lazy(() => import('./pages/ChatArchive'));
const ProUpgrade = lazy(() => import('./pages/ProUpgrade'));
const Settings = lazy(() => import('./pages/Settings'));
const AllInsights = lazy(() => import('./pages/AllInsights'));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-indigo-600 font-medium">Loading...</p>
    </div>
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
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
    </Suspense>
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