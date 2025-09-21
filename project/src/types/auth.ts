/**
 * Authentication types for Spotify OAuth integration
 * Following OAuth 2.0 PKCE flow for secure authentication
 */

export interface AuthTokens {
  /** Spotify access token for API requests */
  access_token: string;
  /** Refresh token for getting new access tokens */
  refresh_token: string;
  /** Token expiry time in seconds */
  expires_in: number;
  /** Always 'Bearer' for Spotify tokens */
  token_type: 'Bearer';
  /** Granted permissions scope */
  scope: string;
}

export interface SpotifyUser {
  /** Spotify user ID */
  id: string;
  /** Display name (can be null) */
  display_name: string | null;
  /** User email */
  email: string;
  /** Profile images array */
  images: Array<{
    url: string;
    height: number | null;
    width: number | null;
  }>;
  /** Subscription type */
  product: 'free' | 'premium';
  /** User's country code */
  country: string;
  /** Total followers */
  followers: {
    total: number;
  };
}

export interface AuthState {
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Current user data */
  user: SpotifyUser | null;
  /** Authentication tokens */
  tokens: AuthTokens | null;
  /** Loading state for auth operations */
  isLoading: boolean;
  /** Error message if auth fails */
  error: string | null;
}

export interface AuthURLParams {
  /** OAuth client ID */
  client_id: string;
  /** Redirect URI after auth */
  redirect_uri: string;
  /** Requested permissions */
  scope: string;
  /** PKCE code challenge */
  code_challenge: string;
  /** PKCE challenge method */
  code_challenge_method: 'S256';
  /** CSRF protection state */
  state: string;
  /** OAuth response type */
  response_type: 'code';
}

export interface LoginResponse {
  /** Spotify authorization URL */
  authorization_url: string;
  /** CSRF state parameter */
  state: string;
}

export interface CallbackRequest {
  /** Authorization code from Spotify */
  code: string;
  /** State parameter for CSRF protection */
  state: string;
}

export interface TokenRefreshRequest {
  /** Refresh token */
  refresh_token: string;
}

export interface PKCEParams {
  /** Code verifier for PKCE */
  codeVerifier: string;
  /** Code challenge for PKCE */
  codeChallenge: string;
}

export interface AuthError {
  /** Error code */
  error: string;
  /** Human-readable error description */
  error_description?: string;
  /** Error state parameter */
  state?: string;
}

// Spotify API scopes needed for the application
export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email', 
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-top-read',
  'user-read-recently-played',
] as const;

export type SpotifyScope = typeof SPOTIFY_SCOPES[number];