import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  useFavoriteClips,
  useFavoriteAnimators,
  favoriteKeys,
} from '@/lib/hooks/use-favorites'
import * as apiClient from '@/lib/api/client'

vi.mock('@/lib/api/client')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('favoriteKeys', () => {
  it('should generate correct query keys', () => {
    expect(favoriteKeys.all).toEqual(['favorites'])
    expect(favoriteKeys.clips()).toEqual(['favorites', 'clips'])
    expect(favoriteKeys.animators()).toEqual(['favorites', 'animators'])
  })
})

describe('useFavoriteClips', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch favorite clips', async () => {
    const mockClips = [
      { id: '1', title: 'Clip 1', slug: 'clip-1' },
      { id: '2', title: 'Clip 2', slug: 'clip-2' },
    ]

    vi.mocked(apiClient.api.get).mockResolvedValue(mockClips)

    const { result } = renderHook(() => useFavoriteClips(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockClips)
    expect(apiClient.api.get).toHaveBeenCalledWith('/user/favorites/clips')
  })

  it('should use correct query key', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue([])

    const { result } = renderHook(() => useFavoriteClips(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('should handle loading state', () => {
    vi.mocked(apiClient.api.get).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => useFavoriteClips(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch favorites')
    vi.mocked(apiClient.api.get).mockRejectedValue(error)

    const { result } = renderHook(() => useFavoriteClips(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
    expect(result.current.data).toBeUndefined()
  })

  it('should handle empty favorite clips', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue([])

    const { result } = renderHook(() => useFavoriteClips(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })
})

describe('useFavoriteAnimators', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch favorite animators', async () => {
    const mockAnimators = [
      { id: '1', name: 'Animator 1', slug: 'animator-1' },
      { id: '2', name: 'Animator 2', slug: 'animator-2' },
    ]

    vi.mocked(apiClient.api.get).mockResolvedValue(mockAnimators)

    const { result } = renderHook(() => useFavoriteAnimators(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockAnimators)
    expect(apiClient.api.get).toHaveBeenCalledWith('/user/favorites/animators')
  })

  it('should use correct query key', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue([])

    const { result } = renderHook(() => useFavoriteAnimators(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('should handle loading state', () => {
    vi.mocked(apiClient.api.get).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => useFavoriteAnimators(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch favorite animators')
    vi.mocked(apiClient.api.get).mockRejectedValue(error)

    const { result } = renderHook(() => useFavoriteAnimators(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
    expect(result.current.data).toBeUndefined()
  })

  it('should handle empty favorite animators', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue([])

    const { result } = renderHook(() => useFavoriteAnimators(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })
})
