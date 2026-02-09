/**
 * Sentry Server-Side Error Testing Script
 *
 * This script simulates various server-side errors to verify Sentry integration.
 * It demonstrates error capture in Node.js/Next.js server context with request
 * context, user data, and different error scenarios.
 *
 * Usage:
 *   pnpm tsx scripts/test-sentry-server.ts
 *
 * Prerequisites:
 *   - SENTRY_DSN (or NEXT_PUBLIC_SENTRY_DSN) must be set in .env
 *   - Check Sentry dashboard at https://sentry.io to see captured errors
 *
 * Note: This script simulates server-side errors in a Node environment.
 * For real API error testing, trigger actual API endpoints with invalid data.
 */

import * as Sentry from '@sentry/nextjs'

// Initialize Sentry with server configuration
Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0, // Capture all transactions for testing
  debug: true, // Enable debug output
})

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function section(title: string) {
  console.log('\n' + '='.repeat(60))
  log(title, 'bright')
  console.log('='.repeat(60))
}

/**
 * Test 1: Simple Server Error
 * Demonstrates basic server-side error capture
 */
function testSimpleServerError() {
  section('Test 1: Simple Server Error')

  try {
    throw new Error('Test error from server-side script')
  } catch (error) {
    log('✓ Capturing simple server error...', 'blue')
    Sentry.captureException(error)
    log('✓ Error captured! Check Sentry dashboard.', 'green')
  }
}

/**
 * Test 2: API Route Error with Request Context
 * Simulates an error in an API route with HTTP context
 */
function testAPIRouteError() {
  section('Test 2: API Route Error with Request Context')

  // Simulate API request context
  const mockRequest = {
    method: 'POST',
    url: '/api/clips',
    headers: {
      'user-agent': 'Mozilla/5.0 (Test Script)',
      'content-type': 'application/json',
      // Note: Sensitive headers like 'authorization' are scrubbed by beforeSend
    },
    body: {
      title: 'Test Clip',
      animatorId: 'test-123',
    },
  }

  log('✓ Setting request context...', 'blue')
  Sentry.setContext('request', mockRequest)

  // Set user context
  Sentry.setUser({
    id: 'server-user-456',
    email: 'server@sakugalegends.com',
    ip_address: '192.168.1.100',
  })
  log('✓ User context set', 'blue')

  // Set custom tags for API errors
  Sentry.setTag('api.route', '/api/clips')
  Sentry.setTag('api.method', 'POST')
  Sentry.setTag('test.type', 'server-error')
  log('✓ Custom tags set', 'blue')

  try {
    // Simulate an API error
    throw new Error('Database connection failed in API route')
  } catch (error) {
    log('✓ Capturing API route error with context...', 'blue')
    Sentry.captureException(error, {
      level: 'error',
      tags: {
        error_category: 'database',
      },
    })
    log('✓ API error with request context captured! Check Sentry dashboard.', 'green')
  }

  // Clean up
  Sentry.setUser(null)
}

/**
 * Test 3: Database Query Error
 * Simulates a database error with query context
 */
function testDatabaseError() {
  section('Test 3: Database Query Error')

  // Add breadcrumbs showing the query flow
  log('✓ Adding database operation breadcrumbs...', 'blue')

  Sentry.addBreadcrumb({
    category: 'db.query',
    message: 'SELECT * FROM animators WHERE slug = ?',
    level: 'info',
    data: {
      query: 'SELECT',
      table: 'animators',
      params: ['yutaka-nakamura'],
    },
  })

  Sentry.addBreadcrumb({
    category: 'db.connection',
    message: 'Connection pool exhausted',
    level: 'warning',
    data: {
      pool_size: 10,
      active_connections: 10,
      waiting_queries: 5,
    },
  })

  log('✓ Breadcrumbs added', 'blue')

  // Simulate database error
  class DatabaseError extends Error {
    constructor(
      message: string,
      public code: string,
      public query: string
    ) {
      super(message)
      this.name = 'DatabaseError'
    }
  }

  try {
    throw new DatabaseError(
      'Connection timeout after 30s',
      'ETIMEDOUT',
      'SELECT * FROM animators WHERE slug = $1'
    )
  } catch (error) {
    log('✓ Capturing database error...', 'blue')
    const dbError = error as DatabaseError
    Sentry.captureException(error, {
      tags: {
        error_type: 'DatabaseError',
        error_code: dbError.code,
      },
      extra: {
        query: dbError.query,
        timeout: '30s',
      },
    })
    log('✓ Database error captured with context! Check Sentry dashboard.', 'green')
  }
}

