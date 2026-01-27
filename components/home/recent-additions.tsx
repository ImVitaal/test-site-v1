'use client'

import Link from 'next/link'
import { ArrowRight, Clock, Plus } from 'lucide-react'
import { ClipCard } from '@/components/clips/clip-card'
import { Button } from '@/components/ui/button'
import { SkeletonCard } from '@/components/ui/skeleton'
import { useRecentClips } from '@/lib/hooks/use-homepage'
import { cn } from '@/lib/utils/cn'
import { formatRelativeTime } from '@/lib/utils/format'

interface RecentAdditionsProps {
  className?: string
}

export function RecentAdditions({ className }: RecentAdditionsProps) {
  const { data: clips, isLoading, error } = useRecentClips(6)

  return (
    <section className={cn('py-12 md:py-16', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-info/20 flex items-center justify-center">
              <Plus className="h-5 w-5 text-info" />
            </div>
            <div>
              <h2 className="font-display text-heading-md text-foreground">
                Recent Additions
              </h2>
              <p className="text-sm text-foreground-muted">
                Freshly added to the archive
              </p>
            </div>
          </div>
          <Link href="/clips?sort=newest">
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
              Failed to load recent clips. Please try again later.
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : clips && clips.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {clips.map((clip) => (
                <div key={clip.id} className="relative">
                  <ClipCard
                    slug={clip.slug}
                    title={clip.title}
                    thumbnailUrl={clip.thumbnailUrl}
                    duration={clip.duration}
                    animeTitle={clip.anime?.title ?? 'Unknown Anime'}
                    animatorName={clip.primaryAnimator?.name}
                    verificationStatus={clip.verificationStatus}
                  />
                  {/* Time badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-info/90 rounded text-xs text-white font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(new Date(clip.createdAt))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile view all button */}
            <div className="mt-6 text-center sm:hidden">
              <Link href="/clips?sort=newest">
                <Button variant="secondary">
                  View all recent clips
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-foreground-muted">
              No recent clips at the moment. Check back soon!
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
