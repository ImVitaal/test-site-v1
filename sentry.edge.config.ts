import * as Sentry from '@sentry/nextjs'

/**
 * Sentry Edge Runtime Configuration
 *
 * This file configures Sentry for Edge Runtime environments (middleware, edge functions).
 * Edge runtime has constraints: no Node.js APIs, smaller bundle size, runs on CDN edges.
 * It captures errors and performance data from middleware and edge API routes.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */

Sentry.init({
  // DSN (Data Source Name) - the URL that tells Sentry where to send events
  // Edge runtime can access both SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment - helps distinguish between dev, staging, and production errors
  environment: process.env.NODE_ENV || 'development',

  // Tracing - Performance monitoring
  // Lower sample rate for edge to reduce overhead on CDN edges
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Ignore common errors that don't require action
  ignoreErrors: [
    // Network errors (CDN/edge connection issues)
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    // Aborted requests (client disconnected)
    'AbortError',
    'The user aborted a request',
    // Edge-specific errors to ignore
    'NetworkError',
    'Failed to fetch',
  ],

  // Filter out breadcrumbs to reduce noise and bundle size
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
    if (!process.env.SENTRY_DSN && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null
    }

    // Scrub sensitive data from request context (middleware typically processes requests)
    if (event.request) {
      // Remove authentication headers
      if (event.request.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
        delete event.request.headers['x-api-key']
        delete event.request.headers['set-cookie']
      }

      // Remove sensitive query parameters
      if (event.request.query_string && typeof event.request.query_string === 'string') {
        const sensitiveParams = ['token', 'api_key', 'password', 'secret', 'auth']
        sensitiveParams.forEach(param => {
          const queryString = event.request?.query_string
          if (typeof queryString === 'string' && queryString.includes(param)) {
            event.request!.query_string = queryString.replace(
              new RegExp(`${param}=[^&]*`, 'gi'),
              `${param}=[REDACTED]`
            )
          }
        })
      }
    }

    // Scrub sensitive data from extra context
    if (event.extra) {
      const scrubExtra = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj

        const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization', 'cookie', 'dsn']
        const scrubbed = Array.isArray(obj) ? [...obj] : { ...obj }

        for (const key in scrubbed) {
          if (sensitiveKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
            scrubbed[key] = '[REDACTED]'
          } else if (typeof scrubbed[key] === 'object' && scrubbed[key] !== null) {
            scrubbed[key] = scrubExtra(scrubbed[key])
          }
        }

        return scrubbed
      }

      event.extra = scrubExtra(event.extra)
    }

    return event
  },
})
