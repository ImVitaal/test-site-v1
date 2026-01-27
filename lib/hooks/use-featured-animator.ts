import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface FeaturedAnimatorData {
  id: string
  slug: string
  name: string
  nativeName: string | null
  photoUrl: string | null
  bio: string | null
  clipCount: number
  signatureClip: {
    id: string
    slug: string
    title: string
    videoUrl: string
    thumbnailUrl: string | null
    anime: {
      title: string
      slug: string
    }
  } | null
}

interface FeaturedAnimatorResponse {
  success: true
  data: FeaturedAnimatorData | null
}

// Query key factory
export const featuredAnimatorKeys = {
  all: ['featured-animator'] as const,
  current: () => [...featuredAnimatorKeys.all, 'current'] as const,
}

/**
 * Fetch the featured animator of the week
 * Cache for 1 hour since it only changes weekly
 */
export function useFeaturedAnimator() {
  return useQuery({
    queryKey: featuredAnimatorKeys.current(),
    queryFn: () => api.get<FeaturedAnimatorResponse>('/featured-animator'),
    select: (data) => data.data,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}
