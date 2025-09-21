import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginButton from '@/components/auth/LoginButton';

/**
 * Login page for Spotify OAuth authentication
 * Handles both initial login and error states
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoginLoading, loginError, clearError } = useAuth();
  
  const [error, setError] = useState<string | null>(null);

  // Parse URL parameters for OAuth errors
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const oauthError = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (oauthError) {
      const errorMessage = errorDescription 
        ? decodeURIComponent(errorDescription)
        : `Authentication failed: ${oauthError}`;
      setError(errorMessage);
    }
  }, [location.search]);

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleLogin = async () => {
    try {
      clearError();
      setError(null);
      await login();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    }
  };

  const displayError = error || loginError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-spotify-green/20 via-background to-spotify-green/10 p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-spotify-green flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="black"
                aria-label="VibeGuess logo"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome to <span className="text-spotify-green">VibeGuess</span>
          </h1>
          
          <p className="text-muted-foreground text-lg leading-relaxed">
            Create interactive music quizzes from your Spotify playlists
          </p>
        </div>

        {/* Login card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-xl">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-card-foreground">
                Get Started
              </h2>
              <p className="text-muted-foreground">
                Connect your Spotify account to access your playlists and create amazing music quizzes
              </p>
            </div>

            {/* Error display */}
            {displayError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-destructive mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-destructive">
                      Authentication Error
                    </h3>
                    <p className="text-sm text-destructive/80 mt-1">
                      {displayError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Login button */}
            <LoginButton
              onClick={handleLogin}
              loading={isLoginLoading}
              className="text-lg py-4"
            />

            {/* Features preview */}
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
                What you can do with VibeGuess:
              </h3>
              <div className="space-y-3">
                <FeatureItem
                  icon="🎵"
                  text="Create quizzes from any of your Spotify playlists"
                />
                <FeatureItem
                  icon="🤖"
                  text="AI-powered question generation based on your music"
                />
                <FeatureItem
                  icon="🎮"
                  text="Play interactive music trivia with friends"
                />
                <FeatureItem
                  icon="📊"
                  text="Track your quiz performance and music knowledge"
                />
              </div>
            </div>

            {/* Privacy note */}
            <div className="text-xs text-muted-foreground text-center border-t border-border pt-4">
              <p>
                We only access your public playlist data. Your Spotify account remains secure.
              </p>
            </div>
          </div>
        </div>

        {/* Help link */}
        <div className="text-center mt-6">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Need help? Contact support
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Feature item component for the features list
 */
function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}