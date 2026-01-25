import prisma from '@/lib/db/prisma'

export async function getUserFavoriteClips(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: {
      userId,
      clipId: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      clip: {
        include: {
          anime: { select: { title: true, slug: true } },
          attributions: {
            take: 1,
            include: {
              animator: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
  })

  return favorites
    .filter((f) => f.clip !== null)
    .map((f) => ({
      id: f.clip!.id,
      slug: f.clip!.slug,
      title: f.clip!.title,
      thumbnailUrl: f.clip!.thumbnailUrl,
      duration: f.clip!.duration,
      viewCount: f.clip!.viewCount,
      favoriteCount: f.clip!.favoriteCount,
      anime: f.clip!.anime,
      primaryAnimator: f.clip!.attributions[0]?.animator || null,
      verificationStatus: f.clip!.attributions[0]?.verificationStatus || 'SPECULATIVE',
      favoritedAt: f.createdAt,
    }))
}

export async function getUserFavoriteAnimators(userId: string) {
  const favorites = await prisma.favorite.findMany({
    where: {
      userId,
      animatorId: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      animator: {
        include: {
          _count: {
            select: { attributions: true },
          },
        },
      },
    },
  })

  return favorites
    .filter((f) => f.animator !== null)
    .map((f) => {
      const animator = f.animator!
      const birthYear = animator.birthDate?.getFullYear()
      const deathYear = animator.deathDate?.getFullYear()
      const activeYears = deathYear
        ? `${birthYear || '?'}-${deathYear}`
        : birthYear
          ? `${birthYear}-present`
          : 'Unknown'

      return {
        id: animator.id,
        slug: animator.slug,
        name: animator.name,
        nativeName: animator.nativeName,
        photoUrl: animator.photoUrl,
        clipCount: animator._count.attributions,
        activeYears,
        favoritedAt: f.createdAt,
      }
    })
}
