'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Play, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { useFeaturedAnimator } from '@/lib/hooks/use-featured-animator'
import { usePrefersReducedMotion } from '@/lib/hooks/use-media-query'
import { cn } from '@/lib/utils/cn'

interface FeaturedAnimatorHeroProps {
  className?: string
}

export function FeaturedAnimatorHero({ className }: FeaturedAnimatorHeroProps) {
  const { data: featured, isLoading, error } = useFeaturedAnimator()
  const prefersReducedMotion = usePrefersReducedMotion()
  const videoRef = useRef<HTMLVideoElement>(null)

  // Pause video when prefers-reduced-motion is enabled
  useEffect(() => {
    if (videoRef.current && prefersReducedMotion) {
      videoRef.current.pause()
    }
  }, [prefersReducedMotion])

  if (isLoading) {
    return <FeaturedAnimatorHeroSkeleton className={className} />
  }

  if (error || !featured) {
    return <FallbackHero className={className} />
  }

  return (
    <section
      className={cn(
        'relative h-[50vh] sm:h-[60vh] md:h-[70vh] overflow-hidden',
        className
      )}
    >
      {/* Video/Image Background */}
      <div className="absolute inset-0">
        {featured.signatureClip && !prefersReducedMotion ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            poster={featured.signatureClip.thumbnailUrl ?? undefined}
            className="w-full h-full object-cover"
          >
            <source src={featured.signatureClip.videoUrl} type="video/mp4" />
          </video>
        ) : featured.signatureClip?.thumbnailUrl ? (
          <Image
            src={featured.signatureClip.thumbnailUrl}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : featured.photoUrl ? (
          <Image
            src={featured.photoUrl}
            alt=""
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/20 to-surface" />
        )}

        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative h-full flex items-center">
        <div className="max-w-xl">
          {/* Label */}
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-accent" />
            <span className="text-accent text-sm font-medium uppercase tracking-wider">
              Featured Animator of the Week
            </span>
          </div>

          {/* Name */}
          <h2 className="font-display text-display-sm sm:text-display-md md:text-display-lg text-foreground">
            {featured.name}
          </h2>
          {featured.nativeName && (
            <p className="text-lg text-foreground-muted mt-1">
              {featured.nativeName}
            </p>
          )}

          {/* Bio snippet */}
          {featured.bio && (
            <p className="mt-4 text-foreground-muted line-clamp-3 max-w-md">
              {featured.bio}
            </p>
          )}

          {/* Stats */}
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-accent" />
              <span className="text-foreground">
                {featured.clipCount} clips
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href={`/animators/${featured.slug}`}>
              <Button size="lg" className="w-full sm:w-auto">
                View Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {featured.signatureClip && (
              <Link href={`/clips/${featured.signatureClip.slug}`}>
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Signature Clip
                </Button>
              </Link>
            )}
          </div>

          {/* Signature clip info */}
          {featured.signatureClip && (
            <p className="mt-4 text-sm text-foreground-muted">
              From {featured.signatureClip.anime.title}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

function FeaturedAnimatorHeroSkeleton({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        'relative h-[50vh] sm:h-[60vh] md:h-[70vh] bg-surface',
        className
      )}
    >
      <div className="container mx-auto px-4 h-full flex items-center">
        <div className="max-w-xl space-y-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-12 sm:h-16 w-72 sm:w-96" />
          <Skeleton className="h-5 w-36" />
          <SkeletonText lines={3} />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-44" />
          </div>
        </div>
      </div>
    </section>
  )
}

function FallbackHero({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        'relative overflow-hidden py-20 md:py-32',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent" />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-display-md md:text-display-lg text-foreground">
            Celebrate the Art of{' '}
            <span className="text-gradient">Animation</span>
          </h1>
          <p className="mt-6 text-body-lg text-foreground-muted max-w-2xl mx-auto">
            The definitive platform for discovering and cataloging the most talented
            key animators in the anime industry. Explore their craft, trace their lineage,
            and appreciate the artistry frame by frame.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/animators">
              <Button size="lg" className="w-full sm:w-auto">
                Explore Animators
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/clips">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                <Play className="mr-2 h-4 w-4" />
                Browse Clips
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
