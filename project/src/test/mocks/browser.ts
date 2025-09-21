import { setupWorker } from 'msw/browser';
import { authHandlers } from './auth.handlers';

/**
 * Setup MSW (Mock Service Worker) for browser environment
 * This allows us to intercept and mock API requests during development
 */

// Create MSW worker with auth handlers
export const worker = setupWorker(...authHandlers);

/**
 * Start MSW in development mode
 */
export async function startMSW() {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true') {
    try {
      await worker.start({
        onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
      });
      
      console.log('🔧 MSW: Mock Service Worker started');
      console.log('🔧 MSW: OAuth endpoints are now mocked');
    } catch (error) {
      console.error('Failed to start MSW:', error);
    }
  }
}

/**
 * Stop MSW
 */
export function stopMSW() {
  worker.stop();
  console.log('🔧 MSW: Mock Service Worker stopped');
}

/**
 * Update MSW handlers (useful for testing different scenarios)
 */
export function updateHandlers(handlers: any[]) {
  worker.use(...handlers);
}