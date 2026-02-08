'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp } from 'lucide-react'
import { ClipCard } from './clip-card'
import { SkeletonCard } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useHomepageTrending } from '@/lib/hooks/use-trending'
import { cn } from '@/lib/utils/cn'

interface TrendingSectionProps {
  className?: string
  limit?: number
}

export function TrendingSection({ className, limit = 6 }: TrendingSectionProps) {
  const { data: clips, isLoading, error } = useHomepageTrending(limit)

  return (
    <section className={cn('py-12 md:py-16', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-heading-md text-foreground">
                Trending Now
              </h2>
              <p className="text-sm text-foreground-muted">
                Popular clips from the past 2 weeks
              </p>
            </div>
          </div>
          <Link href="/trending">
            <Button variant="ghost" className="hidden sm:flex">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Content */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-foreground-muted">
              Failed to load trending clips. Please try again later.
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: limit }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : clips && clips.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {clips.map((clip) => (
                <ClipCard
                  key={clip.id}
                  slug={clip.slug}
                  title={clip.title}
                  thumbnailUrl={clip.thumbnailUrl}
                  duration={clip.duration}
                  animeTitle={clip.anime?.title ?? 'Unknown Anime'}
                  animatorName={clip.primaryAnimator?.name}
                  verificationStatus={clip.verificationStatus}
                />
              ))}
            </div>

            {/* Mobile view all button */}
            <div className="mt-6 text-center sm:hidden">
              <Link href="/trending">
                <Button variant="secondary">
                  View all trending
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-foreground-muted">
              No trending clips at the moment. Check back soon!
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * Server component wrapper that can be used for SSR
 * Falls back to client-side fetching
 */
export function TrendingSectionServer({ className, limit }: TrendingSectionProps) {
  return <TrendingSection className={className} limit={limit} />
}
