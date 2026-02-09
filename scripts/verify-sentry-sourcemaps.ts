#!/usr/bin/env tsx
/**
 * Sentry Source Map Verification Script
 *
 * This script helps verify that source maps are properly configured and uploaded to Sentry.
 * It checks configuration, provides build instructions, and guides manual verification.
 *
 * Usage:
 *   pnpm tsx scripts/verify-sentry-sourcemaps.ts
 *
 * Requirements:
 *   - SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN in .env.local
 *   - NEXT_PUBLIC_SENTRY_DSN configured
 *   - Production build completed (pnpm build)
 *
 * What this script does:
 *   1. Checks Sentry configuration
 *   2. Verifies environment variables
 *   3. Checks next.config.js for Sentry webpack plugin
 *   4. Provides instructions for manual verification
 *   5. Lists steps to verify source maps in Sentry dashboard
 */

import * as fs from 'fs'
import * as path from 'path'

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function header(message: string) {
  log('\n' + '='.repeat(80), colors.cyan)
  log(message, colors.cyan + colors.bold)
  log('='.repeat(80), colors.cyan)
}

function success(message: string) {
  log(`✅ ${message}`, colors.green)
}

function error(message: string) {
  log(`❌ ${message}`, colors.red)
}

function warning(message: string) {
  log(`⚠️  ${message}`, colors.yellow)
}

function info(message: string) {
  log(`ℹ️  ${message}`, colors.blue)
}

interface CheckResult {
  passed: boolean
  message: string
}

/**
 * Check if required environment variables are set
 */
function checkEnvironmentVariables(): CheckResult[] {
  const results: CheckResult[] = []

  // Required for source map upload
  const requiredVars = [
    'SENTRY_ORG',
    'SENTRY_PROJECT',
    'SENTRY_AUTH_TOKEN',
  ]

  // Required for runtime error reporting
  const runtimeVars = [
    'NEXT_PUBLIC_SENTRY_DSN', // Client-side
    'SENTRY_DSN', // Server-side
  ]

  log('\n📋 Checking environment variables...', colors.cyan)

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      results.push({ passed: true, message: `${varName} is set` })
      success(`${varName} is configured`)
    } else {
      results.push({ passed: false, message: `${varName} is missing` })
      error(`${varName} is not set`)
    }
  }

  for (const varName of runtimeVars) {
    if (process.env[varName]) {
      results.push({ passed: true, message: `${varName} is set` })
      success(`${varName} is configured`)
    } else {
      results.push({ passed: false, message: `${varName} is missing` })
      warning(`${varName} is not set (optional for build, required for runtime)`)
    }
  }

  return results
}

/**
 * Check if Sentry configuration files exist
 */
function checkConfigurationFiles(): CheckResult[] {
  const results: CheckResult[] = []

  log('\n📁 Checking Sentry configuration files...', colors.cyan)

  const configFiles = [
    'sentry.client.config.ts',
    'sentry.server.config.ts',
    'sentry.edge.config.ts',
    'instrumentation.ts',
  ]

  for (const file of configFiles) {
    const filePath = path.join(process.cwd(), file)
    if (fs.existsSync(filePath)) {
      results.push({ passed: true, message: `${file} exists` })
      success(`${file} exists`)
    } else {
      results.push({ passed: false, message: `${file} not found` })
      error(`${file} not found`)
    }
  }

  return results
}

/**
 * Check next.config.js for Sentry webpack plugin
 */
function checkNextConfig(): CheckResult[] {
  const results: CheckResult[] = []

  log('\n⚙️  Checking Next.js configuration...', colors.cyan)

  const nextConfigPath = path.join(process.cwd(), 'next.config.js')

  if (!fs.existsSync(nextConfigPath)) {
    results.push({ passed: false, message: 'next.config.js not found' })
    error('next.config.js not found')
    return results
  }

  const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf-8')

  // Check for withSentryConfig
  if (nextConfigContent.includes('withSentryConfig')) {
    results.push({ passed: true, message: 'withSentryConfig is configured' })
    success('next.config.js is wrapped with withSentryConfig')
  } else {
    results.push({ passed: false, message: 'withSentryConfig not found' })
    error('next.config.js is not wrapped with withSentryConfig')
  }

  // Check for Sentry webpack plugin options
  if (nextConfigContent.includes('sentryWebpackPluginOptions')) {
    results.push({ passed: true, message: 'sentryWebpackPluginOptions is configured' })
    success('Sentry webpack plugin options are configured')
  } else {
    results.push({ passed: false, message: 'sentryWebpackPluginOptions not found' })
    error('Sentry webpack plugin options not found')
  }

  // Check for org, project, authToken
  const requiredOptions = ['org:', 'project:', 'authToken:']
  for (const option of requiredOptions) {
    if (nextConfigContent.includes(option)) {
      results.push({ passed: true, message: `${option} is configured` })
      success(`${option} is configured in webpack plugin options`)
    } else {
      results.push({ passed: false, message: `${option} not found` })
      error(`${option} not found in webpack plugin options`)
    }
  }

  return results
}

/**
 * Check if .next build directory exists
 */
function checkBuildDirectory(): CheckResult {
  log('\n🏗️  Checking production build...', colors.cyan)

  const buildPath = path.join(process.cwd(), '.next')

  if (fs.existsSync(buildPath)) {
    success('Production build directory (.next) exists')
    info('Note: To ensure source maps are uploaded, run: pnpm build')
    return { passed: true, message: 'Build directory exists' }
  } else {
    warning('Production build directory (.next) not found')
    info('Run: pnpm build')
    return { passed: false, message: 'Build directory not found' }
  }
}

/**
 * Provide manual verification instructions
 */
