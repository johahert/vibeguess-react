import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useAuthActions } from '@/stores/auth.store';
import authService from '@/services/auth.service';

/**
 * Custom hook for authentication with TanStack Query integration
 * Provides reactive auth state and operations with caching
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const authActions = useAuthActions();

  // Query for current user data (only runs when authenticated)
  const userQuery = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authService.getCurrentUser(),
    enabled: authStore.isAuthenticated && !!authStore.getAccessToken(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (token expired)
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
    meta: {
      errorMessage: 'Failed to load user profile',
    },
  });

  // Mutation for login initiation
  const loginMutation = useMutation({
    mutationFn: authActions.login,
    onSuccess: () => {
      // Login initiation successful, user will be redirected
      console.log('Login initiated, redirecting to Spotify...');
    },
    onError: (error) => {
      console.error('Login initiation failed:', error);
    },
  });

  // Mutation for OAuth callback handling
  const callbackMutation = useMutation({
    mutationFn: ({ code, state }: { code: string; state: string }) =>
      authActions.handleCallback(code, state),
    onSuccess: (data) => {
      // Update user query cache with new data
      queryClient.setQueryData(['auth', 'user'], data.user);
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
      
      console.log('Authentication successful');
    },
    onError: (error) => {
      console.error('OAuth callback failed:', error);
      
      // Clear any cached auth data on failure
      queryClient.removeQueries({ queryKey: ['auth'] });
    },
  });

  // Mutation for token refresh
  const refreshMutation = useMutation({
    mutationFn: authActions.refreshToken,
    onSuccess: () => {
      // Invalidate user query to refetch with new token
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
    onError: (error) => {
      console.error('Token refresh failed:', error);
      
      // Clear auth cache and logout
      queryClient.removeQueries({ queryKey: ['auth'] });
      authActions.logout();
    },
  });

  // Mutation for logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      authActions.logout();
    },
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: ['auth'] });
      
      // Clear user-specific data
      queryClient.removeQueries({ queryKey: ['user'] });
      queryClient.removeQueries({ queryKey: ['playlists'] });
      
      console.log('Logout successful');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });

  // Auto-refresh token when it's about to expire
  const tokenRefreshQuery = useQuery({
    queryKey: ['auth', 'token-refresh'],
    queryFn: async () => {
      if (authStore.isTokenExpired()) {
        return authActions.refreshToken();
      }
      return null;
    },
    enabled: authStore.isAuthenticated && authStore.isTokenExpired(),
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    retry: false, // Don't retry failed refreshes
  });

  return {
    // Auth state from store
    isAuthenticated: authStore.isAuthenticated,
    isLoading: authStore.isLoading || userQuery.isLoading,
    error: authStore.error || userQuery.error?.message || null,
    
    // User data from query
    user: userQuery.data || authStore.user,
    
    // Token utilities
    accessToken: authStore.getAccessToken(),
    isTokenExpired: authStore.isTokenExpired(),
    
    // Actions
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    handleCallback: callbackMutation.mutate,
    refreshToken: refreshMutation.mutate,
    
    // Loading states for individual operations
    isLoginLoading: loginMutation.isPending,
    isCallbackLoading: callbackMutation.isPending,
    isRefreshLoading: refreshMutation.isPending || tokenRefreshQuery.isLoading,
    isLogoutLoading: logoutMutation.isPending,
    
    // Error states
    loginError: loginMutation.error?.message || null,
    callbackError: callbackMutation.error?.message || null,
    refreshError: refreshMutation.error?.message || null,
    
    // Query utilities
    refetchUser: userQuery.refetch,
    invalidateAuth: () => queryClient.invalidateQueries({ queryKey: ['auth'] }),
    
    // Clear errors
    clearError: authStore.clearError,
  };
}

/**
 * Hook for initializing auth state on app startup
 */
export function useAuthInitialization() {
  const authStore = useAuthStore();

  const initQuery = useQuery({
    queryKey: ['auth', 'initialize'],
    queryFn: authStore.initialize,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  return {
    isInitializing: initQuery.isLoading,
    initializationError: initQuery.error,
    isInitialized: initQuery.isSuccess,
  };
}

/**
 * Hook for making authenticated Spotify API requests
 */
export function useSpotifyApi() {
  const { accessToken, refreshToken } = useAuth();

  const makeRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    if (!accessToken) {
      throw new Error('No access token available');
    }

    try {
      return await authService.spotifyApiRequest<T>(endpoint, options);
    } catch (error) {
      // If token is expired, try to refresh and retry
      if (error instanceof Error && error.message.includes('401')) {
        await refreshToken();
        return authService.spotifyApiRequest<T>(endpoint, options);
      }
      throw error;
    }
  };

  return { makeRequest };
}

/**
 * Hook for checking authentication status with loading states
 */
export function useAuthStatus() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { isInitializing } = useAuthInitialization();

  return {
    isAuthenticated,
    isLoading: isLoading || isInitializing,
    user,
    isReady: !isInitializing,
  };
}