/**
 * Test 4: Validation Error
 * Simulates input validation failure
 */
function testValidationError() {
  section('Test 4: Validation Error')

  log('✓ Simulating validation error...', 'blue')

  // Simulate Zod-like validation error
  class ValidationError extends Error {
    constructor(
      message: string,
      public field: string,
      public value: any,
      public expected: string
    ) {
      super(message)
      this.name = 'ValidationError'
    }
  }

  try {
    throw new ValidationError(
      'Invalid clip duration',
      'duration',
      100, // 100 seconds
      'Maximum 45 seconds (fair use limit)'
    )
  } catch (error) {
    log('✓ Capturing validation error...', 'blue')
    const valError = error as ValidationError
    Sentry.captureException(error, {
      level: 'warning', // Validation errors are less severe
      tags: {
        error_type: 'ValidationError',
        validation_field: valError.field,
      },
      extra: {
        field: valError.field,
        provided_value: valError.value,
        expected: valError.expected,
      },
    })
    log('✓ Validation error captured! Check Sentry dashboard.', 'green')
  }
}

/**
 * Test 5: Authentication/Authorization Error
 * Simulates auth-related errors
 */
function testAuthError() {
  section('Test 5: Authentication/Authorization Error')

  log('✓ Simulating auth error...', 'blue')

  // Set auth context (sensitive data will be scrubbed)
  Sentry.setContext('auth', {
    attempted_action: 'clip.delete',
    user_role: 'contributor',
    required_role: 'moderator',
    trust_score: 45,
    required_trust_score: 200,
  })

  try {
    throw new Error('Insufficient permissions: Trusted Contributor status required')
  } catch (error) {
    log('✓ Capturing authorization error...', 'blue')
    Sentry.captureException(error, {
      level: 'warning',
      tags: {
        error_type: 'AuthorizationError',
        action: 'clip.delete',
      },
    })
    log('✓ Auth error captured! Check Sentry dashboard.', 'green')
  }
}

/**
 * Test 6: Third-Party API Error
 * Simulates external service failure
 */
async function testExternalAPIError() {
  section('Test 6: Third-Party API Error')

  log('✓ Simulating external API call...', 'blue')

  // Add breadcrumbs for API call
  Sentry.addBreadcrumb({
    category: 'http',
    message: 'Calling Cloudflare Stream API',
    level: 'info',
    data: {
      url: 'https://api.cloudflare.com/client/v4/accounts/.../stream',
      method: 'POST',
    },
  })

  Sentry.addBreadcrumb({
    category: 'http',
    message: 'API request failed',
    level: 'error',
    data: {
      status_code: 503,
      response: 'Service Unavailable',
    },
  })

  log('✓ Breadcrumbs added', 'blue')

  class APIError extends Error {
    constructor(
      message: string,
      public service: string,
      public statusCode: number,
      public response: string
    ) {
      super(message)
      this.name = 'APIError'
    }
  }

  try {
    throw new APIError(
      'Cloudflare Stream API unavailable',
      'cloudflare-stream',
      503,
      'Service Unavailable'
    )
  } catch (error) {
    log('✓ Capturing external API error...', 'blue')
    const apiError = error as APIError
    Sentry.captureException(error, {
      tags: {
        error_type: 'APIError',
        external_service: apiError.service,
        status_code: apiError.statusCode.toString(),
      },
      extra: {
        service: apiError.service,
        status_code: apiError.statusCode,
        response: apiError.response,
      },
    })
    log('✓ External API error captured! Check Sentry dashboard.', 'green')
  }
}

