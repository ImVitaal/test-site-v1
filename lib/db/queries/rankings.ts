import prisma from '@/lib/db/prisma'
import type { RankingType, RankingCategory } from '@prisma/client'

/**
 * Types for rankings
 */
export interface RankingListSummary {
  id: string
  slug: string
  title: string
  description: string | null
  type: RankingType
  category: RankingCategory
  coverUrl: string | null
  itemCount: number
  createdAt: Date
}

export interface RankingListDetail extends RankingListSummary {
  items: RankingItemWithEntity[]
}

export interface RankingItemWithEntity {
  id: string
  rank: number
  voteCount: number
  // Entity data (one will be populated based on category)
  animator?: {
    id: string
    slug: string
    name: string
    nativeName: string | null
    photoUrl: string | null
  } | null
  clip?: {
    id: string
    slug: string
    title: string
    thumbnailUrl: string | null
    anime: {
      title: string
    }
  } | null
  studio?: {
    id: string
    slug: string
    name: string
    nativeName: string | null
    logoUrl: string | null
  } | null
  anime?: {
    id: string
    slug: string
    title: string
    nativeTitle: string | null
    coverUrl: string | null
    year: number
  } | null
}

export interface GetRankingListsParams {
  type?: RankingType
  category?: RankingCategory
  limit?: number
  offset?: number
}

/**
 * Get all ranking lists with pagination and filtering
 */
export async function getRankingLists(params: GetRankingListsParams = {}) {
  const { type, category, limit = 20, offset = 0 } = params

  const where = {
    isActive: true,
    ...(type && { type }),
    ...(category && { category }),
  }

  const [lists, total] = await Promise.all([
    prisma.rankingList.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        type: true,
        category: true,
        coverUrl: true,
        createdAt: true,
        _count: {
          select: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.rankingList.count({ where }),
  ])

  return {
    lists: lists.map((list) => ({
      ...list,
      itemCount: list._count.items,
      _count: undefined,
    })) as RankingListSummary[],
    total,
    hasMore: offset + lists.length < total,
  }
}

/**
 * Get a single ranking list by slug with all items
 */
export async function getRankingListBySlug(
  slug: string
): Promise<RankingListDetail | null> {
  const list = await prisma.rankingList.findUnique({
    where: { slug, isActive: true },
    include: {
      items: {
        orderBy: { rank: 'asc' },
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
          clip: {
            select: {
              id: true,
              slug: true,
              title: true,
              thumbnailUrl: true,
              anime: {
                select: { title: true },
              },
            },
          },
          studio: {
            select: {
              id: true,
              slug: true,
              name: true,
              nativeName: true,
              logoUrl: true,
            },
          },
          anime: {
            select: {
              id: true,
              slug: true,
              title: true,
              nativeTitle: true,
              coverUrl: true,
              year: true,
            },
          },
        },
      },
      _count: {
        select: { items: true },
      },
    },
  })

  if (!list) return null

  return {
    id: list.id,
    slug: list.slug,
    title: list.title,
    description: list.description,
    type: list.type,
    category: list.category,
    coverUrl: list.coverUrl,
    itemCount: list._count.items,
    createdAt: list.createdAt,
    items: list.items.map((item) => ({
      id: item.id,
      rank: item.rank,
      voteCount: item.voteCount,
      animator: item.animator,
      clip: item.clip,
      studio: item.studio,
      anime: item.anime,
    })),
  }
}

/**
 * Get featured/popular ranking lists for homepage
 */
export async function getFeaturedRankingLists(limit = 4) {
  const lists = await prisma.rankingList.findMany({
    where: { isActive: true },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      type: true,
      category: true,
      coverUrl: true,
      createdAt: true,
      _count: {
        select: { items: true },
      },
    },
    orderBy: [
      { type: 'asc' }, // Editorial first
      { createdAt: 'desc' },
    ],
    take: limit,
  })

  return lists.map((list) => ({
    ...list,
    itemCount: list._count.items,
    _count: undefined,
  })) as RankingListSummary[]
}

/**
 * Check if a user has voted for an item
 */
export async function hasUserVoted(
  userId: string,
  itemId: string
): Promise<boolean> {
  const vote = await prisma.vote.findUnique({
    where: {
      userId_itemId: { userId, itemId },
    },
  })
  return !!vote
}

/**
 * Get user's votes for a ranking list
 */
export async function getUserVotesForList(
  userId: string,
  listId: string
): Promise<string[]> {
  const votes = await prisma.vote.findMany({
    where: {
      userId,
      item: { listId },
    },
    select: { itemId: true },
  })
  return votes.map((v) => v.itemId)
}

/**
 * Toggle vote for a ranking item
 */
export async function toggleVote(
  userId: string,
  itemId: string
): Promise<{ voted: boolean; newVoteCount: number }> {
  // Check if vote exists
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_itemId: { userId, itemId },
    },
  })

  if (existingVote) {
    // Remove vote
    await prisma.$transaction([
      prisma.vote.delete({
        where: { id: existingVote.id },
      }),
      prisma.rankingItem.update({
        where: { id: itemId },
        data: { voteCount: { decrement: 1 } },
      }),
    ])

    const item = await prisma.rankingItem.findUnique({
      where: { id: itemId },
      select: { voteCount: true },
    })

    return { voted: false, newVoteCount: item?.voteCount ?? 0 }
  } else {
    // Add vote
    await prisma.$transaction([
      prisma.vote.create({
        data: { userId, itemId },
      }),
      prisma.rankingItem.update({
        where: { id: itemId },
        data: { voteCount: { increment: 1 } },
      }),
    ])

    const item = await prisma.rankingItem.findUnique({
      where: { id: itemId },
      select: { voteCount: true },
    })

    return { voted: true, newVoteCount: item?.voteCount ?? 0 }
  }
}

/**
 * Get ranking lists by category for category pages
 */
export async function getRankingListsByCategory(category: RankingCategory) {
  return getRankingLists({ category, limit: 50 })
}
