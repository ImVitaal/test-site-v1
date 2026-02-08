'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { CollectionCardData } from '@/components/collections'

interface CollectionDetail extends CollectionCardData {
  user: {
    id: string
    name: string | null
    image: string | null
  }
  clips: any[]
}

export const collectionKeys = {
  all: ['collections'] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
  list: (userId?: string) => [...collectionKeys.lists(), userId] as const,
  detail: (slug: string) => [...collectionKeys.all, 'detail', slug] as const,
  clipCollections: (clipId: string) => [...collectionKeys.all, 'clip', clipId] as const,
}

export function useUserCollections() {
  return useQuery({
    queryKey: collectionKeys.list(),
    queryFn: () => api.get<CollectionCardData[]>('/user/collections'),
  })
}

export function useCollection(slug: string) {
  return useQuery({
    queryKey: collectionKeys.detail(slug),
    queryFn: () => api.get<CollectionDetail>(`/collections/${slug}`),
    enabled: !!slug,
  })
}

export function useClipCollections(clipId: string) {
  return useQuery({
    queryKey: collectionKeys.clipCollections(clipId),
    queryFn: () => api.get<string[]>(`/clips/${clipId}/collections`),
    enabled: !!clipId,
  })
}

export function useCreateCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; description?: string; isPublic: boolean }) =>
      api.post<CollectionCardData>('/user/collections', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
    },
  })
}

export function useUpdateCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { name?: string; description?: string; isPublic?: boolean }
    }) => api.patch(`/user/collections/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all })
    },
  })
}

export function useDeleteCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(`/user/collections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() })
    },
  })
}

export function useAddToCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ collectionId, clipId }: { collectionId: string; clipId: string }) =>
      api.post(`/user/collections/${collectionId}/clips`, { clipId }),
    onSuccess: (_, { clipId }) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all })
      queryClient.invalidateQueries({ queryKey: collectionKeys.clipCollections(clipId) })
    },
  })
}

export function useRemoveFromCollection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ collectionId, clipId }: { collectionId: string; clipId: string }) =>
      api.delete(`/user/collections/${collectionId}/clips/${clipId}`),
    onSuccess: (_, { clipId }) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all })
      queryClient.invalidateQueries({ queryKey: collectionKeys.clipCollections(clipId) })
    },
  })
}
