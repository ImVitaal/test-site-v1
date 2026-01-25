import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { api, API_ENDPOINTS } from '@/lib/api'
import type { ClipCard, ClipWithRelations } from '@/types/clip'
import type { PaginatedResponse, ClipSearchParams } from '@/types/api'

// Query key factory for cache invalidation
export const clipKeys = {
  all: ['clips'] as const,
  lists: () => [...clipKeys.all, 'list'] as const,
  list: (params: ClipSearchParams) => [...clipKeys.lists(), params] as const,
  details: () => [...clipKeys.all, 'detail'] as const,
  detail: (slug: string) => [...clipKeys.details(), slug] as const,
  related: (slug: string) => [...clipKeys.detail(slug), 'related'] as const,
  favorite: (slug: string) => [...clipKeys.detail(slug), 'favorite'] as const,
}

interface ClipListResponse {
  success: true
  data: ClipCard[]
  pagination: PaginatedResponse<ClipCard>['pagination']
}

interface ClipDetailResponse {
  success: true
  data: ClipWithRelations
}

// List clips with filters
export function useClips(params: ClipSearchParams = {}) {
  return useQuery({
    queryKey: clipKeys.list(params),
    queryFn: () => api.get<ClipListResponse>(API_ENDPOINTS.clips.list, params),
  })
}

// Infinite scroll for clips
export function useClipsInfinite(params: Omit<ClipSearchParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...clipKeys.lists(), 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      api.get<ClipListResponse>(API_ENDPOINTS.clips.list, {
        ...params,
        page: pageParam,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  })
}

// Get single clip
export function useClip(slug: string | undefined) {
  return useQuery({
    queryKey: clipKeys.detail(slug!),
    queryFn: () =>
      api.get<ClipDetailResponse>(API_ENDPOINTS.clips.detail(slug!)),
    select: (data) => data.data,
    enabled: !!slug,
  })
}

// Get related clips
export function useRelatedClips(slug: string | undefined) {
  return useQuery({
    queryKey: clipKeys.related(slug!),
    queryFn: () =>
      api.get<{ success: true; data: ClipCard[] }>(
        API_ENDPOINTS.clips.related(slug!)
      ),
    select: (data) => data.data,
    enabled: !!slug,
  })
}

// Check if clip is favorited
export function useClipFavoriteStatus(slug: string | undefined) {
  return useQuery({
    queryKey: clipKeys.favorite(slug!),
    queryFn: () =>
      api.get<{ success: true; data: { favorited: boolean } }>(
        API_ENDPOINTS.clips.favorite(slug!)
      ),
    select: (data) => data.data.favorited,
    enabled: !!slug,
  })
}