/**
 * Test 7: Performance Transaction (Server-Side)
 * Demonstrates server-side performance monitoring
 */
async function testServerPerformance() {
  section('Test 7: Server Performance Transaction')

  log('✓ Starting server performance transaction...', 'blue')

  const transaction = Sentry.startTransaction({
    name: 'test-api-request',
    op: 'http.server',
    tags: {
      'http.method': 'GET',
      'http.route': '/api/animators/:slug',
    },
  })

  // Simulate database query
  const dbSpan = transaction.startChild({
    op: 'db.query',
    description: 'SELECT animator FROM animators WHERE slug = $1',
  })
  await new Promise((resolve) => setTimeout(resolve, 150))
  dbSpan.finish()

  // Simulate cache check
  const cacheSpan = transaction.startChild({
    op: 'cache.get',
    description: 'Get animator clips from Redis',
  })
  await new Promise((resolve) => setTimeout(resolve, 50))
  cacheSpan.finish()

  // Simulate external API call
  const apiSpan = transaction.startChild({
    op: 'http.client',
    description: 'Fetch clip thumbnails from Cloudflare',
  })
  await new Promise((resolve) => setTimeout(resolve, 200))
  apiSpan.finish()

  transaction.finish()

  log('✓ Server performance transaction captured! Check Sentry dashboard.', 'green')
}

/**
 * Test 8: Message Capture (Server Logs)
 * Demonstrates capturing server-side log messages
 */
function testServerMessages() {
  section('Test 8: Server Message Capture')

  log('✓ Capturing server messages...', 'blue')

  Sentry.captureMessage('Server started successfully', 'info')
  Sentry.captureMessage('Low memory warning: 80% used', 'warning')
  Sentry.captureMessage('Critical: Redis connection lost', 'error')
  Sentry.captureMessage('Fatal: Database migration failed', 'fatal')

  log('✓ Server messages captured! Check Sentry dashboard.', 'green')
}

/**
 * Main execution
 */
async function main() {
  log('\nSentry Server-Side Error Testing Script', 'bright')
  log('=========================================\n', 'bright')

  // Check if DSN is configured
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) {
    log('⚠ WARNING: SENTRY_DSN is not set!', 'yellow')
    log('Errors will be logged but not sent to Sentry.', 'yellow')
    log('Set SENTRY_DSN (or NEXT_PUBLIC_SENTRY_DSN) in .env to test actual capture.\n', 'yellow')
  } else {
    log('✓ Sentry DSN configured', 'green')
    log(`  DSN: ${dsn.substring(0, 50)}...\n`, 'blue')
  }

  log('Environment: ' + (process.env.NODE_ENV || 'development'), 'magenta')
  log('Runtime: Node.js (Server-side)\n', 'magenta')

  // Run all tests
  testSimpleServerError()
  testAPIRouteError()
  testDatabaseError()
  testValidationError()
  testAuthError()
  await testExternalAPIError()
  await testServerPerformance()
  testServerMessages()

  // Wait for Sentry to flush events
  section('Finalizing')
  log('✓ Flushing events to Sentry...', 'blue')
  await Sentry.flush(2000)

  log('\n✓ All server-side tests completed!', 'green')
  log('\nNext steps:', 'bright')
  log('1. Open Sentry dashboard: https://sentry.io', 'blue')
  log('2. Navigate to your project', 'blue')
  log('3. Check the "Issues" tab for captured errors', 'blue')
  log('4. Verify request context is captured (method, URL, user)', 'blue')
  log('5. Check stack traces are readable (source maps working)', 'blue')
  log('6. Review "Performance" tab for transaction data', 'blue')
  log('7. Filter by environment to see test vs production errors\n', 'blue')

  log('💡 Tip: For real API testing, trigger errors via HTTP:', 'yellow')
  log('   curl http://localhost:3000/api/test-error', 'yellow')
  log('   (Create this endpoint to test real request context)\n', 'yellow')

  // Exit cleanly
  process.exit(0)
}

// Run the tests
main().catch((error) => {
  log('\n✗ Test script failed:', 'red')
  console.error(error)
  process.exit(1)
})
