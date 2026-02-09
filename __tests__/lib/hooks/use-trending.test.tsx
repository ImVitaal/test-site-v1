import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import {
  useTrending,
  useHomepageTrending,
  useTrendingInfinite,
  trendingKeys,
} from '@/lib/hooks/use-trending'
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

const mockTrendingResponse = {
  success: true,
  data: [
    {
      id: '1',
      slug: 'clip-1',
      title: 'Trending Clip 1',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      duration: 45,
      viewCount: 1000,
      favoriteCount: 50,
      createdAt: '2024-01-01',
      anime: { title: 'Anime 1', slug: 'anime-1' },
      primaryAnimator: { name: 'Animator 1', slug: 'animator-1' },
      verificationStatus: 'VERIFIED' as const,
      trendingScore: 95.5,
    },
  ],
  pagination: {
    total: 10,
    limit: 12,
    offset: 0,
    hasMore: true,
  },
}

describe('trendingKeys', () => {
  it('should generate correct query keys', () => {
    expect(trendingKeys.all).toEqual(['trending'])
    expect(trendingKeys.lists()).toEqual(['trending', 'list'])
    expect(trendingKeys.list({ limit: 10 })).toEqual(['trending', 'list', { limit: 10 }])
    expect(trendingKeys.homepage()).toEqual(['trending', 'homepage'])
  })
})

describe('useTrending', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch trending clips', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockTrendingResponse)

    const { result } = renderHook(() => useTrending(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockTrendingResponse)
    expect(apiClient.api.get).toHaveBeenCalled()
  })

  it('should use custom params', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockTrendingResponse)

    const params = { limit: 20, offset: 10, windowDays: 7 }
    const { result } = renderHook(() => useTrending(params), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiClient.api.get).toHaveBeenCalledWith(expect.any(String), params)
  })

  it('should handle loading state', () => {
    vi.mocked(apiClient.api.get).mockImplementation(
      () => new Promise(() => {})
    )

    const { result } = renderHook(() => useTrending(), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toBeUndefined()
  })

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch trending')
    vi.mocked(apiClient.api.get).mockRejectedValue(error)

    const { result } = renderHook(() => useTrending(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })
})

describe('useHomepageTrending', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch homepage trending clips with defaults', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockTrendingResponse)

    const { result } = renderHook(() => useHomepageTrending(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockTrendingResponse.data)
    expect(apiClient.api.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        limit: 6,
        windowDays: 14,
      })
    )
  })

  it('should use custom limit', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockTrendingResponse)

    const { result } = renderHook(() => useHomepageTrending(10), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiClient.api.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        limit: 10,
        windowDays: 14,
      })
    )
  })

  it('should select only data array', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockTrendingResponse)

    const { result } = renderHook(() => useHomepageTrending(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should return only the data array, not the full response
    expect(result.current.data).toEqual(mockTrendingResponse.data)
    expect(result.current.data).not.toHaveProperty('pagination')
  })

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch homepage trending')
    vi.mocked(apiClient.api.get).mockRejectedValue(error)

    const { result } = renderHook(() => useHomepageTrending(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })
})

describe('useTrendingInfinite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch first page of trending clips', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockTrendingResponse)

    const { result } = renderHook(() => useTrendingInfinite(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.pages).toHaveLength(1)
    expect(result.current.data?.pages[0]).toEqual(mockTrendingResponse)
  })

  it('should use custom params', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockTrendingResponse)

    const { result } = renderHook(() => useTrendingInfinite({ limit: 20, windowDays: 7 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiClient.api.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        limit: 20,
        windowDays: 7,
        offset: 0,
      })
    )
  })

  it('should use default limit of 12', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockTrendingResponse)

    const { result } = renderHook(() => useTrendingInfinite(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiClient.api.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        limit: 12,
        offset: 0,
      })
    )
  })

  it('should have next page when hasMore is true', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockTrendingResponse)

    const { result } = renderHook(() => useTrendingInfinite(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.hasNextPage).toBe(true)
  })

  it('should not have next page when hasMore is false', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue({
      ...mockTrendingResponse,
      pagination: { ...mockTrendingResponse.pagination, hasMore: false },
    })

    const { result } = renderHook(() => useTrendingInfinite(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.hasNextPage).toBe(false)
  })

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch infinite trending')
    vi.mocked(apiClient.api.get).mockRejectedValue(error)

    const { result } = renderHook(() => useTrendingInfinite(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })
})
