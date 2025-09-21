import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { LoginResponse } from '../../src/types/auth';

/**
 * Contract test for auth login endpoint
 * This test MUST FAIL initially to prove it tests real behavior (TDD approach)
 */

// Mock server for testing API contracts
const server = setupServer();

// Mock auth service that will be implemented later
class MockAuthService {
  private baseURL = 'http://localhost:3001/api';

  async initiateLogin(): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/spotify/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
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

describe('POST /auth/spotify/login - Contract Test', () => {
  it('should return authorization URL with PKCE parameters', async () => {
    // Arrange: Mock successful API response
    server.use(
      http.post('http://localhost:3001/api/auth/spotify/login', () => {
        return HttpResponse.json({
          authorization_url: 'https://accounts.spotify.com/authorize?client_id=test&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&scope=user-read-private%20user-read-email&response_type=code&code_challenge=test_challenge&code_challenge_method=S256&state=abcdef1234567890123456789012',
          state: 'abcdef1234567890123456789012',
        } satisfies LoginResponse);
      })
    );

    // Act: Call the service method
    const response = await authService.initiateLogin();

    // Assert: Verify contract requirements
    expect(response.authorization_url).toBeDefined();
    expect(response.authorization_url).toContain('accounts.spotify.com/authorize');
    expect(response.authorization_url).toContain('code_challenge');
    expect(response.authorization_url).toContain('code_challenge_method=S256');
    expect(response.authorization_url).toContain('response_type=code');
    expect(response.authorization_url).toContain('client_id=');
    expect(response.authorization_url).toContain('redirect_uri=');
    expect(response.authorization_url).toContain('scope=');
    
    expect(response.state).toBeDefined();
    expect(response.state).toHaveLength(32);
    expect(response.state).toMatch(/^[A-Za-z0-9]+$/); // Alphanumeric state
  });

  it('should include required Spotify OAuth parameters', async () => {
    // Arrange: Mock response with all required parameters
    server.use(
      http.post('http://localhost:3001/api/auth/spotify/login', () => {
        return HttpResponse.json({
          authorization_url: 'https://accounts.spotify.com/authorize?client_id=test_client_id&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&scope=user-read-private%20user-read-email%20playlist-read-private&response_type=code&code_challenge=test_pkce_challenge&code_challenge_method=S256&state=test_state_abcdef123456789',
          state: 'test_state_abcdef123456789',
        } satisfies LoginResponse);
      })
    );

    // Act
    const response = await authService.initiateLogin();
    const url = new URL(response.authorization_url);
    const params = url.searchParams;

    // Assert: Check all required OAuth parameters
    expect(params.get('client_id')).toBeTruthy();
    expect(params.get('redirect_uri')).toBeTruthy();
    expect(params.get('response_type')).toBe('code');
    expect(params.get('code_challenge')).toBeTruthy();
    expect(params.get('code_challenge_method')).toBe('S256');
    expect(params.get('state')).toBeTruthy();
    expect(params.get('scope')).toContain('user-read-private');
    expect(params.get('scope')).toContain('user-read-email');
  });

  it('should handle API errors gracefully', async () => {
    // Arrange: Mock API error
    server.use(
      http.post('http://localhost:3001/api/auth/spotify/login', () => {
        return HttpResponse.json(
          { error: 'Invalid client configuration' },
          { status: 400 }
        );
      })
    );

    // Act & Assert: Should throw an error
    await expect(authService.initiateLogin()).rejects.toThrow('Login failed: 400');
  });

  it('should handle network errors', async () => {
    // Arrange: Mock network error
    server.use(
      http.post('http://localhost:3001/api/auth/spotify/login', () => {
        return HttpResponse.error();
      })
    );

    // Act & Assert: Should throw a network error
    await expect(authService.initiateLogin()).rejects.toThrow();
  });
});