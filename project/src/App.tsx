import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Pages
import LoginPage from '@/pages/LoginPage';
import CallbackPage from '@/pages/CallbackPage';
import HomePage from '@/pages/HomePage';

// Components
import AuthGuard from '@/components/auth/AuthGuard';

// Hooks
import { useAuthInitialization } from '@/hooks/useAuth';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (error instanceof Error) {
          const message = error.message.toLowerCase();
          if (message.includes('401') || message.includes('403')) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

/**
 * App initialization component that handles auth setup
 */
function AppInitializer({ children }: { children: React.ReactNode }) {
  const { isInitializing, initializationError } = useAuthInitialization();

  useEffect(() => {
    if (initializationError) {
      console.error('App initialization failed:', initializationError);
    }
  }, [initializationError]);

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-spotify-green/20 via-background to-spotify-green/10">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-spotify-green flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="black"
              className="animate-spin"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            <span className="text-spotify-green">Vibe</span>Guess
          </h1>
          <p className="text-muted-foreground">
            Initializing your music quiz experience...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Main App component with routing and providers
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInitializer>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/callback" element={<CallbackPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <AuthGuard>
                  <HomePage />
                </AuthGuard>
              } />
              
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </AppInitializer>
      </BrowserRouter>
      
      {/* React Query Dev Tools (only in development) */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

export default App;
