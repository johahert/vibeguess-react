import type { 
  AuthTokens, 
  SpotifyUser, 
  LoginResponse, 
  CallbackRequest,
  TokenRefreshRequest
} from '@/types/auth';

import { SPOTIFY_SCOPES } from '@/types/auth';

import { 
  generateCodeChallenge, 
  generateState, 
  buildSpotifyAuthURL,
  storePKCEVerifier,
  storeOAuthState,
  retrievePKCEVerifier,
  retrieveOAuthState,
  validateState
} from '@/utils/oauth';

/**
 * Authentication service for Spotify OAuth 2.0 PKCE flow
 * Handles login, callback, token refresh, and user profile
 */
class AuthService {
  private baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  private clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  private redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/callback`;

  constructor() {
    if (!this.clientId) {
      console.warn('VITE_SPOTIFY_CLIENT_ID is not configured');
    }
  }

  /**
   * Initiate Spotify OAuth login flow
   * Generates PKCE parameters and redirects to Spotify
   */
  async initiateSpotifyLogin(): Promise<LoginResponse> {
    try {
      // In development with MSW enabled, use mock flow
      if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
        return this.mockSpotifyLogin();
      }

      // Generate PKCE parameters
      const { codeVerifier, codeChallenge } = await generateCodeChallenge();
      const state = generateState();

      // Store PKCE verifier and state for callback validation
      storePKCEVerifier(codeVerifier);
      storeOAuthState(state);

      // Build authorization URL
      const authURL = buildSpotifyAuthURL({
        client_id: this.clientId!,
        response_type: 'code',
        redirect_uri: this.redirectUri,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        state,
        scope: SPOTIFY_SCOPES.join(' '),
      });

      return {
        authorization_url: authURL,
        state,
      };
    } catch (error) {
      console.error('Failed to initiate Spotify login:', error);
      throw new Error('Failed to initiate login process');
    }
  }

  /**
   * Mock Spotify login for development testing
   */
  private async mockSpotifyLogin(): Promise<LoginResponse> {
    // Generate mock PKCE parameters
    const { codeVerifier } = await generateCodeChallenge();
    const state = generateState();

    // Store for callback validation
    storePKCEVerifier(codeVerifier);
    storeOAuthState(state);

    // Return mock callback URL instead of Spotify URL
    const mockCallbackURL = `${window.location.origin}/callback?code=mock_auth_code&state=${state}`;

    return {
      authorization_url: mockCallbackURL,
      state,
    };
  }

  /**
   * Mock callback handler for development testing
   */
  private async mockCallbackHandler(_code: string, state: string): Promise<AuthTokens> {
    // Validate state parameter (same as real flow)
    const storedState = retrieveOAuthState();
    if (!storedState || !validateState(state, storedState)) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    // Create mock tokens
    const mockTokens: AuthTokens = {
      access_token: 'mock_access_token_' + Date.now(),
      token_type: 'Bearer',
      scope: SPOTIFY_SCOPES.join(' '),
      expires_in: 3600, // 1 hour
      refresh_token: 'mock_refresh_token_' + Date.now(),
    };

    // Store tokens
    this.storeTokens(mockTokens);

    return mockTokens;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   * @param code Authorization code from Spotify
   * @param state State parameter for CSRF protection
   */
  async handleCallback(code: string, state: string): Promise<AuthTokens> {
    try {
      // In development with MSW enabled, use mock callback
      if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
        return this.mockCallbackHandler(code, state);
      }

      // Validate state parameter
      const storedState = retrieveOAuthState();
      if (!storedState || !validateState(state, storedState)) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      // Retrieve PKCE verifier
      const codeVerifier = retrievePKCEVerifier();
      if (!codeVerifier) {
        throw new Error('Code verifier not found - invalid OAuth flow');
      }

      // Exchange code for tokens
      const requestBody: CallbackRequest = { code, state };
      
      const response = await fetch(`${this.baseURL}/auth/spotify/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestBody,
          code_verifier: codeVerifier,
          client_id: this.clientId,
          redirect_uri: this.redirectUri,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error_description || `Token exchange failed: ${response.status}`);
      }

      const tokens: AuthTokens = await response.json();

      // Store tokens securely
      this.storeTokens(tokens);

      return tokens;
    } catch (error) {
      console.error('OAuth callback failed:', error);
      throw error;
    }
  }

  /**
   * Refresh expired access token using refresh token
   */
  async refreshToken(): Promise<AuthTokens> {
    try {
      const currentTokens = this.getStoredTokens();
      if (!currentTokens?.refresh_token) {
        throw new Error('No refresh token available');
      }

      const requestBody: TokenRefreshRequest = {
        refresh_token: currentTokens.refresh_token,
      };

      const response = await fetch(`${this.baseURL}/auth/spotify/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestBody,
          client_id: this.clientId,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error_description || `Token refresh failed: ${response.status}`);
      }

      const newTokens: AuthTokens = await response.json();

      // Store new tokens
      this.storeTokens(newTokens);

      return newTokens;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear invalid tokens
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Get current user profile from Spotify API
   */
  async getCurrentUser(): Promise<SpotifyUser> {
    try {
      const tokens = this.getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error('No access token available');
      }

      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshToken();
        return this.getCurrentUser(); // Retry with new token
      }

      if (!response.ok) {
        throw new Error(`Failed to get user profile: ${response.status}`);
      }

      const user: SpotifyUser = await response.json();
      return user;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw error;
    }
  }

  /**
   * Logout user and clear all stored data
   */
  logout(): void {
    try {
      // Clear tokens
      this.clearTokens();
      
      // Clear any OAuth state
      sessionStorage.removeItem('oauth_code_verifier');
      sessionStorage.removeItem('oauth_state');
      
      // Clear any other auth-related data
      localStorage.removeItem('auth_user');
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    const tokens = this.getStoredTokens();
    return !!(tokens?.access_token);
  }

  /**
   * Get stored authentication tokens
   */
  getStoredTokens(): AuthTokens | null {
    try {
      const tokensStr = localStorage.getItem('auth_tokens');
      if (!tokensStr) return null;
      
      return JSON.parse(tokensStr);
    } catch (error) {
      console.error('Failed to parse stored tokens:', error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Store authentication tokens securely
   * @param tokens Tokens to store
   */
  private storeTokens(tokens: AuthTokens): void {
    try {
      // In production, consider encrypting tokens before storage
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Failed to store tokens:', error);
      throw new Error('Failed to store authentication tokens');
    }
  }

  /**
   * Clear stored authentication tokens
   */
  private clearTokens(): void {
    try {
      localStorage.removeItem('auth_tokens');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Make authenticated API request to Spotify
   * @param endpoint Spotify API endpoint
   * @param options Fetch options
   */
  async spotifyApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const tokens = this.getStoredTokens();
    if (!tokens?.access_token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      await this.refreshToken();
      // Retry request with new token
      return this.spotifyApiRequest<T>(endpoint, options);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API request failed: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;