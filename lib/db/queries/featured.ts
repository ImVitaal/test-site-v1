import prisma from '@/lib/db/prisma'

export interface FeaturedAnimatorData {
  id: string
  slug: string
  name: string
  nativeName: string | null
  photoUrl: string | null
  bio: string | null
  clipCount: number
  signatureClip: {
    id: string
    slug: string
    title: string
    videoUrl: string
    thumbnailUrl: string | null
    anime: {
      title: string
      slug: string
    }
  } | null
}

/**
 * Get the featured animator of the week.
 *
 * Selection algorithm:
 * - Prioritizes animators with verified clips
 * - Scores based on: clipCount * 2 + favoriteCount
 * - Requires at least one approved clip with video
 * - Rotates weekly based on current week number
 */
export async function getFeaturedAnimator(): Promise<FeaturedAnimatorData | null> {
  // Get current week of year for rotation
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weekNumber = Math.floor(
    (now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000)
  )

  // Get animators with their engagement scores
  const animators = await prisma.animator.findMany({
    where: {
      photoUrl: { not: null }, // Must have a photo
      attributions: {
        some: {
          verificationStatus: 'VERIFIED',
          clip: {
            submissionStatus: 'APPROVED',
            videoUrl: { not: '' },
          },
        },
      },
    },
    include: {
      _count: {
        select: {
          attributions: true,
          favorites: true,
        },
      },
    },
    orderBy: [
      { attributions: { _count: 'desc' } },
    ],
    take: 20, // Get top 20 candidates
  })

  if (animators.length === 0) {
    return null
  }

  // Score and sort
  const scored = animators.map((a: typeof animators[number]) => ({
    animator: a,
    score: a._count.attributions * 2 + a._count.favorites,
  }))
  scored.sort((a, b) => b.score - a.score)

  // Rotate through top animators weekly
  const featuredIndex = weekNumber % Math.min(scored.length, 10)
  const featured = scored[featuredIndex].animator

  // Get signature clip (best verified clip)
  const signatureClip = await prisma.clip.findFirst({
    where: {
      attributions: {
        some: {
          animatorId: featured.id,
          verificationStatus: 'VERIFIED',
        },
      },
      submissionStatus: 'APPROVED',
      videoUrl: { not: '' },
    },
    orderBy: { favoriteCount: 'desc' },
    include: {
      anime: {
        select: {
          title: true,
          slug: true,
        },
      },
    },
  })

  return {
    id: featured.id,
    slug: featured.slug,
    name: featured.name,
    nativeName: featured.nativeName,
    photoUrl: featured.photoUrl,
    bio: featured.bio,
    clipCount: featured._count.attributions,
    signatureClip: signatureClip
      ? {
          id: signatureClip.id,
          slug: signatureClip.slug,
          title: signatureClip.title,
          videoUrl: signatureClip.videoUrl,
          thumbnailUrl: signatureClip.thumbnailUrl,
          anime: signatureClip.anime,
        }
      : null,
  }
}
