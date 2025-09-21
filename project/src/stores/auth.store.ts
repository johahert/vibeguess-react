import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AuthTokens, SpotifyUser, AuthState } from '@/types/auth';
import authService from '@/services/auth.service';

/**
 * Authentication store using Zustand
 * Manages auth state, tokens, and user data with persistence
 */
interface AuthStore extends AuthState {
  // Actions
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: SpotifyUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  logout: () => void;
  initialize: () => Promise<{ success: boolean; reason?: string; error?: unknown; user?: SpotifyUser }>;
  
  // Computed properties
  isTokenExpired: () => boolean;
  getAccessToken: () => string | null;
}

/**
 * Check if token is expired or will expire within 5 minutes
 */
function isTokenExpired(tokens: AuthTokens | null): boolean {
  if (!tokens) return true;
  
  // Calculate expiry time (tokens.expires_in is in seconds)
  const expiryTime = Date.now() + (tokens.expires_in * 1000);
  const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
  
  return expiryTime <= fiveMinutesFromNow;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isAuthenticated: false,
        user: null,
        tokens: null,
        isLoading: false,
        error: null,

        // Actions
        setTokens: (tokens: AuthTokens) => {
          set((state) => ({
            ...state,
            tokens,
            isAuthenticated: true,
            error: null,
          }));
        },

        setUser: (user: SpotifyUser | null) => {
          set((state) => ({
            ...state,
            user,
            isAuthenticated: !!user,
          }));
        },

        setLoading: (isLoading: boolean) => {
          set((state) => ({
            ...state,
            isLoading,
          }));
        },

        setError: (error: string | null) => {
          set((state) => ({
            ...state,
            error,
            isLoading: false,
          }));
        },

        clearError: () => {
          set((state) => ({
            ...state,
            error: null,
          }));
        },

        logout: () => {
          // Clear auth service data
          authService.logout();
          
          // Reset store state
          set({
            isAuthenticated: false,
            user: null,
            tokens: null,
            isLoading: false,
            error: null,
          });
        },

        initialize: async () => {
          const { setLoading, setTokens, setUser, setError } = get();
          
          try {
            setLoading(true);
            setError(null);

            // Check if we have stored tokens
            const storedTokens = authService.getStoredTokens();
            
            if (!storedTokens) {
              // No tokens, user is not authenticated
              setLoading(false);
              return { success: false, reason: 'no_tokens' };
            }

            // Check if token is expired
            if (isTokenExpired(storedTokens)) {
              try {
                // Try to refresh the token
                const newTokens = await authService.refreshToken();
                setTokens(newTokens);
              } catch (refreshError) {
                // Refresh failed, clear tokens and logout
                console.warn('Token refresh failed during initialization:', refreshError);
                authService.logout();
                setLoading(false);
                return { success: false, reason: 'refresh_failed', error: refreshError };
              }
            } else {
              // Tokens are valid, set them in store
              setTokens(storedTokens);
            }

            // Get user profile
            const user = await authService.getCurrentUser();
            setUser(user);
            setLoading(false);
            return { success: true, user };

          } catch (error) {
            console.error('Auth initialization failed:', error);
            setError(error instanceof Error ? error.message : 'Authentication failed');
            
            // Clear invalid auth state
            authService.logout();
            setLoading(false);
            return { success: false, reason: 'init_failed', error };
          }
        },

        // Computed properties
        isTokenExpired: () => {
          const { tokens } = get();
          return isTokenExpired(tokens);
        },

        getAccessToken: () => {
          const { tokens } = get();
          return tokens?.access_token || null;
        },
      }),
      {
        name: 'vibeguess-auth',
        // Only persist essential data, not sensitive tokens
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          // Don't persist tokens - they're stored separately by authService
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);

// Helper hook for common auth operations
export const useAuthActions = () => {
  const store = useAuthStore();
  
  return {
    login: async () => {
      try {
        store.setLoading(true);
        store.clearError();
        
        const { authorization_url } = await authService.initiateSpotifyLogin();
        
        // Redirect to Spotify
        window.location.href = authorization_url;
      } catch (error) {
        store.setError(error instanceof Error ? error.message : 'Login failed');
        throw error;
      }
    },

    handleCallback: async (code: string, state: string) => {
      try {
        store.setLoading(true);
        store.clearError();

        // Exchange code for tokens
        const tokens = await authService.handleCallback(code, state);
        store.setTokens(tokens);

        // Get user profile
        const user = await authService.getCurrentUser();
        store.setUser(user);

        return { tokens, user };
      } catch (error) {
        store.setError(error instanceof Error ? error.message : 'Callback failed');
        throw error;
      } finally {
        store.setLoading(false);
      }
    },

    refreshToken: async () => {
      try {
        const tokens = await authService.refreshToken();
        store.setTokens(tokens);
        return tokens;
      } catch (error) {
        store.setError(error instanceof Error ? error.message : 'Token refresh failed');
        store.logout();
        throw error;
      }
    },

    logout: () => {
      store.logout();
    },
  };
};