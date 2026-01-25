'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { ModerationQueueItem, ModerationAction } from '@/components/moderation'
import type { PaginatedResponse } from '@/types/api'

interface ModerationStats {
  pending: number
  approvedToday: number
  rejectedToday: number
  totalReviewed: number
}

interface ModerationQueueParams {
  page?: number
  limit?: number
  sortBy?: 'date' | 'trust'
  sortOrder?: 'asc' | 'desc'
}

export const moderationKeys = {
  all: ['moderation'] as const,
  queue: (params?: ModerationQueueParams) => [...moderationKeys.all, 'queue', params] as const,
  stats: () => [...moderationKeys.all, 'stats'] as const,
}

export function useModerationQueue(params?: ModerationQueueParams) {
  return useQuery({
    queryKey: moderationKeys.queue(params),
    queryFn: () =>
      api.get<PaginatedResponse<ModerationQueueItem>>('/moderation/clips', {
        page: params?.page,
        limit: params?.limit,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      }),
  })
}

export function useModerationStats() {
  return useQuery({
    queryKey: moderationKeys.stats(),
    queryFn: () => api.get<ModerationStats>('/moderation/stats'),
  })
}

export function useModerateClip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clipId, action }: { clipId: string; action: ModerationAction }) =>
      api.post(`/moderation/clips/${clipId}`, action),
    onSuccess: () => {
      // Invalidate queue and stats
      queryClient.invalidateQueries({ queryKey: moderationKeys.all })
    },
  })
}
