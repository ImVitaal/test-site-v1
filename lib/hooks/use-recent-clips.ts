import { useQuery } from '@tanstack/react-query'
import { api, API_ENDPOINTS } from '@/lib/api'
import type { ClipCard } from '@/types/clip'

interface RecentClipsResponse {
  success: true
  data: ClipCard[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Query key factory
export const recentClipsKeys = {
  all: ['recent-clips'] as const,
  list: (limit: number) => [...recentClipsKeys.all, 'list', limit] as const,
}

/**
 * Fetch recent clips sorted by creation date
 * Used for "Recent Additions" section on homepage
 */
export function useRecentClips(limit = 6) {
  return useQuery({
    queryKey: recentClipsKeys.list(limit),
    queryFn: () =>
      api.get<RecentClipsResponse>(API_ENDPOINTS.clips.list, {
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    select: (data) => data.data,
    staleTime: 2 * 60 * 1000, // 2 minutes - recent additions change more frequently
  })
}
