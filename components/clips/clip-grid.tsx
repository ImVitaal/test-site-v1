import { ClipCard } from './clip-card'
import type { VerificationStatus } from '@prisma/client'

interface Clip {
  id: string
  slug: string
  title: string
  thumbnailUrl: string | null
  duration: number
  anime: {
    title: string
    slug: string
  }
  primaryAnimator: {
    name: string
    slug: string
  } | null
  verificationStatus: VerificationStatus
}

interface ClipGridProps {
  clips: Clip[]
}

export function ClipGrid({ clips }: ClipGridProps) {
  if (clips.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-foreground-muted">No clips found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {clips.map((clip) => (
        <ClipCard
          key={clip.id}
          slug={clip.slug}
          title={clip.title}
          thumbnailUrl={clip.thumbnailUrl}
          duration={clip.duration}
          animeTitle={clip.anime.title}
          animatorName={clip.primaryAnimator?.name}
          verificationStatus={clip.verificationStatus}
        />
      ))}
    </div>
  )
}
