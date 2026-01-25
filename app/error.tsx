'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
      <h1 className="font-display text-4xl font-bold text-foreground mb-4">
        Something went wrong
      </h1>
      <p className="text-foreground-muted mb-8 max-w-md">
        We apologize for the inconvenience. Please try again or return to the
        homepage.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>Try again</Button>
        <Button
          variant="secondary"
          onClick={() => (window.location.href = '/')}
        >
          Return Home
        </Button>
      </div>
      {process.env.NODE_ENV === 'development' && error.message && (
        <pre className="mt-8 p-4 bg-surface rounded-lg text-left text-sm text-error max-w-2xl overflow-auto">
          {error.message}
          {error.stack && `\n\n${error.stack}`}
        </pre>
      )}
    </div>
  )
}
