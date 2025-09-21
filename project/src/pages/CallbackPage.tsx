import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { parseOAuthError } from '@/utils/oauth';

type CallbackStatus = 'loading' | 'success' | 'error';

/**
 * OAuth callback page that handles Spotify authentication response
 * Processes auth code and redirects to dashboard or shows errors
 */
export default function CallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleCallback, isCallbackLoading } = useAuth();
  
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Check for OAuth errors first
        const oauthError = parseOAuthError(searchParams);
        if (oauthError) {
          setStatus('error');
          setError(oauthError.error_description || `Authentication error: ${oauthError.error}`);
          return;
        }

        // Get authorization code and state
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        if (!code) {
          setStatus('error');
          setError('No authorization code received from Spotify');
          return;
        }

        if (!state) {
          setStatus('error');
          setError('No state parameter received - security check failed');
          return;
        }

        // Exchange code for tokens
        await handleCallback({ code, state });
        
        setStatus('success');
        
        // Redirect to dashboard after a brief success message
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);

      } catch (err) {
        console.error('Callback processing failed:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    processCallback();
  }, [searchParams, handleCallback, navigate]);

  // Auto-redirect to login on error after delay
  useEffect(() => {
    if (status === 'error') {
      const timer = setTimeout(() => {
        navigate('/login', { 
          replace: true,
          state: { 
            error: error || 'Authentication failed, please try again' 
          }
        });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [status, error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-spotify-green/20 via-background to-spotify-green/10 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-xl p-8 shadow-xl text-center">
          {status === 'loading' && (
            <LoadingState isLoading={isCallbackLoading} />
          )}
          
          {status === 'success' && (
            <SuccessState />
          )}
          
          {status === 'error' && (
            <ErrorState error={error} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading state component
 */
function LoadingState({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="space-y-6">
      {/* Animated Spotify icon */}
      <div className="flex justify-center">
        <div className={`w-16 h-16 rounded-full bg-spotify-green flex items-center justify-center ${isLoading ? 'animate-pulse' : ''}`}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="black"
            className={isLoading ? 'animate-spin' : ''}
          >
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-card-foreground">
          Completing Login...
        </h2>
        <p className="text-muted-foreground">
          We're setting up your VibeGuess account with Spotify
        </p>
      </div>

      {/* Progress steps */}
      <div className="space-y-3 text-sm">
        <ProgressStep 
          completed={true} 
          text="Connected to Spotify" 
        />
        <ProgressStep 
          completed={isLoading} 
          loading={isLoading}
          text="Verifying permissions" 
        />
        <ProgressStep 
          completed={false} 
          text="Setting up your account" 
        />
      </div>
    </div>
  );
}

/**
 * Success state component
 */
function SuccessState() {
  return (
    <div className="space-y-6">
      {/* Success checkmark */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-card-foreground">
          Welcome to VibeGuess!
        </h2>
        <p className="text-muted-foreground">
          Your Spotify account has been successfully connected
        </p>
      </div>

      {/* Redirect message */}
      <div className="bg-spotify-green/10 border border-spotify-green/20 rounded-lg p-4">
        <p className="text-sm text-spotify-green font-medium">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}

/**
 * Error state component
 */
function ErrorState({ error }: { error: string | null }) {
  return (
    <div className="space-y-6">
      {/* Error icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-destructive">
          Authentication Failed
        </h2>
        <p className="text-muted-foreground">
          {error || 'Something went wrong during the login process'}
        </p>
      </div>

      {/* Auto-redirect message */}
      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          You'll be redirected to the login page in a few seconds...
        </p>
      </div>

      {/* Manual redirect button */}
      <button
        onClick={() => window.location.href = '/login'}
        className="text-sm text-primary hover:underline"
      >
        Go to login page now
      </button>
    </div>
  );
}

/**
 * Progress step component
 */
function ProgressStep({ 
  completed, 
  loading = false, 
  text 
}: { 
  completed: boolean; 
  loading?: boolean; 
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-spotify-green/30 border-t-spotify-green" />
        ) : completed ? (
          <div className="w-4 h-4 rounded-full bg-spotify-green flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
        )}
      </div>
      <span className={`text-sm ${completed ? 'text-foreground' : 'text-muted-foreground'}`}>
        {text}
      </span>
    </div>
  );
}