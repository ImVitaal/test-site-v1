import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { api, API_ENDPOINTS } from '@/lib/api'

// Local type to avoid Prisma client dependency
type VerificationStatus = 'VERIFIED' | 'SPECULATIVE' | 'DISPUTED'

// Types for trending clips
export interface TrendingClip {
  id: string
  slug: string
  title: string
  thumbnailUrl: string | null
  duration: number
  viewCount: number
  favoriteCount: number
  createdAt: string
  anime: {
    title: string
    slug: string
  } | null
  primaryAnimator: {
    name: string
    slug: string
  } | null
  verificationStatus: VerificationStatus
  trendingScore: number
}

interface TrendingParams {
  limit?: number
  offset?: number
  windowDays?: number
}

interface TrendingResponse {
  success: true
  data: TrendingClip[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

// Query key factory for cache invalidation
export const trendingKeys = {
  all: ['trending'] as const,
  lists: () => [...trendingKeys.all, 'list'] as const,
  list: (params: TrendingParams) => [...trendingKeys.lists(), params] as const,
  homepage: () => [...trendingKeys.all, 'homepage'] as const,
}

/**
 * Fetch trending clips with pagination
 */
export function useTrending(params: TrendingParams = {}) {
  return useQuery({
    queryKey: trendingKeys.list(params),
    queryFn: () =>
      api.get<TrendingResponse>(API_ENDPOINTS.clips.trending, params),
  })
}

/**
 * Fetch trending clips for homepage (limited, shorter window)
 */
export function useHomepageTrending(limit = 6) {
  return useQuery({
    queryKey: trendingKeys.homepage(),
    queryFn: () =>
      api.get<TrendingResponse>(API_ENDPOINTS.clips.trending, {
        limit,
        windowDays: 14,
      }),
    select: (data) => data.data,
    // Cache for 5 minutes since trending changes slowly
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Infinite scroll for trending clips
 */
export function useTrendingInfinite(params: Omit<TrendingParams, 'offset'> = {}) {
  const limit = params.limit ?? 12

  return useInfiniteQuery({
    queryKey: [...trendingKeys.lists(), 'infinite', params],
    queryFn: ({ pageParam = 0 }) =>
      api.get<TrendingResponse>(API_ENDPOINTS.clips.trending, {
        ...params,
        limit,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore
        ? lastPage.pagination.offset + lastPage.pagination.limit
        : undefined,
    initialPageParam: 0,
  })
}
