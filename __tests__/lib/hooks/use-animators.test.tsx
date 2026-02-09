import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import {
  animatorKeys,
  useAnimators,
  useAnimatorsInfinite,
  useAnimator,
  useAnimatorTimeline,
  useAnimatorClips,
} from '@/lib/hooks/use-animators'
import * as apiModule from '@/lib/api'
import type {
  AnimatorCard,
  AnimatorWithRelations,
  AnimatorTimelineEntry,
} from '@/types/animator'
import type { ClipCard } from '@/types/clip'
import type { AnimatorSearchParams } from '@/types/api'

// Mock the API module
vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
  },
  API_ENDPOINTS: {
    animators: {
      list: '/animators',
      detail: (slug: string) => `/animators/${slug}`,
      clips: (slug: string) => `/animators/${slug}/clips`,
      timeline: (slug: string) => `/animators/${slug}/timeline`,
    },
  },
}))

const mockAnimatorCard: AnimatorCard = {
  id: 'animator-1',
  slug: 'test-animator',
  name: 'Test Animator',
  nativeName: 'テストアニメーター',
  photoUrl: 'https://example.com/photo.jpg',
  clipCount: 42,
  activeYears: '2010-2024',
}

const mockAnimatorWithRelations: AnimatorWithRelations = {
  id: 'animator-1',
  slug: 'test-animator',
  name: 'Test Animator',
  nativeName: 'テストアニメーター',
  photoUrl: 'https://example.com/photo.jpg',
  bio: 'A talented key animator',
  birthYear: 1985,
  deathYear: null,
  nationality: 'JP',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  attributions: [
    {
      clip: {
        id: 'clip-1',
        slug: 'test-clip',
        title: 'Test Clip',
        thumbnailUrl: 'https://example.com/thumb.jpg',
      },
    },
  ],
  studioHistory: [],
  mentors: [],
  students: [],
}

const mockTimelineEntry: AnimatorTimelineEntry = {
  year: 2024,
  works: [
    {
      animeTitle: 'Test Anime',
      animeSlug: 'test-anime',
      role: 'Key Animation',
      clipCount: 5,
    },
  ],
}

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

describe('animatorKeys', () => {
  it('should generate all animators key', () => {
    expect(animatorKeys.all).toEqual(['animators'])
  })

  it('should generate lists key', () => {
    expect(animatorKeys.lists()).toEqual(['animators', 'list'])
  })

  it('should generate list key with params', () => {
    const params: AnimatorSearchParams = { page: 1, limit: 20 }
    expect(animatorKeys.list(params)).toEqual(['animators', 'list', params])
  })

  it('should generate list key with empty params', () => {
    expect(animatorKeys.list({})).toEqual(['animators', 'list', {}])
  })

  it('should generate details key', () => {
    expect(animatorKeys.details()).toEqual(['animators', 'detail'])
  })

  it('should generate detail key with slug', () => {
    expect(animatorKeys.detail('test-animator')).toEqual([
      'animators',
      'detail',
      'test-animator',
    ])
  })

  it('should generate timeline key', () => {
    expect(animatorKeys.timeline('test-animator')).toEqual([
      'animators',
      'detail',
      'test-animator',
      'timeline',
    ])
  })

  it('should generate clips key', () => {
    expect(animatorKeys.clips('test-animator')).toEqual([
      'animators',
      'detail',
      'test-animator',
      'clips',
      undefined,
    ])
  })

  it('should generate clips key with params', () => {
    const params: AnimatorSearchParams = { page: 2, limit: 10 }
    expect(animatorKeys.clips('test-animator', params)).toEqual([
      'animators',
      'detail',
      'test-animator',
      'clips',
      params,
    ])
  })

  it('should generate unique keys for different params', () => {
    const params1: AnimatorSearchParams = { page: 1, limit: 20 }
    const params2: AnimatorSearchParams = { page: 2, limit: 20 }
    const key1 = animatorKeys.list(params1)
    const key2 = animatorKeys.list(params2)

    expect(key1).not.toEqual(key2)
  })
})

