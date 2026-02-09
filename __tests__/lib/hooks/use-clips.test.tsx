import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
  clipKeys,
  useClips,
  useClipsInfinite,
  useClip,
  useRelatedClips,
  useClipFavoriteStatus,
} from '@/lib/hooks/use-clips'
import * as apiModule from '@/lib/api'
import type { ClipCard, ClipWithRelations } from '@/types/clip'
import type { ClipSearchParams } from '@/types/api'

// Mock the API module
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
  API_ENDPOINTS: {
    clips: {
      list: '/clips',
      detail: (slug: string) => `/clips/${slug}`,
      related: (slug: string) => `/clips/${slug}/related`,
      favorite: (slug: string) => `/clips/${slug}/favorite`,
    },
  },
}))

const mockClipCard: ClipCard = {
  id: 'clip-1',
  slug: 'test-clip',
  title: 'Test Clip',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  duration: 120,
  viewCount: 1000,
  favoriteCount: 50,
  anime: {
    title: 'Test Anime',
    slug: 'test-anime',
  },
  primaryAnimator: {
    name: 'Test Animator',
    slug: 'test-animator',
  },
  verificationStatus: 'VERIFIED',
}

const mockClipWithRelations: ClipWithRelations = {
  id: 'clip-1',
  slug: 'test-clip',
  title: 'Test Clip',
  animeId: 'anime-1',
  episodeNumber: 12,
  timestampStart: '00:10:30',
  timestampEnd: '00:12:30',
  duration: 120,
  videoUrl: 'https://example.com/video.mp4',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  techniqueDescription: 'Amazing animation technique',
  viewCount: 1000,
  favoriteCount: 50,
  submittedById: 'user-1',
  submissionStatus: 'APPROVED',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  anime: {
    id: 'anime-1',
    slug: 'test-anime',
    title: 'Test Anime',
    nativeTitle: 'テストアニメ',
    description: 'Test anime description',
    releaseYear: 2024,
    coverImageUrl: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  attributions: [
    {
      id: 'attr-1',
      clipId: 'clip-1',
      animatorId: 'animator-1',
      role: 'Key Animation',
      verificationStatus: 'VERIFIED',
      sourceUrl: 'https://example.com/source',
      sourceNote: 'Source note',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      animator: {
        id: 'animator-1',
        slug: 'test-animator',
        name: 'Test Animator',
        nativeName: 'テストアニメーター',
        photoUrl: 'https://example.com/photo.jpg',
      },
    },
  ],
  tags: [
    {
      tag: {
        id: 'tag-1',
        slug: 'test-tag',
        name: 'Test Tag',
        description: 'Test tag description',
        category: 'TECHNIQUE',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    },
  ],
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return Wrapper
}

describe('clipKeys', () => {
  it('should generate all clips key', () => {
    expect(clipKeys.all).toEqual(['clips'])
  })

  it('should generate lists key', () => {
    expect(clipKeys.lists()).toEqual(['clips', 'list'])
  })

  it('should generate list key with params', () => {
    const params: ClipSearchParams = { page: 1, limit: 20 }
    expect(clipKeys.list(params)).toEqual(['clips', 'list', params])
  })

  it('should generate list key with empty params', () => {
    expect(clipKeys.list({})).toEqual(['clips', 'list', {}])
  })

  it('should generate details key', () => {
    expect(clipKeys.details()).toEqual(['clips', 'detail'])
  })

  it('should generate detail key with slug', () => {
    expect(clipKeys.detail('test-clip')).toEqual(['clips', 'detail', 'test-clip'])
  })

  it('should generate related key', () => {
    expect(clipKeys.related('test-clip')).toEqual([
      'clips',
      'detail',
      'test-clip',
      'related',
    ])
  })

  it('should generate favorite key', () => {
    expect(clipKeys.favorite('test-clip')).toEqual([
      'clips',
      'detail',
      'test-clip',
      'favorite',
    ])
  })

  it('should generate unique keys for different params', () => {
    const params1: ClipSearchParams = { page: 1, limit: 20 }
    const params2: ClipSearchParams = { page: 2, limit: 20 }
    const key1 = clipKeys.list(params1)
    const key2 = clipKeys.list(params2)

    expect(key1).not.toEqual(key2)
  })
})

describe('useClips', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch clips without params', async () => {
    const mockResponse = {
      success: true,
      data: [mockClipCard],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useClips(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/clips', {})
    expect(result.current.data).toEqual(mockResponse)
  })

  it('should fetch clips with params', async () => {
    const params: ClipSearchParams = { page: 2, limit: 10, sortBy: 'viewCount' }
    const mockResponse = {
      success: true,
      data: [mockClipCard],
      pagination: {
        page: 2,
        limit: 10,
        total: 50,
        totalPages: 5,
        hasNext: true,
        hasPrev: true,
      },
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useClips(params), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/clips', params)
    expect(result.current.data).toEqual(mockResponse)
  })

  it('should handle filter params', async () => {
    const params: ClipSearchParams = {
      animatorId: 'animator-1',
      animeId: 'anime-1',
      verificationStatus: 'VERIFIED',
    }
    const mockResponse = {
      success: true,
      data: [mockClipCard],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useClips(params), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/clips', params)
  })

  it('should use correct query key', async () => {
    const params: ClipSearchParams = { page: 1, limit: 20 }
    const mockResponse = {
      success: true,
      data: [mockClipCard],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useClips(params), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockResponse)
  })

  it('should handle API errors', async () => {
    const error = new Error('API Error')
    vi.spyOn(apiModule.api, 'get').mockRejectedValueOnce(error)

    const { result } = renderHook(() => useClips(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })
})

describe('useClipsInfinite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch first page of clips', async () => {
    const mockResponse = {
      success: true,
      data: [mockClipCard],
      pagination: {
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      },
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useClipsInfinite(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/clips', { page: 1 })
    expect(result.current.data?.pages[0]).toEqual(mockResponse)
  })

  it('should fetch with filter params', async () => {
    const params = { animatorId: 'animator-1' }
    const mockResponse = {
      success: true,
      data: [mockClipCard],
      pagination: {
        page: 1,
        limit: 20,
        total: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useClipsInfinite(params), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/clips', {
      ...params,
      page: 1,
    })
  })

  it('should calculate next page param correctly when hasNext is true', async () => {
    const mockResponse = {
      success: true,
      data: [mockClipCard],
      pagination: {
        page: 1,
        limit: 20,
        total: 50,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      },
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useClipsInfinite(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.hasNextPage).toBe(true)
  })

  it('should return undefined for next page when hasNext is false', async () => {
    const mockResponse = {
      success: true,
      data: [mockClipCard],
      pagination: {
        page: 1,
        limit: 20,
        total: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useClipsInfinite(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.hasNextPage).toBe(false)
  })

  it('should handle API errors', async () => {
    const error = new Error('API Error')
    vi.spyOn(apiModule.api, 'get').mockRejectedValueOnce(error)

    const { result } = renderHook(() => useClipsInfinite(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })
})

describe('useClip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch clip by slug', async () => {
    const mockResponse = {
      success: true,
      data: mockClipWithRelations,
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useClip('test-clip'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/clips/test-clip')
    expect(result.current.data).toEqual(mockClipWithRelations)
  })

  it('should not fetch when slug is undefined', async () => {
    const { result } = renderHook(() => useClip(undefined), {
      wrapper: createWrapper(),
    })

    expect(apiModule.api.get).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
    expect(result.current.status).toBe('pending')
  })

  it('should handle API errors', async () => {
    const error = new Error('Clip not found')
    vi.spyOn(apiModule.api, 'get').mockRejectedValueOnce(error)

    const { result } = renderHook(() => useClip('non-existent-clip'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })

  it('should use select to extract data field', async () => {
    const mockResponse = {
      success: true,
      data: mockClipWithRelations,
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useClip('test-clip'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should return only the data field, not the whole response
    expect(result.current.data).toEqual(mockClipWithRelations)
    expect(result.current.data).not.toHaveProperty('success')
  })
})

describe('useRelatedClips', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch related clips', async () => {
    const mockResponse = {
      success: true,
      data: [mockClipCard],
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useRelatedClips('test-clip'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/clips/test-clip/related')
    expect(result.current.data).toEqual([mockClipCard])
  })

  it('should not fetch when slug is undefined', async () => {
    const { result } = renderHook(() => useRelatedClips(undefined), {
      wrapper: createWrapper(),
    })

    expect(apiModule.api.get).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
    expect(result.current.status).toBe('pending')
  })

  it('should handle empty related clips', async () => {
    const mockResponse = {
      success: true,
      data: [],
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useRelatedClips('test-clip'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('should handle API errors', async () => {
    const error = new Error('Failed to fetch related clips')
    vi.spyOn(apiModule.api, 'get').mockRejectedValueOnce(error)

    const { result } = renderHook(() => useRelatedClips('test-clip'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })

  it('should use select to extract data field', async () => {
    const mockResponse = {
      success: true,
      data: [mockClipCard],
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useRelatedClips('test-clip'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should return only the data field, not the whole response
    expect(result.current.data).toEqual([mockClipCard])
    expect(result.current.data).not.toHaveProperty('success')
  })
})

describe('useClipFavoriteStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch favorite status as true', async () => {
    const mockResponse = {
      success: true,
      data: { favorited: true },
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useClipFavoriteStatus('test-clip'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/clips/test-clip/favorite')
    expect(result.current.data).toBe(true)
  })

  it('should fetch favorite status as false', async () => {
    const mockResponse = {
      success: true,
      data: { favorited: false },
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useClipFavoriteStatus('test-clip'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBe(false)
  })

  it('should not fetch when slug is undefined', async () => {
    const { result } = renderHook(() => useClipFavoriteStatus(undefined), {
      wrapper: createWrapper(),
    })

    expect(apiModule.api.get).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
    expect(result.current.status).toBe('pending')
  })

  it('should handle API errors', async () => {
    const error = new Error('Failed to fetch favorite status')
    vi.spyOn(apiModule.api, 'get').mockRejectedValueOnce(error)

    const { result } = renderHook(() => useClipFavoriteStatus('test-clip'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })

  it('should use select to extract favorited boolean', async () => {
    const mockResponse = {
      success: true,
      data: { favorited: true },
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useClipFavoriteStatus('test-clip'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should return only the boolean value, not the whole response
    expect(result.current.data).toBe(true)
    expect(typeof result.current.data).toBe('boolean')
  })
})
