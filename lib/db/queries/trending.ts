import prisma from '@/lib/db/prisma'

/**
 * Trending Algorithm - Hacker News Style with Decay
 *
 * The formula balances engagement metrics with recency:
 * Score = points / (hoursAge + 2)^gravity
 *
 * Where points = log10(views) * 1 + favorites * 2 + comments * 1.5
 *
 * This ensures:
 * - Logarithmic normalization prevents view count domination
 * - Fresh clips with high engagement can outrank old viral clips
 * - Gravity decay (1.8) ensures content cycles naturally
 */

interface TrendingClip {
  id: string
  slug: string
  title: string
  thumbnailUrl: string | null
  duration: number
  viewCount: number
  favoriteCount: number
  createdAt: Date
  anime: {
    title: string
    slug: string
  } | null
  primaryAnimator: {
    name: string
    slug: string
  } | null
  verificationStatus: 'VERIFIED' | 'SPECULATIVE' | 'DISPUTED'
  trendingScore: number
}

interface TrendingParams {
  limit?: number
  offset?: number
  // Time window in days - clips older than this are excluded
  windowDays?: number
}

/**
 * Calculate trending score for a clip
 * Uses Hacker News-style decay algorithm
 */
function calculateTrendingScore(
  viewCount: number,
  favoriteCount: number,
  commentCount: number,
  createdAt: Date
): number {
  const hoursAge = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)
  const gravity = 1.8 // Higher = faster decay

  // Logarithmic normalization prevents view count domination
  // log10(1M) = 6, log10(1000) = 3, log10(10) = 1
  const points =
    Math.log10(Math.max(viewCount, 1)) * 1 +
    favoriteCount * 2 +
    commentCount * 1.5

  return points / Math.pow(hoursAge + 2, gravity)
}

/**
 * Get trending clips with calculated scores
 */
export async function getTrendingClips(params: TrendingParams = {}): Promise<{
  data: TrendingClip[]
  total: number
}> {
  const { limit = 12, offset = 0, windowDays = 30 } = params

  // Calculate the date cutoff
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - windowDays)

  // Fetch clips from the last N days that are approved
  const clips = await prisma.clip.findMany({
    where: {
      submissionStatus: 'APPROVED',
      createdAt: {
        gte: cutoffDate,
      },
    },
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
      _count: {
        select: {
          comments: true,
        },
      },
    },
  })

  // Calculate trending scores and sort
  const scoredClips = clips
    .map((clip) => ({
      id: clip.id,
      slug: clip.slug,
      title: clip.title,
      thumbnailUrl: clip.thumbnailUrl,
      duration: clip.duration,
      viewCount: clip.viewCount,
      favoriteCount: clip.favoriteCount,
      createdAt: clip.createdAt,
      anime: clip.anime,
      primaryAnimator: clip.attributions[0]?.animator || null,
      verificationStatus:
        clip.attributions[0]?.verificationStatus || 'SPECULATIVE',
      trendingScore: calculateTrendingScore(
        clip.viewCount,
        clip.favoriteCount,
        clip._count.comments,
        clip.createdAt
      ),
    }))
    .sort((a, b) => b.trendingScore - a.trendingScore)

  // Apply pagination
  const paginatedClips = scoredClips.slice(offset, offset + limit)

  return {
    data: paginatedClips as TrendingClip[],
    total: scoredClips.length,
  }
}

/**
 * Get trending clips for homepage (simplified, fewer items)
 */
export async function getHomepageTrending(limit = 6): Promise<TrendingClip[]> {
  const result = await getTrendingClips({ limit, windowDays: 14 })
  return result.data
}
