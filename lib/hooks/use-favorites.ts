'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { ClipCard } from '@/types/clip'
import type { AnimatorCard } from '@/types/animator'

export const favoriteKeys = {
  all: ['favorites'] as const,
  clips: () => [...favoriteKeys.all, 'clips'] as const,
  animators: () => [...favoriteKeys.all, 'animators'] as const,
}

export function useFavoriteClips() {
  return useQuery({
    queryKey: favoriteKeys.clips(),
    queryFn: () => api.get<ClipCard[]>('/user/favorites/clips'),
  })
}

export function useFavoriteAnimators() {
  return useQuery({
    queryKey: favoriteKeys.animators(),
    queryFn: () => api.get<AnimatorCard[]>('/user/favorites/animators'),
  })
}
