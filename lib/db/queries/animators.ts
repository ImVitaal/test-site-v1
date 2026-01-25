import prisma from '@/lib/db/prisma'
import { getPaginationParams, createPaginatedResult, type PaginationParams } from '@/lib/db/utils'
import type { AnimatorQueryInput } from '@/lib/validations/animator'

export async function getAnimatorBySlug(slug: string) {
  return prisma.animator.findUnique({
    where: { slug },
    include: {
      studioHistory: {
        include: {
          studio: true,
        },
        orderBy: { startYear: 'asc' },
      },
      mentors: {
        include: {
          mentor: {
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
      students: {
        include: {
          student: {
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
      _count: {
        select: {
          attributions: true,
          favorites: true,
        },
      },
    },
  })
}

export async function getAnimatorById(id: string) {
  return prisma.animator.findUnique({
    where: { id },
  })
}

export async function listAnimators(params: AnimatorQueryInput) {
  const { page, limit, skip } = getPaginationParams(params)
  const { q, sortBy, sortOrder, hasPhoto } = params

  const where = {
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { nativeName: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
    ...(hasPhoto !== undefined && { photoUrl: hasPhoto ? { not: null } : null }),
  }

  const orderBy = sortBy
    ? { [sortBy]: sortOrder }
    : { name: 'asc' as const }

  const [animators, total] = await Promise.all([
    prisma.animator.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        _count: {
          select: {
            attributions: true,
          },
        },
      },
    }),
    prisma.animator.count({ where }),
  ])

  return createPaginatedResult(animators, total, page, limit)
}

export async function getAnimatorClips(animatorId: string, params: PaginationParams) {
  const { page, limit, skip } = getPaginationParams(params)

  const [clips, total] = await Promise.all([
    prisma.clip.findMany({
      where: {
        attributions: {
          some: { animatorId },
        },
        submissionStatus: 'APPROVED',
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        anime: true,
        attributions: {
          include: {
            animator: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    prisma.clip.count({
      where: {
        attributions: {
          some: { animatorId },
        },
        submissionStatus: 'APPROVED',
      },
    }),
  ])

  return createPaginatedResult(clips, total, page, limit)
}

export async function getAnimatorTimeline(animatorId: string) {
  const attributions = await prisma.attribution.findMany({
    where: { animatorId },
    include: {
      clip: {
        include: {
          anime: true,
        },
      },
    },
  })

  // Group by year
  const timelineMap = new Map<number, Array<{
    animeTitle: string
    animeSlug: string
    role: string
    clipCount: number
  }>>()

  for (const attr of attributions) {
    const year = attr.clip.anime.year
    const existing = timelineMap.get(year) || []

    const animeEntry = existing.find(e => e.animeSlug === attr.clip.anime.slug)
    if (animeEntry) {
      animeEntry.clipCount++
    } else {
      existing.push({
        animeTitle: attr.clip.anime.title,
        animeSlug: attr.clip.anime.slug,
        role: attr.role,
        clipCount: 1,
      })
    }

    timelineMap.set(year, existing)
  }

  return Array.from(timelineMap.entries())
    .map(([year, works]) => ({ year, works }))
    .sort((a, b) => a.year - b.year)
}

export async function getAnimatorRelations(animatorId: string) {
  const [mentorRelations, studentRelations] = await Promise.all([
    prisma.animatorRelation.findMany({
      where: { studentId: animatorId },
      include: {
        mentor: {
          select: {
            id: true,
            slug: true,
            name: true,
            photoUrl: true,
          },
        },
      },
    }),
    prisma.animatorRelation.findMany({
      where: { mentorId: animatorId },
      include: {
        student: {
          select: {
            id: true,
            slug: true,
            name: true,
            photoUrl: true,
          },
        },
      },
    }),
  ])

  const centerAnimator = await prisma.animator.findUnique({
    where: { id: animatorId },
    select: {
      id: true,
      slug: true,
      name: true,
      photoUrl: true,
    },
  })

  if (!centerAnimator) return null

  const nodes = [
    { ...centerAnimator, type: 'center' as const },
    ...mentorRelations.map(r => ({ ...r.mentor, type: 'mentor' as const })),
    ...studentRelations.map(r => ({ ...r.student, type: 'student' as const })),
  ]

  const edges = [
    ...mentorRelations.map(r => ({
      source: r.mentor.id,
      target: animatorId,
      type: 'mentor' as const,
    })),
    ...studentRelations.map(r => ({
      source: animatorId,
      target: r.student.id,
      type: 'student' as const,
    })),
  ]

  return { nodes, edges }
}

export async function getSignatureClips(animatorId: string, limit = 5) {
  return prisma.clip.findMany({
    where: {
      attributions: {
        some: {
          animatorId,
          verificationStatus: 'VERIFIED',
        },
      },
      submissionStatus: 'APPROVED',
    },
    take: limit,
    orderBy: { favoriteCount: 'desc' },
    include: {
      anime: true,
    },
  })
}
