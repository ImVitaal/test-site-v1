import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    include: ['__tests__/**/*.{test,spec}.{ts,tsx}', 'e2e/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.next',
      'e2e/**/*', // Exclude E2E tests from unit test runs
    ],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      include: ['lib/**/*.{ts,tsx}'],
      exclude: [
        'node_modules',
        'dist',
        '.next',
        '__tests__',
        'e2e',
        '**/*.config.{ts,js}',
        '**/*.d.ts',
        '**/types/**',
        '**/index.ts', // Barrel exports don't need coverage
      ],
      all: true,
      clean: true,
      // Report files with low coverage for visibility
      reportOnFailure: true,
      // Watermarks indicate when coverage is considered "low" (yellow) vs "high" (green)
      // Goal: 70% coverage on lib/ directory (current: ~8%)
      watermarks: {
        statements: [50, 70],
        functions: [50, 70],
        branches: [50, 70],
        lines: [50, 70],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
