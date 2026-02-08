'use client'

import { useEffect, useRef, useCallback } from 'react'
import { TrendingUp, Loader2 } from 'lucide-react'
import { ClipCard } from '@/components/clips/clip-card'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useTrendingInfinite } from '@/lib/hooks/use-trending'

export default function TrendingPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useTrendingInfinite({ limit: 12, windowDays: 30 })

  // Infinite scroll intersection observer
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px',
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [handleObserver])

  // Flatten pages into single array
  const clips = data?.pages.flatMap((page) => page.data) ?? []
  const total = data?.pages[0]?.pagination.total ?? 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-accent" />
          </div>
          <h1 className="font-display text-display-sm text-foreground">
            Trending Clips
          </h1>
        </div>
        <p className="text-foreground-muted">
          The hottest animation clips from the past 30 days, ranked by engagement
          and recency.
        </p>
        {total > 0 && (
          <p className="mt-2 text-sm text-foreground-muted">
            {total} trending clip{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Error state */}
      {error ? (
        <div className="text-center py-16">
          <p className="text-foreground-muted">
            Failed to load trending clips. Please try again later.
          </p>
        </div>
      ) : isLoading ? (
        /* Loading state */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : clips.length > 0 ? (
        <>
          {/* Clips grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {clips.map((clip, index) => (
              <div key={clip.id} className="relative">
                {/* Rank badge for top 10 */}
                {index < 10 && (
                  <div className="absolute -top-2 -left-2 z-10 h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {index + 1}
                  </div>
                )}
                <ClipCard
                  slug={clip.slug}
                  title={clip.title}
                  thumbnailUrl={clip.thumbnailUrl}
                  duration={clip.duration}
                  animeTitle={clip.anime?.title ?? 'Unknown Anime'}
                  animatorName={clip.primaryAnimator?.name}
                  verificationStatus={clip.verificationStatus}
                />
              </div>
            ))}
          </div>

          {/* Load more trigger */}
          <div ref={loadMoreRef} className="py-8 flex justify-center">
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2 text-foreground-muted">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading more...</span>
              </div>
            ) : hasNextPage ? (
              <span className="text-foreground-muted text-sm">
                Scroll for more
              </span>
            ) : clips.length > 12 ? (
              <span className="text-foreground-muted text-sm">
                You&apos;ve reached the end
              </span>
            ) : null}
          </div>
        </>
      ) : (
        /* Empty state */
        <div className="text-center py-16">
          <TrendingUp className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
          <p className="text-foreground-muted">
            No trending clips at the moment. Check back soon!
          </p>
        </div>
      )}
    </div>
  )
}
