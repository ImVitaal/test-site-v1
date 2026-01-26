import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Types
export type RankingType = 'EDITORIAL' | 'COMMUNITY'
export type RankingCategory = 'ANIMATOR' | 'CLIP' | 'STUDIO' | 'ANIME'

export interface RankingListSummary {
  id: string
  slug: string
  title: string
  description: string | null
  type: RankingType
  category: RankingCategory
  coverUrl: string | null
  itemCount: number
  createdAt: string
}

export interface RankingItemWithEntity {
  id: string
  rank: number
  voteCount: number
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
    anime: { title: string }
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

export interface RankingListDetail extends RankingListSummary {
  items: RankingItemWithEntity[]
  userVotes: string[]
}

interface RankingListsParams {
  type?: RankingType
  category?: RankingCategory
  featured?: boolean
  limit?: number
  offset?: number
}

interface RankingListsResponse {
  success: true
  data: RankingListSummary[]
  pagination?: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

interface RankingDetailResponse {
  success: true
  data: RankingListDetail
}

interface VoteResponse {
  success: true
  data: {
    voted: boolean
    newVoteCount: number
  }
}

// Query key factory
export const rankingsKeys = {
  all: ['rankings'] as const,
  lists: () => [...rankingsKeys.all, 'list'] as const,
  list: (params: RankingListsParams) => [...rankingsKeys.lists(), params] as const,
  featured: () => [...rankingsKeys.all, 'featured'] as const,
  details: () => [...rankingsKeys.all, 'detail'] as const,
  detail: (slug: string) => [...rankingsKeys.details(), slug] as const,
}

/**
 * Fetch ranking lists with infinite query support
 */
export function useRankingLists(params: Omit<RankingListsParams, 'offset'> = {}) {
  const { type, category, featured, limit = 20 } = params

  return useInfiniteQuery({
    queryKey: rankingsKeys.list({ ...params, limit }),
    queryFn: ({ pageParam = 0 }) =>
      api.get<RankingListsResponse>('/rankings', {
        type,
        category,
        featured: featured ? 'true' : undefined,
        limit,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination?.hasMore) return undefined
      return (lastPage.pagination.offset ?? 0) + (lastPage.pagination.limit ?? limit)
    },
    select: (data) => ({
      lists: data.pages.flatMap((page) => page.data),
      pagination: data.pages[data.pages.length - 1]?.pagination,
    }),
  })
}

/**
 * Fetch featured ranking lists
 */
export function useFeaturedRankings(limit = 4) {
  return useQuery({
    queryKey: rankingsKeys.featured(),
    queryFn: () =>
      api.get<RankingListsResponse>('/rankings', {
        featured: 'true',
        limit,
      }),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

/**
 * Fetch a single ranking list by slug
 */
export function useRankingDetail(slug: string | undefined) {
  return useQuery({
    queryKey: rankingsKeys.detail(slug!),
    queryFn: () => api.get<RankingDetailResponse>(`/rankings/${slug}`),
    select: (data) => data.data,
    enabled: !!slug,
  })
}

/**
 * Toggle vote for a ranking item
 */
export function useVote(listSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) =>
      api.post<VoteResponse>(`/rankings/${listSlug}/vote`, { itemId }),
    onSuccess: (data, itemId) => {
      // Update the cache optimistically
      queryClient.setQueryData<RankingDetailResponse>(
        rankingsKeys.detail(listSlug),
        (old) => {
          if (!old) return old

          return {
            ...old,
            data: {
              ...old.data,
              items: old.data.items.map((item) =>
                item.id === itemId
                  ? { ...item, voteCount: data.data.newVoteCount }
                  : item
              ),
              userVotes: data.data.voted
                ? [...old.data.userVotes, itemId]
                : old.data.userVotes.filter((id) => id !== itemId),
            },
          }
        }
      )
    },
  })
}

/**
 * Get category display name
 */
export function getCategoryLabel(category: RankingCategory): string {
  const labels: Record<RankingCategory, string> = {
    ANIMATOR: 'Animators',
    CLIP: 'Clips',
    STUDIO: 'Studios',
    ANIME: 'Anime',
  }
  return labels[category]
}

/**
 * Get type display name
 */
export function getTypeLabel(type: RankingType): string {
  const labels: Record<RankingType, string> = {
    EDITORIAL: 'Editorial Pick',
    COMMUNITY: 'Community Voted',
  }
  return labels[type]
}
