import type { 
  AuthTokens, 
  SpotifyUser, 
  LoginResponse, 
  CallbackRequest,
  TokenRefreshRequest
} from '@/types/auth';

import { SPOTIFY_SCOPES } from '@/types/auth';

// StoredAuthTokens extends AuthTokens with an absolute expiry timestamp
export type StoredAuthTokens = AuthTokens & { expires_at?: number };

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
  // Promise used to dedupe concurrent refresh requests
  private refreshInFlight: Promise<AuthTokens> | null = null;

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

      // Ask backend to initiate login. Backend will generate PKCE params and return authorization URL
      const response = await fetch(`${this.baseURL}/auth/spotify/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redirectUri: this.redirectUri }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to initiate login: ${response.status}`);
      }

      // Backend returns { authorizationUrl, codeVerifier, state } (see API-Reference)
      const data = await response.json();

      // Persist PKCE verifier and state locally for callback validation
      if (data.codeVerifier) storePKCEVerifier(data.codeVerifier);
      if (data.state) storeOAuthState(data.state);

      return {
        authorization_url: data.authorizationUrl || data.authorization_url,
        state: data.state,
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
      // Validate state parameter locally (optional; backend should also validate)
      const storedState = retrieveOAuthState();
      if (!storedState || !validateState(state, storedState)) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      // Retrieve PKCE verifier stored earlier (if backend didn't persist it)
      const codeVerifier = retrievePKCEVerifier();

      // Send code + verifier to backend for token exchange
      const response = await fetch(`${this.baseURL}/auth/spotify/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          codeVerifier: codeVerifier || undefined,
          redirectUri: this.redirectUri,
          state,
        }),
      });

      console.log('Callback response : ', response);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Token exchange failed: ${response.status}`);
      }

      // Backend returns { accessToken, refreshToken, expiresIn, tokenType, user }
      const data = await response.json();

      console.log('Callback data : ', data);

      const tokens: AuthTokens = {
        access_token: data.accessToken || data.access_token,
        refresh_token: data.refreshToken || data.refresh_token,
        expires_in: data.expiresIn || data.expires_in || 3600,
        token_type: (data.tokenType || data.token_type || 'Bearer') as 'Bearer',
        scope: data.scope || SPOTIFY_SCOPES.join(' '),
      };

      console.log('Exchanged tokens : ', tokens);

      // Persist tokens
      this.storeTokens(tokens);

      // Optionally persist user in localStorage for quick access
      if (data.user){
          localStorage.setItem('auth_user', JSON.stringify(data.user));
          console.log('Stored user : ', data.user);
      }

      // Attempt to fetch current user from backend to validate tokens. If this fails,
      // clear tokens and surface an error so the caller can redirect to login.
      try {
        await this.getCurrentUser();
      } catch (meErr) {
        console.warn('getCurrentUser failed after callback exchange:', meErr);
        this.clearTokens();
        throw new Error('Failed to validate user after token exchange');
      }

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
      // If a refresh is already in-flight, reuse it
      if (this.refreshInFlight) {
        return this.refreshInFlight;
      }

      this.refreshInFlight = (async () => {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: currentTokens.refresh_token }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || `Token refresh failed: ${response.status}`);
        }

        const data = await response.json();

        const newTokens: AuthTokens = {
          access_token: data.accessToken || data.access_token,
          refresh_token: data.refreshToken || data.refresh_token || currentTokens.refresh_token,
          expires_in: data.expiresIn || data.expires_in || 3600,
          token_type: (data.tokenType || data.token_type || 'Bearer') as 'Bearer',
          scope: data.scope || currentTokens.scope || SPOTIFY_SCOPES.join(' '),
        };

        // Store new tokens
        this.storeTokens(newTokens);

        // clear in-flight ref
        this.refreshInFlight = null;
        return newTokens;
      })();

      return this.refreshInFlight;
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
  /**
   * Get current user profile from backend. Will attempt a single refresh on 401 and will not loop.
   * @param attemptRefresh whether to attempt a refresh when receiving 401 (default true)
   */
  async getCurrentUser(attemptRefresh = true): Promise<SpotifyUser> {
    try {
        const tokens = this.getStoredTokens();
        console.log('Getting current user with tokens: ', tokens);
      if (!tokens?.access_token) {
        throw new Error('No access token available');
      }

      const response = await fetch(`${this.baseURL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      if (response.status === 401) {
        if (attemptRefresh) {
          try {
            await this.refreshToken();
            // Retry once but do not attempt further refreshes to avoid loops
            return this.getCurrentUser(false);
          } catch (refreshErr) {
            // Refresh failed - propagate original 401
            throw new Error('Unauthorized and refresh failed');
          }
        }

        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || `Failed to get user profile: ${response.status}`);
      }

      const result = await response.json();
      const user: SpotifyUser = result.user || result;
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
      const parsed = JSON.parse(tokensStr) as StoredAuthTokens;
      return parsed;
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
      // compute absolute expiry time (expires_at) in ms since epoch
      const now = Date.now();
      const expiresIn = tokens.expires_in || 3600;
      const expires_at = now + expiresIn * 1000;

      const stored: StoredAuthTokens = {
        ...tokens,
        expires_in: expiresIn,
        expires_at,
      };

      // In production, consider encrypting tokens before storage
      localStorage.setItem('auth_tokens', JSON.stringify(stored));
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