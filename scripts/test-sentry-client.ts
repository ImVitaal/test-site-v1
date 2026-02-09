/**
 * Sentry Client-Side Error Testing Script
 *
 * This script simulates various client-side errors to verify Sentry integration.
 * It demonstrates different error types and Sentry features like custom context,
 * tags, and breadcrumbs.
 *
 * Usage:
 *   pnpm tsx scripts/test-sentry-client.ts
 *
 * Prerequisites:
 *   - NEXT_PUBLIC_SENTRY_DSN must be set in .env
 *   - Run this script after starting the dev server with `pnpm dev`
 *   - Check Sentry dashboard at https://sentry.io to see captured errors
 *
 * Note: This script simulates client-side errors in a Node environment.
 * For true client-side testing, trigger errors through the browser UI.
 */

import * as Sentry from '@sentry/nextjs'

// Initialize Sentry with client configuration
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
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
 * Test 1: Simple Error Capture
 * Demonstrates basic error capture with Sentry.captureException()
 */
function testSimpleError() {
  section('Test 1: Simple Error Capture')

  try {
    throw new Error('Test error from client-side script')
  } catch (error) {
    log('✓ Capturing simple error...', 'blue')
    Sentry.captureException(error)
    log('✓ Error captured! Check Sentry dashboard.', 'green')
  }
}

/**
 * Test 2: Error with Custom Context
 * Demonstrates adding custom context (user, tags, extra data) to errors
 */
function testErrorWithContext() {
  section('Test 2: Error with Custom Context')

  // Set user context
  Sentry.setUser({
    id: 'test-user-123',
    email: 'test@sakugalegends.com',
    username: 'test_animator',
  })
  log('✓ User context set', 'blue')

  // Set custom tags
  Sentry.setTag('test.type', 'client-error')
  Sentry.setTag('test.category', 'integration-test')
  log('✓ Custom tags set', 'blue')

  // Set extra context
  Sentry.setContext('test_data', {
    timestamp: new Date().toISOString(),
    script: 'test-sentry-client.ts',
    purpose: 'Verify Sentry integration',
  })
  log('✓ Extra context set', 'blue')

  try {
    throw new Error('Test error with rich context')
  } catch (error) {
    log('✓ Capturing error with context...', 'blue')
    Sentry.captureException(error)
    log('✓ Error with context captured! Check Sentry dashboard.', 'green')
  }

  // Clean up
  Sentry.setUser(null)
}

/**
 * Test 3: Error with Breadcrumbs
 * Demonstrates adding breadcrumbs to track events leading up to an error
 */
function testErrorWithBreadcrumbs() {
  section('Test 3: Error with Breadcrumbs')

  log('✓ Adding breadcrumbs...', 'blue')

  // Simulate user actions
  Sentry.addBreadcrumb({
    category: 'user.action',
    message: 'User clicked on animator profile',
    level: 'info',
    data: {
      animator: 'Yutaka Nakamura',
      page: '/animators/yutaka-nakamura',
    },
  })

  Sentry.addBreadcrumb({
    category: 'navigation',
    message: 'Navigated to clip detail page',
    level: 'info',
    data: {
      from: '/animators/yutaka-nakamura',
      to: '/clips/space-dandy-fight',
    },
  })

  Sentry.addBreadcrumb({
    category: 'api',
    message: 'Failed to load clip data',
    level: 'error',
    data: {
      endpoint: '/api/clips/space-dandy-fight',
      status: 500,
    },
  })

  log('✓ Breadcrumbs added', 'blue')

  try {
    throw new Error('Test error with breadcrumb trail')
  } catch (error) {
    log('✓ Capturing error with breadcrumbs...', 'blue')
    Sentry.captureException(error)
    log('✓ Error with breadcrumbs captured! Check Sentry dashboard.', 'green')
  }
}

/**
 * Test 4: Different Error Types
 * Demonstrates capturing various error types (TypeError, ReferenceError, etc.)
 */
