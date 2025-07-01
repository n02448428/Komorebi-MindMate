import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy load all page components with error boundaries
const AuthPage = lazy(() => import('./pages/AuthPage').catch(() => ({ default: () => <div>Error loading page</div> })));
const MainSession = lazy(() => import('./pages/MainSession').catch(() => ({ default: () => <div>Error loading page</div> })));
const InsightsGallery = lazy(() => import('./pages/InsightsGallery').catch(() => ({ default: () => <div>Error loading page</div> })));
const ChatArchive = lazy(() => import('./pages/ChatArchive').catch(() => ({ default: () => <div>Error loading page</div> })));
const ProUpgrade = lazy(() => import('./pages/ProUpgrade').catch(() => ({ default: () => <div>Error loading page</div> })));
const Settings = lazy(() => import('./pages/Settings').catch(() => ({ default: () => <div>Error loading page</div> })));
const AllInsights = lazy(() => import('./pages/AllInsights').catch(() => ({ default: () => <div>Error loading page</div> })));

// Enhanced loading component
const LoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-indigo-600 font-medium">Loading...</p>
    </div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h2>
            <p className="text-red-600 mb-4">Please refresh the page to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function AppRoutes() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;