describe('useAnimators', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch animators without params', async () => {
    const mockResponse = {
      success: true,
      data: [mockAnimatorCard],
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

    const { result } = renderHook(() => useAnimators(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/animators', {})
    expect(result.current.data).toEqual(mockResponse)
  })

  it('should fetch animators with params', async () => {
    const params: AnimatorSearchParams = { page: 2, limit: 10, sortBy: 'name' }
    const mockResponse = {
      success: true,
      data: [mockAnimatorCard],
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

    const { result } = renderHook(() => useAnimators(params), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/animators', params)
    expect(result.current.data).toEqual(mockResponse)
  })

  it('should handle filter params', async () => {
    const params: AnimatorSearchParams = {
      query: 'test',
      nationality: 'JP',
    }
    const mockResponse = {
      success: true,
      data: [mockAnimatorCard],
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

    const { result } = renderHook(() => useAnimators(params), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/animators', params)
  })

  it('should use correct query key', async () => {
    const params: AnimatorSearchParams = { page: 1, limit: 20 }
    const mockResponse = {
      success: true,
      data: [mockAnimatorCard],
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

    const { result } = renderHook(() => useAnimators(params), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockResponse)
  })

  it('should handle API errors', async () => {
    const error = new Error('API Error')
    vi.spyOn(apiModule.api, 'get').mockRejectedValueOnce(error)

    const { result } = renderHook(() => useAnimators(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })
})

describe('useAnimatorsInfinite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch first page of animators', async () => {
    const mockResponse = {
      success: true,
      data: [mockAnimatorCard],
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

    const { result } = renderHook(() => useAnimatorsInfinite(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/animators', { page: 1 })
    expect(result.current.data?.pages[0]).toEqual(mockResponse)
  })

  it('should fetch with filter params', async () => {
    const params = { query: 'test' }
    const mockResponse = {
      success: true,
      data: [mockAnimatorCard],
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

    const { result } = renderHook(() => useAnimatorsInfinite(params), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/animators', {
      ...params,
      page: 1,
    })
  })

  it('should calculate next page param correctly when hasNext is true', async () => {
    const mockResponse = {
      success: true,
      data: [mockAnimatorCard],
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

    const { result } = renderHook(() => useAnimatorsInfinite(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.hasNextPage).toBe(true)
  })

  it('should return undefined for next page when hasNext is false', async () => {
    const mockResponse = {
      success: true,
      data: [mockAnimatorCard],
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

    const { result } = renderHook(() => useAnimatorsInfinite(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.hasNextPage).toBe(false)
  })

  it('should handle API errors', async () => {
    const error = new Error('API Error')
    vi.spyOn(apiModule.api, 'get').mockRejectedValueOnce(error)

    const { result } = renderHook(() => useAnimatorsInfinite(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })
})

describe('useAnimator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch animator by slug', async () => {
    const mockResponse = {
      success: true,
      data: mockAnimatorWithRelations,
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useAnimator('test-animator'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/animators/test-animator')
    expect(result.current.data).toEqual(mockAnimatorWithRelations)
  })

  it('should not fetch when slug is undefined', async () => {
    const { result } = renderHook(() => useAnimator(undefined), {
      wrapper: createWrapper(),
    })

    expect(apiModule.api.get).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
    expect(result.current.status).toBe('pending')
  })

  it('should handle API errors', async () => {
    const error = new Error('Animator not found')
    vi.spyOn(apiModule.api, 'get').mockRejectedValueOnce(error)

    const { result } = renderHook(() => useAnimator('non-existent-animator'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })

  it('should use select to extract data field', async () => {
    const mockResponse = {
      success: true,
      data: mockAnimatorWithRelations,
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useAnimator('test-animator'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should return only the data field, not the whole response
    expect(result.current.data).toEqual(mockAnimatorWithRelations)
    expect(result.current.data).not.toHaveProperty('success')
  })
})

describe('useAnimatorTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch animator timeline', async () => {
    const mockResponse = {
      success: true,
      data: [mockTimelineEntry],
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useAnimatorTimeline('test-animator'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/animators/test-animator/timeline')
    expect(result.current.data).toEqual([mockTimelineEntry])
  })

  it('should not fetch when slug is undefined', async () => {
    const { result } = renderHook(() => useAnimatorTimeline(undefined), {
      wrapper: createWrapper(),
    })

    expect(apiModule.api.get).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
    expect(result.current.status).toBe('pending')
  })

  it('should handle empty timeline', async () => {
    const mockResponse = {
      success: true,
      data: [],
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useAnimatorTimeline('test-animator'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('should handle API errors', async () => {
    const error = new Error('Failed to fetch timeline')
    vi.spyOn(apiModule.api, 'get').mockRejectedValueOnce(error)

    const { result } = renderHook(() => useAnimatorTimeline('test-animator'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })

  it('should use select to extract data field', async () => {
    const mockResponse = {
      success: true,
      data: [mockTimelineEntry],
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useAnimatorTimeline('test-animator'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should return only the data field, not the whole response
    expect(result.current.data).toEqual([mockTimelineEntry])
    expect(result.current.data).not.toHaveProperty('success')
  })
})

describe('useAnimatorClips', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch animator clips without params', async () => {
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

    const { result } = renderHook(() => useAnimatorClips('test-animator'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/animators/test-animator/clips', {})
    expect(result.current.data).toEqual(mockResponse)
  })

  it('should fetch animator clips with params', async () => {
    const params: AnimatorSearchParams = { page: 2, limit: 10 }
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

    const { result } = renderHook(() => useAnimatorClips('test-animator', params), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiModule.api.get).toHaveBeenCalledWith('/animators/test-animator/clips', params)
    expect(result.current.data).toEqual(mockResponse)
  })

  it('should not fetch when slug is undefined', async () => {
    const { result } = renderHook(() => useAnimatorClips(undefined), {
      wrapper: createWrapper(),
    })

    expect(apiModule.api.get).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()
    expect(result.current.status).toBe('pending')
  })

  it('should handle empty clips', async () => {
    const mockResponse = {
      success: true,
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    }

    vi.spyOn(apiModule.api, 'get').mockResolvedValueOnce(mockResponse)

    const { result } = renderHook(() => useAnimatorClips('test-animator'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockResponse)
  })

  it('should handle API errors', async () => {
    const error = new Error('Failed to fetch animator clips')
    vi.spyOn(apiModule.api, 'get').mockRejectedValueOnce(error)

    const { result } = renderHook(() => useAnimatorClips('test-animator'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })
})
