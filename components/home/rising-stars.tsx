'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, TrendingUp, User, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useRisingAnimators } from '@/lib/hooks/use-homepage'
import { cn } from '@/lib/utils/cn'

interface RisingStarsProps {
  className?: string
}

export function RisingStars({ className }: RisingStarsProps) {
  const { data: animators, isLoading, error } = useRisingAnimators(4)

  return (
    <section className={cn('py-12 md:py-16', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <h2 className="font-display text-heading-md text-foreground">
                Rising Stars
              </h2>
              <p className="text-sm text-foreground-muted">
                Animators gaining traction this month
              </p>
            </div>
          </div>
          <Link href="/animators?sort=trending">
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
              Failed to load rising stars. Please try again later.
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <RisingStarSkeleton key={i} />
            ))}
          </div>
        ) : animators && animators.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {animators.map((animator) => (
                <RisingStarCard key={animator.id} animator={animator} />
              ))}
            </div>

            {/* Mobile view all button */}
            <div className="mt-6 text-center sm:hidden">
              <Link href="/animators?sort=trending">
                <Button variant="secondary">
                  View all rising stars
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-foreground-muted">
              No rising stars at the moment. Check back soon!
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

interface RisingStarCardProps {
  animator: {
    id: string
    slug: string
    name: string
    nativeName: string | null
    photoUrl: string | null
    recentClipCount: number
    latestClip: {
      id: string
      slug: string
      title: string
      thumbnailUrl: string | null
      anime: {
        title: string
      }
    } | null
  }
}

function RisingStarCard({ animator }: RisingStarCardProps) {
  return (
    <Link
      href={`/animators/${animator.slug}`}
      className="group card card-hover block overflow-hidden"
    >
      {/* Photo */}
      <div className="aspect-square relative bg-surface-hover">
        {animator.photoUrl ? (
          <Image
            src={animator.photoUrl}
            alt={animator.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="h-16 w-16 text-foreground-muted" />
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-success/90 rounded text-xs text-white font-medium flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          +{animator.recentClipCount} clips
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
          {animator.name}
        </h3>
        {animator.nativeName && (
          <p className="text-sm text-foreground-muted truncate">
            {animator.nativeName}
          </p>
        )}
        {animator.latestClip && (
          <div className="mt-2 flex items-center gap-1 text-xs text-foreground-muted">
            <Film className="h-3 w-3" />
            <span className="truncate">Latest: {animator.latestClip.anime.title}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

function RisingStarSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-square" />
      <div className="p-4">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  )
}
