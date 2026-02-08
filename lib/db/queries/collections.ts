import prisma from '@/lib/db/prisma'
import { getPaginationParams, createPaginatedResult } from '@/lib/db/utils'

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50)
  const suffix = Math.random().toString(36).substring(2, 8)
  return `${base}-${suffix}`
}

export async function getUserCollections(userId: string) {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      clips: {
        take: 4,
        orderBy: { order: 'asc' },
        include: {
          clip: {
            select: { thumbnailUrl: true },
          },
        },
      },
      _count: {
        select: { clips: true },
      },
    },
  })

  return collections.map((c: typeof collections[number]) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    isPublic: c.isPublic,
    clipCount: c._count.clips,
    thumbnails: c.clips.map((cc: typeof c.clips[number]) => cc.clip.thumbnailUrl),
    createdAt: c.createdAt,
  }))
}

export async function getCollectionBySlug(slug: string) {
  const collection = await prisma.collection.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      clips: {
        orderBy: { order: 'asc' },
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
      },
      _count: {
        select: { clips: true },
      },
    },
  })

  if (!collection) return null

  return {
    id: collection.id,
    slug: collection.slug,
    name: collection.name,
    description: collection.description,
    isPublic: collection.isPublic,
    clipCount: collection._count.clips,
    thumbnails: collection.clips.slice(0, 4).map((cc: typeof collection.clips[number]) => cc.clip.thumbnailUrl),
    createdAt: collection.createdAt,
    user: collection.user,
    clips: collection.clips.map((cc: typeof collection.clips[number]) => ({
      id: cc.clip.id,
      slug: cc.clip.slug,
      title: cc.clip.title,
      thumbnailUrl: cc.clip.thumbnailUrl,
      duration: cc.clip.duration,
      viewCount: cc.clip.viewCount,
      favoriteCount: cc.clip.favoriteCount,
      anime: cc.clip.anime,
      primaryAnimator: cc.clip.attributions[0]?.animator || null,
      verificationStatus: cc.clip.attributions[0]?.verificationStatus || 'SPECULATIVE',
      order: cc.order,
    })),
  }
}

export async function createCollection(
  userId: string,
  data: { name: string; description?: string; isPublic: boolean }
) {
  const slug = generateSlug(data.name)

  return prisma.collection.create({
    data: {
      slug,
      name: data.name,
      description: data.description,
      isPublic: data.isPublic,
      userId,
    },
  })
}

export async function updateCollection(
  collectionId: string,
  userId: string,
  data: { name?: string; description?: string; isPublic?: boolean }
) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  })

  if (!collection || collection.userId !== userId) {
    throw new Error('Collection not found or not authorized')
  }

  return prisma.collection.update({
    where: { id: collectionId },
    data,
  })
}

export async function deleteCollection(collectionId: string, userId: string) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  })

  if (!collection || collection.userId !== userId) {
    throw new Error('Collection not found or not authorized')
  }

  return prisma.collection.delete({
    where: { id: collectionId },
  })
}

export async function addClipToCollection(collectionId: string, clipId: string, userId: string) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  })

  if (!collection || collection.userId !== userId) {
    throw new Error('Collection not found or not authorized')
  }

  // Get current max order
  const maxOrder = await prisma.collectionClip.findFirst({
    where: { collectionId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  return prisma.collectionClip.create({
    data: {
      collectionId,
      clipId,
      order: (maxOrder?.order ?? 0) + 1,
    },
  })
}

export async function removeClipFromCollection(collectionId: string, clipId: string, userId: string) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  })

  if (!collection || collection.userId !== userId) {
    throw new Error('Collection not found or not authorized')
  }

  return prisma.collectionClip.delete({
    where: {
      collectionId_clipId: { collectionId, clipId },
    },
  })
}

export async function reorderCollectionClips(collectionId: string, clipIds: string[], userId: string) {
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { userId: true },
  })

  if (!collection || collection.userId !== userId) {
    throw new Error('Collection not found or not authorized')
  }

  // Update order for each clip
  return prisma.$transaction(
    clipIds.map((clipId: string, index: number) =>
      prisma.collectionClip.update({
        where: {
          collectionId_clipId: { collectionId, clipId },
        },
        data: { order: index },
      })
    )
  )
}

export async function getClipCollectionIds(clipId: string, userId: string) {
  const collectionClips = await prisma.collectionClip.findMany({
    where: {
      clipId,
      collection: { userId },
    },
    select: { collectionId: true },
  })

  return collectionClips.map((cc: { collectionId: string }) => cc.collectionId)
}
