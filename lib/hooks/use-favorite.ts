import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, API_ENDPOINTS } from '@/lib/api'
import { clipKeys } from './use-clips'

interface FavoriteResponse {
  success: true
  data: { favorited: boolean }
}

export function useFavoriteClip(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      api.post<FavoriteResponse>(API_ENDPOINTS.clips.favorite(slug)),

    // Optimistic update
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: clipKeys.favorite(slug) })

      // Snapshot previous value
      const previousFavorited = queryClient.getQueryData<boolean>(
        clipKeys.favorite(slug)
      )

      // Optimistically update
      queryClient.setQueryData(clipKeys.favorite(slug), !previousFavorited)

      return { previousFavorited }
    },

    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousFavorited !== undefined) {
        queryClient.setQueryData(clipKeys.favorite(slug), context.previousFavorited)
      }
    },

    onSuccess: (data) => {
      // Update with actual server value
      queryClient.setQueryData(clipKeys.favorite(slug), data.data.favorited)
    },

    onSettled: () => {
      // Invalidate clip detail to refresh favorite count
      queryClient.invalidateQueries({ queryKey: clipKeys.detail(slug) })
    },
  })
}
