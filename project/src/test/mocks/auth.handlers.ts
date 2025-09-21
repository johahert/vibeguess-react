import { http, HttpResponse } from 'msw';
import type { AuthTokens, LoginResponse, CallbackRequest, SpotifyUser } from '@/types/auth';

/**
 * MSW handlers for mocking OAuth API responses
 * This allows us to test the complete OAuth flow without a backend
 */

// Mock Spotify user data
const mockSpotifyUser: SpotifyUser = {
  id: 'test_user_123',
  display_name: 'Test User',
  email: 'test@example.com',
  images: [
    {
      url: 'https://via.placeholder.com/300x300?text=User',
      height: 300,
      width: 300,
    },
  ],
  product: 'premium',
  country: 'US',
  followers: {
    total: 42,
  },
};

// Mock tokens
const mockTokens: AuthTokens = {
  access_token: 'BQC4WK3cEY0fJnMockAccessToken123456789',
  refresh_token: 'AQC1lK3dFZ9gMockRefreshToken987654321',
  expires_in: 3600,
  token_type: 'Bearer',
  scope: 'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-library-read user-top-read user-read-recently-played',
};

export const authHandlers = [
  // Mock login initiation
  http.post('http://localhost:3001/api/auth/spotify/login', () => {
    const response: LoginResponse = {
      authorization_url: 'http://localhost:5173/callback?code=mock_auth_code&state=mock_state_12345678901234567890',
      state: 'mock_state_12345678901234567890',
    };
    
    return HttpResponse.json(response);
  }),

  // Mock OAuth callback
  http.post('http://localhost:3001/api/auth/spotify/callback', async ({ request }) => {
    const body = await request.json() as CallbackRequest & { 
      code_verifier: string; 
      client_id: string; 
      redirect_uri: string; 
    };
    
    // Validate required fields
    if (!body.code || !body.state) {
      return HttpResponse.json(
        { 
          error: 'invalid_request',
          error_description: 'Missing required parameters: code or state'
        },
        { status: 400 }
      );
    }

    // Simulate token exchange delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return HttpResponse.json(mockTokens);
  }),

  // Mock token refresh
  http.post('http://localhost:3001/api/auth/spotify/refresh', async ({ request }) => {
    const body = await request.json() as { refresh_token: string; client_id: string };
    
    if (!body.refresh_token) {
      return HttpResponse.json(
        { 
          error: 'invalid_grant',
          error_description: 'Refresh token is required'
        },
        { status: 400 }
      );
    }

    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return new tokens (with same refresh token for simplicity)
    const refreshedTokens: AuthTokens = {
      ...mockTokens,
      access_token: 'BQC4WK3cEY0fJnRefreshedToken123456789',
      expires_in: 3600,
    };
    
    return HttpResponse.json(refreshedTokens);
  }),

  // Mock Spotify API - Get current user
  http.get('https://api.spotify.com/v1/me', ({ request }) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { 
          error: {
            status: 401,
            message: 'Invalid access token'
          }
        },
        { status: 401 }
      );
    }

    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(HttpResponse.json(mockSpotifyUser));
      }, 300);
    });
  }),

  // Mock Spotify API - Get user playlists (for future use)
  http.get('https://api.spotify.com/v1/me/playlists', ({ request }) => {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { 
          error: {
            status: 401,
            message: 'Invalid access token'
          }
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      items: [
        {
          id: 'playlist_1',
          name: 'My Awesome Playlist',
          description: 'A great collection of songs',
          tracks: { total: 25 },
          images: [{ url: 'https://via.placeholder.com/300x300?text=Playlist', height: 300, width: 300 }],
        },
        {
          id: 'playlist_2',
          name: 'Chill Vibes',
          description: 'Relaxing tunes',
          tracks: { total: 18 },
          images: [{ url: 'https://via.placeholder.com/300x300?text=Chill', height: 300, width: 300 }],
        },
      ],
      total: 2,
      limit: 20,
      offset: 0,
    });
  }),
];

// Error handlers for testing error scenarios
export const authErrorHandlers = [
  // Simulate network error
  http.post('http://localhost:3001/api/auth/spotify/login', () => {
    return HttpResponse.error();
  }),

  // Simulate invalid client configuration
  http.post('http://localhost:3001/api/auth/spotify/callback', () => {
    return HttpResponse.json(
      { 
        error: 'invalid_client',
        error_description: 'Invalid client configuration'
      },
      { status: 400 }
    );
  }),

  // Simulate expired token
  http.get('https://api.spotify.com/v1/me', () => {
    return HttpResponse.json(
      { 
        error: {
          status: 401,
          message: 'The access token expired'
        }
      },
      { status: 401 }
    );
  }),
];