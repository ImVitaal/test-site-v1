import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { api, API_ENDPOINTS } from '@/lib/api'
import type {
  AnimatorCard,
  AnimatorWithRelations,
  AnimatorTimelineEntry,
} from '@/types/animator'
import type { ClipCard } from '@/types/clip'
import type { PaginatedResponse, AnimatorSearchParams } from '@/types/api'

// Query key factory for cache invalidation
export const animatorKeys = {
  all: ['animators'] as const,
  lists: () => [...animatorKeys.all, 'list'] as const,
  list: (params: AnimatorSearchParams) => [...animatorKeys.lists(), params] as const,
  details: () => [...animatorKeys.all, 'detail'] as const,
  detail: (slug: string) => [...animatorKeys.details(), slug] as const,
  timeline: (slug: string) => [...animatorKeys.detail(slug), 'timeline'] as const,
  clips: (slug: string, params?: AnimatorSearchParams) =>
    [...animatorKeys.detail(slug), 'clips', params] as const,
}

interface AnimatorListResponse {
  success: true
  data: AnimatorCard[]
  pagination: PaginatedResponse<AnimatorCard>['pagination']
}

interface AnimatorDetailResponse {
  success: true
  data: AnimatorWithRelations
}

interface AnimatorTimelineResponse {
  success: true
  data: AnimatorTimelineEntry[]
}

interface AnimatorClipsResponse {
  success: true
  data: ClipCard[]
  pagination: PaginatedResponse<ClipCard>['pagination']
}

// List animators with filters
export function useAnimators(params: AnimatorSearchParams = {}) {
  return useQuery({
    queryKey: animatorKeys.list(params),
    queryFn: () =>
      api.get<AnimatorListResponse>(API_ENDPOINTS.animators.list, params),
  })
}

// Infinite scroll for animators
export function useAnimatorsInfinite(params: Omit<AnimatorSearchParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...animatorKeys.lists(), 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      api.get<AnimatorListResponse>(API_ENDPOINTS.animators.list, {
        ...params,
        page: pageParam,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  })
}

// Get single animator
export function useAnimator(slug: string | undefined) {
  return useQuery({
    queryKey: animatorKeys.detail(slug!),
    queryFn: () =>
      api.get<AnimatorDetailResponse>(API_ENDPOINTS.animators.detail(slug!)),
    select: (data) => data.data,
    enabled: !!slug,
  })
}

// Get animator timeline
export function useAnimatorTimeline(slug: string | undefined) {
  return useQuery({
    queryKey: animatorKeys.timeline(slug!),
    queryFn: () =>
      api.get<AnimatorTimelineResponse>(API_ENDPOINTS.animators.timeline(slug!)),
    select: (data) => data.data,
    enabled: !!slug,
  })
}

// Get animator clips
export function useAnimatorClips(
  slug: string | undefined,
  params: AnimatorSearchParams = {}
) {
  return useQuery({
    queryKey: animatorKeys.clips(slug!, params),
    queryFn: () =>
      api.get<AnimatorClipsResponse>(API_ENDPOINTS.animators.clips(slug!), params),
    enabled: !!slug,
  })
}