function printVerificationInstructions() {
  header('📖 MANUAL VERIFICATION STEPS')

  log('\n🚀 Step 1: Build the application', colors.bold)
  info('Run the following command to create a production build:')
  log('  pnpm build\n', colors.cyan)
  info('During the build, the Sentry webpack plugin will:')
  log('  • Generate source maps for client and server bundles')
  log('  • Upload source maps to Sentry')
  log('  • Associate source maps with the release\n')

  log('\n🧪 Step 2: Trigger a test error', colors.bold)
  info('Option A: Use the test scripts')
  log('  pnpm test:sentry-client   # Test client-side errors', colors.cyan)
  log('  pnpm test:sentry-server   # Test server-side errors\n', colors.cyan)

  info('Option B: Create a test page with an error')
  log('  1. Start the production server: pnpm start')
  log('  2. Navigate to any page')
  log('  3. Open browser console and run:')
  log('     throw new Error("Test source map error from browser")\n', colors.cyan)

  info('Option C: Trigger an error in a component')
  log('  1. Add this code to any client component:')
  log('     useEffect(() => {', colors.cyan)
  log('       throw new Error("Test error for source map verification")', colors.cyan)
  log('     }, [])\n', colors.cyan)
  log('  2. Build and start: pnpm build && pnpm start')
  log('  3. Navigate to the page with the error\n')

  log('\n🔍 Step 3: Verify in Sentry Dashboard', colors.bold)
  info('Go to your Sentry dashboard:')
  log('  https://sentry.io/organizations/{your-org}/issues/\n', colors.cyan)

  info('Check the following:')
  log('  ✓ Error appears in the issues list')
  log('  ✓ Stack trace shows TypeScript file names (e.g., app/page.tsx)')
  log('  ✓ Stack trace shows original line numbers from source code')
  log('  ✓ Stack trace shows actual code snippets (not minified JS)')
  log('  ✓ Click on a stack frame to see the original source code')
  log('  ✓ Source code is properly syntax-highlighted\n')

  log('\n❌ Signs that source maps are NOT working:', colors.bold)
  error('  • Stack trace shows webpack:/// paths')
  error('  • Stack trace shows minified code (e.g., function a() { ... })')
  error('  • Line numbers don\'t match your source code')
  error('  • Clicking on a stack frame shows "Source code not available"')
  error('  • File names show as _app.js or main.js instead of original names\n')

  log('\n✅ Signs that source maps ARE working:', colors.bold)
  success('  • Stack trace shows original file paths (e.g., app/error.tsx)')
  success('  • Stack trace shows original function names')
  success('  • Line numbers match your TypeScript source code')
  success('  • Clicking on a stack frame shows your actual code')
  success('  • Code snippets show TypeScript with proper formatting\n')

  log('\n🐛 Step 4: Troubleshooting', colors.bold)
  info('If source maps are not working:')
  log('  1. Check build output for "Sentry: Uploading source maps"')
  log('  2. Verify SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN are set')
  log('  3. Check Sentry dashboard → Settings → Source Maps')
  log('  4. Ensure the release version matches between build and runtime')
  log('  5. Check network tab for source map upload requests during build')
  log('  6. Verify auth token has "project:write" and "project:releases" permissions\n')
}

/**
 * Print example error code
 */
function printExampleErrorCode() {
  header('💡 EXAMPLE: Test Error Component')

  log('\nCreate a test page to verify source maps:', colors.cyan)
  log(`
// app/test-sentry/page.tsx
'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function TestSentryPage() {
  useEffect(() => {
    // This error will be captured by Sentry
    // Check if the stack trace shows THIS file and line number
    throw new Error('Test error for source map verification')
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sentry Source Map Test</h1>
      <button
        onClick={() => {
          // Manual error trigger
          Sentry.captureException(new Error('Manual test error'))
        }}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Trigger Test Error
      </button>
    </div>
  )
}
`, colors.cyan)
}

/**
 * Print summary
 */
function printSummary(allResults: CheckResult[]) {
  header('📊 VERIFICATION SUMMARY')

  const passed = allResults.filter(r => r.passed).length
  const failed = allResults.filter(r => !r.passed).length
  const total = allResults.length

  log(`\nTotal checks: ${total}`, colors.bold)
  success(`Passed: ${passed}`)

  if (failed > 0) {
    error(`Failed: ${failed}`)
    log('\n❌ Some configuration issues detected. Please fix them before proceeding.', colors.red)
  } else {
    log('\n✅ All configuration checks passed!', colors.green + colors.bold)
    log('You can now run a production build and verify source maps in Sentry.', colors.green)
  }
}

/**
 * Main function
 */
async function main() {
  header('🔍 SENTRY SOURCE MAP VERIFICATION')

  log('\nThis script verifies that Sentry is properly configured for source map uploads.')
  log('Source maps allow you to see readable stack traces in Sentry instead of minified code.\n')

  const allResults: CheckResult[] = []

  // Run all checks
  allResults.push(...checkConfigurationFiles())
  allResults.push(...checkEnvironmentVariables())
  allResults.push(...checkNextConfig())
  allResults.push(checkBuildDirectory())

  // Print instructions
  printVerificationInstructions()
  printExampleErrorCode()

  // Print summary
  printSummary(allResults)

  // Exit with appropriate code
  const failed = allResults.filter(r => !r.passed).length
  if (failed > 0) {
    log('\n⚠️  Fix the configuration issues above and run this script again.', colors.yellow)
    process.exit(1)
  } else {
    log('\n🎉 Configuration is ready! Follow the manual verification steps above.', colors.green)
    process.exit(0)
  }
}

// Run the script
main().catch((error) => {
  error(`Script failed: ${error.message}`)
  process.exit(1)
})
