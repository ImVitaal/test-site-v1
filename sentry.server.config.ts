import * as Sentry from '@sentry/nextjs'

/**
 * Sentry Server-Side Configuration
 *
 * This file configures Sentry for the Node.js server environment (API routes, SSR, etc.).
 * It captures server-side errors, performance data, and request context.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */

Sentry.init({
  // DSN (Data Source Name) - the URL that tells Sentry where to send events
  // Server-side uses SENTRY_DSN (not NEXT_PUBLIC_) since it's not exposed to the browser
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment - helps distinguish between dev, staging, and production errors
  environment: process.env.NODE_ENV || 'development',

  // Tracing - Performance monitoring
  // Lower sample rate in production to reduce overhead and costs
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Ignore common errors that don't require action
  ignoreErrors: [
    // Database connection errors (handled separately)
    'ECONNREFUSED',
    'ENOTFOUND',
    // Timeout errors (expected in some cases)
    'ETIMEDOUT',
    // Aborted requests (client disconnected)
    'AbortError',
    'The user aborted a request',
  ],

  // Filter out breadcrumbs to reduce noise
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

    // Scrub sensitive data from request context
    if (event.request) {
      // Remove authentication headers
      if (event.request.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
        delete event.request.headers['x-api-key']
      }

      // Remove sensitive query parameters
      if (event.request.query_string) {
        const sensitiveParams = ['token', 'api_key', 'password', 'secret']
        sensitiveParams.forEach(param => {
          if (event.request?.query_string?.includes(param)) {
            event.request.query_string = event.request.query_string.replace(
              new RegExp(`${param}=[^&]*`, 'gi'),
              `${param}=[REDACTED]`
            )
          }
        })
      }

      // Scrub sensitive data from request body
      if (event.request.data) {
        const scrubData = (obj: any): any => {
          if (typeof obj !== 'object' || obj === null) return obj

          const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization']
          const scrubbed = Array.isArray(obj) ? [...obj] : { ...obj }

          for (const key in scrubbed) {
            if (sensitiveKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
              scrubbed[key] = '[REDACTED]'
            } else if (typeof scrubbed[key] === 'object' && scrubbed[key] !== null) {
              scrubbed[key] = scrubData(scrubbed[key])
            }
          }

          return scrubbed
        }

        event.request.data = scrubData(event.request.data)
      }
    }

    // Scrub sensitive data from extra context
    if (event.extra) {
      const scrubExtra = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj

        const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization', 'dsn']
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