function testDifferentErrorTypes() {
  section('Test 4: Different Error Types')

  // TypeError
  try {
    const obj: any = null
    obj.nonExistentMethod()
  } catch (error) {
    log('✓ Capturing TypeError...', 'blue')
    Sentry.captureException(error, {
      tags: { error_type: 'TypeError' },
    })
  }

  // Custom error with metadata
  class AnimationLoadError extends Error {
    constructor(
      message: string,
      public clipId: string,
      public animator: string
    ) {
      super(message)
      this.name = 'AnimationLoadError'
    }
  }

  try {
    throw new AnimationLoadError(
      'Failed to load animation clip',
      'clip-123',
      'Yutaka Nakamura'
    )
  } catch (error) {
    log('✓ Capturing custom error...', 'blue')
    Sentry.captureException(error, {
      tags: { error_type: 'AnimationLoadError' },
      extra: {
        clipId: (error as AnimationLoadError).clipId,
        animator: (error as AnimationLoadError).animator,
      },
    })
  }

  log('✓ Multiple error types captured! Check Sentry dashboard.', 'green')
}

/**
 * Test 5: Manual Message Capture
 * Demonstrates capturing custom messages (not exceptions)
 */
function testMessageCapture() {
  section('Test 5: Manual Message Capture')

  log('✓ Capturing custom messages...', 'blue')

  Sentry.captureMessage('Test info message from client', 'info')
  Sentry.captureMessage('Test warning message from client', 'warning')
  Sentry.captureMessage('Test error message from client', 'error')

  log('✓ Messages captured! Check Sentry dashboard.', 'green')
}

/**
 * Test 6: Performance Transaction
 * Demonstrates performance monitoring with transactions
 */
async function testPerformanceTracking() {
  section('Test 6: Performance Transaction')

  log('✓ Starting performance transaction...', 'blue')

  // Use Sentry.startSpan instead of startTransaction
  await Sentry.startSpan(
    {
      name: 'test-client-transaction',
      op: 'test',
    },
    async () => {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100))

      // Create child spans inside
      await Sentry.startSpan({ name: 'child-operation', op: 'child' }, async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })
    }
  )

  log('✓ Performance transaction tracked', 'green')
}

/**
 * Main execution
 */
async function main() {
  log('\nSentry Client-Side Error Testing Script', 'bright')
  log('========================================\n', 'bright')

  // Check if DSN is configured
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    log('⚠ WARNING: NEXT_PUBLIC_SENTRY_DSN is not set!', 'yellow')
    log('Errors will be logged but not sent to Sentry.', 'yellow')
    log('Set NEXT_PUBLIC_SENTRY_DSN in .env to test actual capture.\n', 'yellow')
  } else {
    log('✓ Sentry DSN configured', 'green')
    log(`  DSN: ${process.env.NEXT_PUBLIC_SENTRY_DSN.substring(0, 50)}...\n`, 'blue')
  }

  // Run all tests
  testSimpleError()
  testErrorWithContext()
  testErrorWithBreadcrumbs()
  testDifferentErrorTypes()
  testMessageCapture()
  await testPerformanceTracking()

  // Wait for Sentry to flush events
  section('Finalizing')
  log('✓ Flushing events to Sentry...', 'blue')
  await Sentry.flush(2000)

  log('\n✓ All tests completed!', 'green')
  log('\nNext steps:', 'bright')
  log('1. Open Sentry dashboard: https://sentry.io', 'blue')
  log('2. Navigate to your project', 'blue')
  log('3. Check the "Issues" tab for captured errors', 'blue')
  log('4. Verify stack traces are readable (source maps working)', 'blue')
  log('5. Check "Performance" tab for transaction data\n', 'blue')

  // Exit cleanly
  process.exit(0)
}

// Run the tests
main().catch((error) => {
  log('\n✗ Test script failed:', 'red')
  console.error(error)
  process.exit(1)
})
