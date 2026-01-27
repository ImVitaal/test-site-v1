import { useQuery } from '@tanstack/react-query'
import { api, API_ENDPOINTS } from '@/lib/api'

// Types for homepage data
export interface FeaturedAnimator {
  id: string
  slug: string
  name: string
  nativeName: string | null
  bio: string | null
  photoUrl: string | null
  clipCount: number
  favoriteCount: number
  signatureClip: {
    id: string
    slug: string
    title: string
    thumbnailUrl: string | null
    videoUrl: string
    duration: number
    anime: {
      title: string
    }
  } | null
}

export interface RisingAnimator {
  id: string
  slug: string
  name: string
  nativeName: string | null
  photoUrl: string | null
  recentClipCount: number
  latestClip: {
    id: string
    slug: string
    title: string
    thumbnailUrl: string | null
    viewCount: number
    favoriteCount: number
    anime: {
      title: string
    }
  } | null
}

type VerificationStatus = 'VERIFIED' | 'SPECULATIVE' | 'DISPUTED'

export interface RecentClip {
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
  }
  primaryAnimator: {
    name: string
    slug: string
  } | null
  verificationStatus: VerificationStatus
}

interface FeaturedAnimatorResponse {
  success: true
  data: FeaturedAnimator
}

interface RisingAnimatorsResponse {
  success: true
  data: RisingAnimator[]
}

interface RecentClipsResponse {
  success: true
  data: RecentClip[]
}

// Query key factory
export const homepageKeys = {
  all: ['homepage'] as const,
  featured: () => [...homepageKeys.all, 'featured'] as const,
  rising: () => [...homepageKeys.all, 'rising'] as const,
  recent: () => [...homepageKeys.all, 'recent'] as const,
}

/**
 * Fetch featured animator for homepage hero
 */
export function useFeaturedAnimator() {
  return useQuery({
    queryKey: homepageKeys.featured(),
    queryFn: () => api.get<FeaturedAnimatorResponse>(API_ENDPOINTS.animators.featured),
    select: (data) => data.data,
    // Cache for 1 hour since it rotates weekly
    staleTime: 60 * 60 * 1000,
  })
}

/**
 * Fetch rising star animators
 */
export function useRisingAnimators(limit = 4) {
  return useQuery({
    queryKey: homepageKeys.rising(),
    queryFn: () =>
      api.get<RisingAnimatorsResponse>(API_ENDPOINTS.animators.rising, { limit }),
    select: (data) => data.data,
    // Cache for 15 minutes
    staleTime: 15 * 60 * 1000,
  })
}

/**
 * Fetch recently added clips
 */
export function useRecentClips(limit = 6) {
  return useQuery({
    queryKey: homepageKeys.recent(),
    queryFn: () =>
      api.get<RecentClipsResponse>(API_ENDPOINTS.clips.recent, { limit }),
    select: (data) => data.data,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
  })
}
