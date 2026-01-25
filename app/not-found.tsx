import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-background">
      <h1 className="font-display text-8xl font-bold text-foreground mb-4">
        404
      </h1>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Page Not Found
      </h2>
      <p className="text-foreground-muted mb-8 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
        <Link href="/animators">
          <Button variant="secondary">Browse Animators</Button>
        </Link>
      </div>
    </div>
  )
}
