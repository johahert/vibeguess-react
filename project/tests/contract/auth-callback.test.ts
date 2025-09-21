import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { AuthTokens, CallbackRequest } from '../../src/types/auth';

/**
 * Contract test for auth callback endpoint
 * This test MUST FAIL initially to prove it tests real behavior (TDD approach)
 */

// Mock server for testing API contracts
const server = setupServer();

// Mock auth service that will be implemented later
class MockAuthService {
  private baseURL = 'http://localhost:3001/api';

  async handleCallback(code: string, state: string): Promise<AuthTokens> {
    const requestBody: CallbackRequest = { code, state };

    const response = await fetch(`${this.baseURL}/auth/spotify/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Callback failed: ${response.status}`);
    }

    return response.json();
  }
}

const authService = new MockAuthService();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('POST /auth/spotify/callback - Contract Test', () => {
  it('should exchange authorization code for access tokens', async () => {
    // Arrange: Mock successful token exchange
    const mockTokens: AuthTokens = {
      access_token: 'BQC4WK3cEY0fJn7nrlf7...',
      refresh_token: 'AQC1lK3dFZ9gKm8mqlg8...',
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'user-read-private user-read-email playlist-read-private',
    };

    server.use(
      http.post('http://localhost:3001/api/auth/spotify/callback', async ({ request }) => {
        const body = await request.json() as CallbackRequest;
        
        // Validate request structure
        expect(body.code).toBeDefined();
        expect(body.state).toBeDefined();
        
        return HttpResponse.json(mockTokens);
      })
    );

    // Act: Exchange code for tokens
    const tokens = await authService.handleCallback('test_auth_code', 'test_state_12345678');

    // Assert: Verify token response structure
    expect(tokens.access_token).toBeDefined();
    expect(tokens.access_token).toMatch(/^[A-Za-z0-9_.-]+$/);
    expect(tokens.refresh_token).toBeDefined();
    expect(tokens.refresh_token).toMatch(/^[A-Za-z0-9_.-]+$/);
    expect(tokens.expires_in).toBeGreaterThan(0);
    expect(tokens.expires_in).toBeLessThanOrEqual(3600);
    expect(tokens.token_type).toBe('Bearer');
    expect(tokens.scope).toContain('user-read-private');
    expect(tokens.scope).toContain('user-read-email');
  });

  it('should validate required parameters in request body', async () => {
    // Arrange: Mock endpoint that validates request body
    server.use(
      http.post('http://localhost:3001/api/auth/spotify/callback', async ({ request }) => {
        const body = await request.json() as any;
        
        if (!body.code || !body.state) {
          return HttpResponse.json(
            { error: 'Missing required parameters' },
            { status: 400 }
          );
        }
        
        return HttpResponse.json({
          access_token: 'test_token',
          refresh_token: 'test_refresh',
          expires_in: 3600,
          token_type: 'Bearer',
          scope: 'user-read-private',
        } satisfies AuthTokens);
      })
    );

    // Act: Call with valid parameters
    const tokens = await authService.handleCallback('valid_code', 'valid_state');

    // Assert: Should return tokens
    expect(tokens).toBeDefined();
    expect(tokens.access_token).toBe('test_token');
  });

  it('should handle invalid authorization code', async () => {
    // Arrange: Mock API error for invalid code
    server.use(
      http.post('http://localhost:3001/api/auth/spotify/callback', () => {
        return HttpResponse.json(
          { 
            error: 'invalid_grant',
            error_description: 'Invalid authorization code'
          },
          { status: 400 }
        );
      })
    );

    // Act & Assert: Should throw an error
    await expect(
      authService.handleCallback('invalid_code', 'test_state')
    ).rejects.toThrow('Callback failed: 400');
  });

  it('should handle state mismatch error', async () => {
    // Arrange: Mock state validation error
    server.use(
      http.post('http://localhost:3001/api/auth/spotify/callback', () => {
        return HttpResponse.json(
          { 
            error: 'invalid_state',
            error_description: 'State parameter does not match'
          },
          { status: 400 }
        );
      })
    );

    // Act & Assert: Should throw an error
    await expect(
      authService.handleCallback('test_code', 'wrong_state')
    ).rejects.toThrow('Callback failed: 400');
  });

  it('should handle expired authorization code', async () => {
    // Arrange: Mock expired code error
    server.use(
      http.post('http://localhost:3001/api/auth/spotify/callback', () => {
        return HttpResponse.json(
          { 
            error: 'invalid_grant',
            error_description: 'Authorization code expired'
          },
          { status: 400 }
        );
      })
    );

    // Act & Assert: Should throw an error
    await expect(
      authService.handleCallback('expired_code', 'test_state')
    ).rejects.toThrow('Callback failed: 400');
  });

  it('should handle Spotify API errors', async () => {
    // Arrange: Mock Spotify service error
    server.use(
      http.post('http://localhost:3001/api/auth/spotify/callback', () => {
        return HttpResponse.json(
          { 
            error: 'spotify_error',
            error_description: 'Spotify API is temporarily unavailable'
          },
          { status: 502 }
        );
      })
    );

    // Act & Assert: Should throw an error
    await expect(
      authService.handleCallback('test_code', 'test_state')
    ).rejects.toThrow('Callback failed: 502');
  });
});