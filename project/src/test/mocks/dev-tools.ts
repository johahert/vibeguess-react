/**
 * Development utilities for testing OAuth flow
 * This module provides helper functions for testing authentication in development
 */

import { authHandlers, authErrorHandlers } from './auth.handlers';
import { updateHandlers } from './browser';

/**
 * Mock successful OAuth login without redirect
 * Useful for testing the callback flow
 */
export function mockOAuthCallback() {
  // Simulate OAuth callback by navigating to callback URL with mock parameters
  const callbackUrl = new URL('/callback', window.location.origin);
  callbackUrl.searchParams.set('code', 'mock_auth_code_dev');
  callbackUrl.searchParams.set('state', 'mock_state_12345678901234567890');
  
  window.location.href = callbackUrl.toString();
}

/**
 * Test error scenarios in OAuth flow
 */
export function testOAuthError(errorType: 'network' | 'invalid_client' | 'expired_token' = 'network') {
  updateHandlers(authErrorHandlers);
  console.log(`🧪 Testing OAuth error scenario: ${errorType}`);
}

/**
 * Reset to normal OAuth handlers
 */
export function resetOAuthHandlers() {
  updateHandlers(authHandlers);
  console.log('🔄 OAuth handlers reset to normal');
}

/**
 * Add development tools to window for easy testing
 */
if (import.meta.env.DEV) {
  (window as any).vibeguessDebug = {
    mockOAuthCallback,
    testOAuthError,
    resetOAuthHandlers,
    
    // Quick login for testing
    quickLogin: () => {
      console.log('🚀 Quick login: Redirecting to mock callback...');
      setTimeout(mockOAuthCallback, 500);
    },
    
    // Clear auth data
    clearAuth: () => {
      localStorage.removeItem('auth_tokens');
      localStorage.removeItem('auth_user');
      sessionStorage.clear();
      console.log('🧹 Auth data cleared');
      window.location.reload();
    }
  };
  
  console.log('🛠️  VibeGuess Debug Tools Available:');
  console.log('   vibeguessDebug.quickLogin() - Skip OAuth and login instantly');
  console.log('   vibeguessDebug.mockOAuthCallback() - Simulate OAuth callback');
  console.log('   vibeguessDebug.testOAuthError() - Test error scenarios');
  console.log('   vibeguessDebug.resetOAuthHandlers() - Reset to normal flow');
  console.log('   vibeguessDebug.clearAuth() - Clear all auth data');
}