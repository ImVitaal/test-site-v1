'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Play, Star, Film, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useFeaturedAnimator } from '@/lib/hooks/use-homepage'
import { cn } from '@/lib/utils/cn'

interface FeaturedAnimatorProps {
  className?: string
}

export function FeaturedAnimator({ className }: FeaturedAnimatorProps) {
  const { data: animator, isLoading, error } = useFeaturedAnimator()

  if (error) {
    return null // Fallback to simple hero on error
  }

  if (isLoading) {
    return <FeaturedAnimatorSkeleton className={className} />
  }

  if (!animator) {
    return null
  }

  return (
    <section className={cn('relative overflow-hidden', className)}>
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        {animator.signatureClip?.thumbnailUrl ? (
          <Image
            src={animator.signatureClip.thumbnailUrl}
            alt=""
            fill
            className="object-cover opacity-30 blur-sm scale-105"
            priority
          />
        ) : animator.photoUrl ? (
          <Image
            src={animator.photoUrl}
            alt=""
            fill
            className="object-cover opacity-20 blur-md scale-105"
            priority
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/60" />
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Animator Info */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium mb-4">
              <Star className="h-4 w-4" />
              Featured Animator
            </div>

            <h1 className="font-display text-display-md md:text-display-lg text-foreground mb-2">
              {animator.name}
            </h1>

            {animator.nativeName && (
              <p className="text-xl text-foreground-muted mb-4">
                {animator.nativeName}
              </p>
            )}

            {animator.bio && (
              <p className="text-body-lg text-foreground-muted max-w-xl mb-6 line-clamp-3">
                {animator.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-start gap-6 mb-8">
              <div className="flex items-center gap-2 text-foreground-muted">
                <Film className="h-5 w-5" />
                <span className="font-semibold text-foreground">{animator.clipCount}</span>
                <span>clips</span>
              </div>
              <div className="flex items-center gap-2 text-foreground-muted">
                <Star className="h-5 w-5" />
                <span className="font-semibold text-foreground">{animator.favoriteCount}</span>
                <span>favorites</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href={`/animators/${animator.slug}`}>
                <Button size="lg" className="w-full sm:w-auto">
                  View Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/animators">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Explore All Animators
                </Button>
              </Link>
            </div>
          </div>

          {/* Signature Clip Preview */}
          {animator.signatureClip && (
            <div className="w-full lg:w-auto lg:flex-shrink-0">
              <Link
                href={`/clips/${animator.signatureClip.slug}`}
                className="block group"
              >
                <div className="relative aspect-video w-full lg:w-[480px] xl:w-[560px] rounded-card overflow-hidden card card-hover">
                  {animator.signatureClip.thumbnailUrl ? (
                    <Image
                      src={animator.signatureClip.thumbnailUrl}
                      alt={animator.signatureClip.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 560px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-surface-hover flex items-center justify-center">
                      <Play className="h-16 w-16 text-foreground-muted" />
                    </div>
                  )}

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>

                  {/* Clip info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-medium line-clamp-1">
                      {animator.signatureClip.title}
                    </p>
                    <p className="text-white/70 text-sm">
                      {animator.signatureClip.anime.title}
                    </p>
                  </div>
                </div>
              </Link>
              <p className="text-center text-sm text-foreground-muted mt-2">
                Signature work
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function FeaturedAnimatorSkeleton({ className }: { className?: string }) {
  return (
    <section className={cn('relative overflow-hidden bg-surface', className)}>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
            <Skeleton className="h-6 w-40 mx-auto lg:mx-0 mb-4" />
            <Skeleton className="h-12 w-64 mx-auto lg:mx-0 mb-2" />
            <Skeleton className="h-6 w-48 mx-auto lg:mx-0 mb-4" />
            <Skeleton className="h-20 w-full max-w-xl mx-auto lg:mx-0 mb-6" />
            <div className="flex gap-4 justify-center lg:justify-start mb-8">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex gap-4 justify-center lg:justify-start">
              <Skeleton className="h-12 w-36" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
          <div className="w-full lg:w-[480px]">
            <Skeleton className="aspect-video w-full rounded-card" />
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Fallback hero for when featured animator is not available
 */
export function FallbackHero({ className }: { className?: string }) {
  return (
    <section className={cn('relative overflow-hidden py-20 md:py-32', className)}>
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
