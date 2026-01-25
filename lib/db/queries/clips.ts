import prisma from '@/lib/db/prisma'
import { getPaginationParams, createPaginatedResult } from '@/lib/db/utils'
import type { ClipQueryInput } from '@/lib/validations/clip'

export async function getClipBySlug(slug: string) {
  return prisma.clip.findUnique({
    where: { slug, submissionStatus: 'APPROVED' },
    include: {
      anime: true,
      studio: true,
      attributions: {
        include: {
          animator: {
            select: {
              id: true,
              slug: true,
              name: true,
              nativeName: true,
              photoUrl: true,
            },
          },
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })
}

export async function getClipById(id: string) {
  return prisma.clip.findUnique({
    where: { id },
    include: {
      anime: true,
      attributions: {
        include: {
          animator: true,
        },
      },
    },
  })
}

export async function listClips(params: ClipQueryInput) {
  const { page, limit, skip } = getPaginationParams(params)
  const {
    q,
    sortBy,
    sortOrder,
    animatorId,
    animeId,
    studioId,
    tagIds,
    verificationStatus,
    yearStart,
    yearEnd,
  } = params

  const where = {
    submissionStatus: 'APPROVED' as const,
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        { anime: { title: { contains: q, mode: 'insensitive' as const } } },
      ],
    }),
    ...(animatorId && {
      attributions: { some: { animatorId } },
    }),
    ...(animeId && { animeId }),
    ...(studioId && { studioId }),
    ...(tagIds && tagIds.length > 0 && {
      tags: { some: { tagId: { in: tagIds } } },
    }),
    ...(verificationStatus && {
      attributions: { some: { verificationStatus } },
    }),
    ...((yearStart || yearEnd) && {
      anime: {
        year: {
          ...(yearStart && { gte: yearStart }),
          ...(yearEnd && { lte: yearEnd }),
        },
      },
    }),
  }

  const orderBy = sortBy
    ? { [sortBy]: sortOrder }
    : { createdAt: 'desc' as const }

  const [clips, total] = await Promise.all([
    prisma.clip.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        anime: {
          select: {
            title: true,
            slug: true,
          },
        },
        attributions: {
          take: 1,
          orderBy: { verificationStatus: 'asc' },
          include: {
            animator: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    }),
    prisma.clip.count({ where }),
  ])

  // Transform to ClipCard format
  const data = clips.map((clip) => ({
    id: clip.id,
    slug: clip.slug,
    title: clip.title,
    thumbnailUrl: clip.thumbnailUrl,
    duration: clip.duration,
    viewCount: clip.viewCount,
    favoriteCount: clip.favoriteCount,
    anime: clip.anime,
    primaryAnimator: clip.attributions[0]?.animator || null,
    verificationStatus: clip.attributions[0]?.verificationStatus || 'SPECULATIVE',
  }))

  return createPaginatedResult(data, total, page, limit)
}

export async function getRelatedClips(clipId: string, limit = 6) {
  const clip = await prisma.clip.findUnique({
    where: { id: clipId },
    include: {
      attributions: { select: { animatorId: true } },
    },
  })

  if (!clip) return []

  const animatorIds = clip.attributions.map((a) => a.animatorId)

  return prisma.clip.findMany({
    where: {
      id: { not: clipId },
      submissionStatus: 'APPROVED',
      OR: [
        { animeId: clip.animeId },
        { attributions: { some: { animatorId: { in: animatorIds } } } },
      ],
    },
    take: limit,
    orderBy: { favoriteCount: 'desc' },
    include: {
      anime: { select: { title: true, slug: true } },
      attributions: {
        take: 1,
        include: {
          animator: { select: { name: true, slug: true } },
        },
      },
    },
  })
}

export async function incrementClipViews(clipId: string) {
  return prisma.clip.update({
    where: { id: clipId },
    data: { viewCount: { increment: 1 } },
  })
}

export async function toggleFavorite(userId: string, clipId: string) {
  const existing = await prisma.favorite.findUnique({
    where: { userId_clipId: { userId, clipId } },
  })

  if (existing) {
    await prisma.$transaction([
      prisma.favorite.delete({
        where: { id: existing.id },
      }),
      prisma.clip.update({
        where: { id: clipId },
        data: { favoriteCount: { decrement: 1 } },
      }),
    ])
    return { favorited: false }
  }

  await prisma.$transaction([
    prisma.favorite.create({
      data: { userId, clipId },
    }),
    prisma.clip.update({
      where: { id: clipId },
      data: { favoriteCount: { increment: 1 } },
    }),
  ])
  return { favorited: true }
}

export async function isClipFavorited(userId: string, clipId: string) {
  const favorite = await prisma.favorite.findUnique({
    where: { userId_clipId: { userId, clipId } },
  })
  return !!favorite
}
