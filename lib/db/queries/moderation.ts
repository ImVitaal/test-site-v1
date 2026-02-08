import prisma from '@/lib/db/prisma'
import { getPaginationParams, createPaginatedResult } from '@/lib/db/utils'
import { TRUST_POINTS } from '@/config/constants'

interface ModerationQueryParams {
  page?: number
  limit?: number
  sortBy?: 'date' | 'trust'
  sortOrder?: 'asc' | 'desc'
}

export async function getPendingClips(params: ModerationQueryParams = {}) {
  const { page, limit, skip } = getPaginationParams({
    page: params.page,
    limit: params.limit,
  })

  const orderBy = { createdAt: (params.sortOrder || 'asc') as 'asc' | 'desc' }

  const [clips, total] = await Promise.all([
    prisma.clip.findMany({
      where: { submissionStatus: 'PENDING' },
      orderBy,
      skip,
      take: limit,
      include: {
        anime: {
          select: { title: true },
        },
        attributions: {
          include: {
            animator: {
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.clip.count({ where: { submissionStatus: 'PENDING' } }),
  ])

  // Fetch submitter info separately to handle the relation
  const userIds = clips.map((c: typeof clips[number]) => c.submittedBy).filter(Boolean) as string[]
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      image: true,
      trustScore: true,
    },
  })
  const userMap = new Map(users.map((u: typeof users[number]) => [u.id, u]))

  // Transform to queue item format
  const data = clips.map((clip: typeof clips[number]) => ({
    id: clip.id,
    slug: clip.slug,
    title: clip.title,
    thumbnailUrl: clip.thumbnailUrl,
    duration: clip.duration,
    techniqueDescription: clip.techniqueDescription,
    submittedAt: clip.createdAt,
    anime: clip.anime,
    submittedBy: clip.submittedBy
      ? userMap.get(clip.submittedBy) || { id: clip.submittedBy, name: null, image: null, trustScore: 0 }
      : { id: '', name: null, image: null, trustScore: 0 },
    attributions: clip.attributions.map((a: typeof clip.attributions[number]) => ({
      animator: a.animator,
      role: a.role,
    })),
  }))

  return createPaginatedResult(data, total, page, limit)
}

export async function getModerationStats(moderatorId?: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [pending, approvedToday, rejectedToday, totalReviewed] = await Promise.all([
    prisma.clip.count({ where: { submissionStatus: 'PENDING' } }),
    prisma.clip.count({
      where: {
        submissionStatus: 'APPROVED',
        moderatedAt: { gte: today },
        ...(moderatorId && { moderatedBy: moderatorId }),
      },
    }),
    prisma.clip.count({
      where: {
        submissionStatus: 'REJECTED',
        moderatedAt: { gte: today },
        ...(moderatorId && { moderatedBy: moderatorId }),
      },
    }),
    prisma.clip.count({
      where: {
        submissionStatus: { in: ['APPROVED', 'REJECTED'] },
        ...(moderatorId && { moderatedBy: moderatorId }),
      },
    }),
  ])

  return { pending, approvedToday, rejectedToday, totalReviewed }
}

export async function moderateClip(
  clipId: string,
  moderatorId: string,
  action: 'approve' | 'reject',
  reason?: string
) {
  const clip = await prisma.clip.findUnique({
    where: { id: clipId },
    select: { submittedBy: true },
  })

  if (!clip) {
    throw new Error('Clip not found')
  }

  // Update clip status and submitter trust score in a transaction
  return prisma.$transaction(async (tx) => {
    // Update clip
    const updatedClip = await tx.clip.update({
      where: { id: clipId },
      data: {
        submissionStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
        moderatedBy: moderatorId,
        moderatedAt: new Date(),
      },
    })

    // Update submitter trust score if we have a submitter
    if (clip.submittedBy) {
      const trustChange = action === 'approve' ? TRUST_POINTS.CLIP_APPROVED : TRUST_POINTS.SUBMISSION_REJECTED

      await tx.user.update({
        where: { id: clip.submittedBy },
        data: {
          trustScore: { increment: trustChange },
        },
      })
    }

    return updatedClip
  })
}
