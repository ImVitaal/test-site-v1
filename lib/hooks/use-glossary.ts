import { useQuery } from '@tanstack/react-query'
import { api, API_ENDPOINTS } from '@/lib/api'

// Types for glossary
export interface GlossaryTerm {
  id: string
  slug: string
  term: string
  definition: string
  exampleClipId: string | null
  relatedTerms: string[]
  createdAt: string
  updatedAt: string
}

export interface GlossaryTermWithDetails extends GlossaryTerm {
  exampleClip: {
    id: string
    slug: string
    title: string
    thumbnailUrl: string | null
    duration: number
  } | null
  relatedTermsData: GlossaryTerm[]
}

interface GlossaryListParams {
  q?: string
  letter?: string
  limit?: number
  offset?: number
}

interface GlossaryListResponse {
  success: true
  data: GlossaryTerm[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

interface GlossaryGroupedResponse {
  success: true
  data: Record<string, GlossaryTerm[]>
}

interface GlossaryDetailResponse {
  success: true
  data: GlossaryTermWithDetails
}

// Query key factory
export const glossaryKeys = {
  all: ['glossary'] as const,
  lists: () => [...glossaryKeys.all, 'list'] as const,
  list: (params: GlossaryListParams) => [...glossaryKeys.lists(), params] as const,
  grouped: () => [...glossaryKeys.all, 'grouped'] as const,
  details: () => [...glossaryKeys.all, 'detail'] as const,
  detail: (slug: string) => [...glossaryKeys.details(), slug] as const,
}

/**
 * Fetch glossary terms list
 */
export function useGlossaryTerms(params: GlossaryListParams = {}) {
  return useQuery({
    queryKey: glossaryKeys.list(params),
    queryFn: () =>
      api.get<GlossaryListResponse>(API_ENDPOINTS.glossary.list, params),
  })
}

/**
 * Fetch glossary terms grouped by letter (for index page)
 */
export function useGlossaryIndex() {
  return useQuery({
    queryKey: glossaryKeys.grouped(),
    queryFn: () =>
      api.get<GlossaryGroupedResponse>(API_ENDPOINTS.glossary.list, {
        grouped: 'true',
      }),
    select: (data) => data.data,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  })
}

/**
 * Fetch single glossary term by slug
 */
export function useGlossaryTerm(slug: string | undefined) {
  return useQuery({
    queryKey: glossaryKeys.detail(slug!),
    queryFn: () =>
      api.get<GlossaryDetailResponse>(API_ENDPOINTS.glossary.detail(slug!)),
    select: (data) => data.data,
    enabled: !!slug,
  })
}

/**
 * Prefetch a glossary term (for hover tooltips)
 */
export function usePrefetchGlossaryTerm() {
  // This would be used with queryClient.prefetchQuery
  // For tooltip hover prefetching
  return {
    prefetch: (slug: string) => ({
      queryKey: glossaryKeys.detail(slug),
      queryFn: () =>
        api.get<GlossaryDetailResponse>(API_ENDPOINTS.glossary.detail(slug)),
    }),
  }
}
