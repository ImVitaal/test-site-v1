'use client'

import * as React from 'react'
import { Heart } from 'lucide-react'
import { FavoritesTabs } from '@/components/favorites'
import { ClipGrid } from '@/components/clips/clip-grid'
import { AnimatorGrid } from '@/components/animators/animator-grid'
import { useFavoriteClips, useFavoriteAnimators } from '@/lib/hooks/use-favorites'
import type { ClipCard } from '@/types/clip'
import type { AnimatorCard } from '@/types/animator'

interface FavoriteAnimator {
  id: string
  slug: string
  name: string
  nativeName: string | null
  photoUrl: string | null
  clipCount: number
  activeYears: string
  favoritedAt: Date
}

interface FavoritesPageClientProps {
  initialClips: ClipCard[]
  initialAnimators: FavoriteAnimator[]
}

export function FavoritesPageClient({
  initialClips,
  initialAnimators,
}: FavoritesPageClientProps) {
  const [activeTab, setActiveTab] = React.useState<'clips' | 'animators'>('clips')

  const { data: clipsData } = useFavoriteClips()
  const { data: animatorsData } = useFavoriteAnimators()

  const clips = clipsData || initialClips
  // Map to the shape expected by AnimatorGrid
  const animators = (animatorsData || initialAnimators).map((a) => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    nativeName: a.nativeName,
    photoUrl: a.photoUrl,
    _count: { attributions: a.clipCount },
  }))

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">My Favorites</h1>
        <p className="mt-2 text-foreground-muted">
          Your saved clips and animators
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <FavoritesTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          clipCount={clips.length}
          animatorCount={animators.length}
        />
      </div>

      {/* Content */}
      {activeTab === 'clips' && (
        <>
          {clips.length > 0 ? (
            <ClipGrid clips={clips} />
          ) : (
            <EmptyState type="clips" />
          )}
        </>
      )}

      {activeTab === 'animators' && (
        <>
          {animators.length > 0 ? (
            <AnimatorGrid animators={animators} />
          ) : (
            <EmptyState type="animators" />
          )}
        </>
      )}
    </div>
  )
}

function EmptyState({ type }: { type: 'clips' | 'animators' }) {
  return (
    <div className="rounded-card border border-border bg-surface py-12 text-center">
      <Heart className="mx-auto h-12 w-12 text-foreground-muted" />
      <h3 className="mt-4 text-lg font-semibold">No favorite {type} yet</h3>
      <p className="mt-2 text-foreground-muted">
        Start exploring and save your favorite {type === 'clips' ? 'animation clips' : 'animators'}
      </p>
    </div>
  )
}
