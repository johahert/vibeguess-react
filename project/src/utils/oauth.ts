import type { AuthURLParams, PKCEParams } from '@/types/auth';

/**
 * OAuth 2.0 PKCE utilities for secure Spotify authentication
 * Implements RFC 7636 - Proof Key for Code Exchange
 */

/**
 * Generate cryptographically secure random string
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto.getRandomValues for cryptographic security
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  
  return result;
}

/**
 * Generate base64url encoded string (no padding)
 */
function base64URLEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate SHA256 hash
 */
async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest('SHA-256', data);
}

/**
 * Generate PKCE code verifier and challenge
 * @returns Object with codeVerifier and codeChallenge
 */
export async function generateCodeChallenge(): Promise<PKCEParams> {
  // Generate code verifier (43-128 characters, unreserved chars only)
  const codeVerifier = generateRandomString(128);
  
  // Generate code challenge using SHA256
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64URLEncode(
    String.fromCharCode(...new Uint8Array(hashed))
  );
  
  return {
    codeVerifier,
    codeChallenge,
  };
}

/**
 * Generate cryptographically secure state parameter for CSRF protection
 * @returns 32-character random string
 */
export function generateState(): string {
  return generateRandomString(32);
}

/**
 * Build Spotify authorization URL with all required parameters
 * @param params OAuth parameters
 * @returns Complete authorization URL
 */
export function buildSpotifyAuthURL(params: AuthURLParams): string {
  const baseURL = 'https://accounts.spotify.com/authorize';
  const searchParams = new URLSearchParams({
    client_id: params.client_id,
    response_type: params.response_type,
    redirect_uri: params.redirect_uri,
    code_challenge_method: params.code_challenge_method,
    code_challenge: params.code_challenge,
    state: params.state,
    scope: params.scope,
  });

  return `${baseURL}?${searchParams.toString()}`;
}

/**
 * Validate OAuth state parameter to prevent CSRF attacks
 * @param receivedState State from callback URL
 * @param expectedState State stored in session/localStorage
 * @returns True if states match
 */
export function validateState(receivedState: string, expectedState: string): boolean {
  if (!receivedState || !expectedState) {
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  if (receivedState.length !== expectedState.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < receivedState.length; i++) {
    result |= receivedState.charCodeAt(i) ^ expectedState.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Parse error from OAuth callback URL
 * @param searchParams URL search parameters
 * @returns Error object or null if no error
 */
export function parseOAuthError(searchParams: URLSearchParams): {
  error: string;
  error_description?: string;
  state?: string;
} | null {
  const error = searchParams.get('error');
  
  if (!error) {
    return null;
  }
  
  return {
    error,
    error_description: searchParams.get('error_description') || undefined,
    state: searchParams.get('state') || undefined,
  };
}

/**
 * Store PKCE verifier securely in sessionStorage
 * @param verifier Code verifier to store
 */
export function storePKCEVerifier(verifier: string): void {
  sessionStorage.setItem('oauth_code_verifier', verifier);
}

/**
 * Retrieve and remove PKCE verifier from sessionStorage
 * @returns Code verifier or null if not found
 */
export function retrievePKCEVerifier(): string | null {
  const verifier = sessionStorage.getItem('oauth_code_verifier');
  if (verifier) {
    sessionStorage.removeItem('oauth_code_verifier');
  }
  return verifier;
}

/**
 * Store OAuth state securely in sessionStorage
 * @param state State parameter to store
 */
export function storeOAuthState(state: string): void {
  sessionStorage.setItem('oauth_state', state);
}

/**
 * Retrieve and remove OAuth state from sessionStorage
 * @returns State parameter or null if not found
 */
export function retrieveOAuthState(): string | null {
  const state = sessionStorage.getItem('oauth_state');
  if (state) {
    sessionStorage.removeItem('oauth_state');
  }
  return state;
}