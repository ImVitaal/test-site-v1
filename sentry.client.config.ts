import * as Sentry from '@sentry/nextjs'

/**
 * Sentry Client-Side Configuration
 *
 * This file configures Sentry for the browser (client-side) environment.
 * It captures errors, performance data, and user interactions in the user's browser.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */

Sentry.init({
  // DSN (Data Source Name) - the URL that tells Sentry where to send events
  // This must be a NEXT_PUBLIC_ variable to be accessible in the browser
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment - helps distinguish between dev, staging, and production errors
  environment: process.env.NODE_ENV || 'development',

  // Tracing - Performance monitoring
  // Adjust this value in production based on your performance monitoring needs
  // 1.0 = 100% of transactions are sent to Sentry (use lower values in production)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay - Records user sessions to help debug issues
  // Adjust this value based on privacy requirements and volume
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask all text content to protect user privacy
      maskAllText: true,
      // Block all media (images, videos) to reduce bandwidth and protect privacy
      blockAllMedia: true,
    }),
  ],

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Ignore common errors that don't require action
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'Can\'t find variable: ZiteReader',
    'jigsaw is not defined',
    'ComboSearch is not defined',
    // Network errors (user's connection issues)
    'NetworkError',
    'Network request failed',
    'Failed to fetch',
    // Cancelled requests (user navigated away)
    'AbortError',
    'The operation was aborted',
  ],

  // Filter out breadcrumbs from third-party scripts
  beforeBreadcrumb(breadcrumb) {
    // Ignore console logs in production to reduce noise
    if (breadcrumb.category === 'console' && process.env.NODE_ENV === 'production') {
      return null
    }
    return breadcrumb
  },

  // Scrub sensitive data before sending to Sentry
  beforeSend(event, hint) {
    // Don't send events if DSN is not configured (development without Sentry)
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null
    }

    // Filter out errors from browser extensions
    if (event.exception?.values?.[0]?.stacktrace?.frames) {
      const frames = event.exception.values[0].stacktrace.frames
      // Check if error originated from a browser extension
      if (frames.some(frame => frame.filename?.includes('chrome-extension://') || frame.filename?.includes('moz-extension://'))) {
        return null
      }
    }

    return event
  },
})
