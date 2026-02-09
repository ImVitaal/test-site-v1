/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded by Next.js during initialization.
 * It's used to set up monitoring, tracing, and error tracking before the app starts.
 *
 * The register() function is called once when the server starts, making it the
 * perfect place to initialize Sentry for error tracking and performance monitoring.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
 */

export async function register() {
  // Only run Sentry initialization on the server side
  // Client-side initialization happens automatically via sentry.client.config.ts
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server runtime (API routes, SSR, Server Components)
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime (middleware, edge functions)
    await import('./sentry.edge.config')
  }

  // Client-side Sentry is initialized via Next.js automatic instrumentation
  // The sentry.client.config.ts file is loaded automatically by the Sentry webpack plugin
}
