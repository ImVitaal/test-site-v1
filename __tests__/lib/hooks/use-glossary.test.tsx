import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tantml:query'
import type { ReactNode } from 'react'
import {
  useGlossaryTerms,
  useGlossaryIndex,
  useGlossaryTerm,
  usePrefetchGlossaryTerm,
  glossaryKeys,
} from '@/lib/hooks/use-glossary'
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

const mockGlossaryListResponse = {
  success: true,
  data: [
    {
      id: '1',
      slug: 'full-limited-animation',
      term: 'Full Limited Animation',
      definition: 'A technique...',
      exampleClipId: 'clip-1',
      relatedTerms: ['impact-frames'],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ],
  pagination: {
    total: 1,
    limit: 50,
    offset: 0,
    hasMore: false,
  },
}

const mockGroupedResponse = {
  success: true,
  data: {
    F: [
      {
        id: '1',
        slug: 'full-limited-animation',
        term: 'Full Limited Animation',
        definition: 'A technique...',
        exampleClipId: 'clip-1',
        relatedTerms: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ],
  },
}

const mockDetailResponse = {
  success: true,
  data: {
    id: '1',
    slug: 'full-limited-animation',
    term: 'Full Limited Animation',
    definition: 'A detailed technique explanation...',
    exampleClipId: 'clip-1',
    relatedTerms: ['impact-frames'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    exampleClip: {
      id: 'clip-1',
      slug: 'example-clip',
      title: 'Example Clip',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      duration: 30,
    },
    relatedTermsData: [],
  },
}

describe('glossaryKeys', () => {
  it('should generate correct query keys', () => {
    expect(glossaryKeys.all).toEqual(['glossary'])
    expect(glossaryKeys.lists()).toEqual(['glossary', 'list'])
    expect(glossaryKeys.list({ q: 'test' })).toEqual(['glossary', 'list', { q: 'test' }])
    expect(glossaryKeys.grouped()).toEqual(['glossary', 'grouped'])
    expect(glossaryKeys.details()).toEqual(['glossary', 'detail'])
    expect(glossaryKeys.detail('term-slug')).toEqual(['glossary', 'detail', 'term-slug'])
  })
})

describe('useGlossaryTerms', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch glossary terms', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockGlossaryListResponse)

    const { result } = renderHook(() => useGlossaryTerms(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockGlossaryListResponse)
    expect(apiClient.api.get).toHaveBeenCalled()
  })

  it('should use search query param', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockGlossaryListResponse)

    const { result } = renderHook(() => useGlossaryTerms({ q: 'animation' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiClient.api.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ q: 'animation' })
    )
  })

  it('should use letter filter param', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockGlossaryListResponse)

    const { result } = renderHook(() => useGlossaryTerms({ letter: 'F' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiClient.api.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ letter: 'F' })
    )
  })

  it('should use pagination params', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockGlossaryListResponse)

    const { result } = renderHook(() => useGlossaryTerms({ limit: 20, offset: 10 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(apiClient.api.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ limit: 20, offset: 10 })
    )
  })

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch glossary')
    vi.mocked(apiClient.api.get).mockRejectedValue(error)

    const { result } = renderHook(() => useGlossaryTerms(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })
})

describe('useGlossaryIndex', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch grouped glossary terms', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockGroupedResponse)

    const { result } = renderHook(() => useGlossaryIndex(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockGroupedResponse.data)
    expect(apiClient.api.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ grouped: 'true' })
    )
  })

  it('should select only data object', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockGroupedResponse)

    const { result } = renderHook(() => useGlossaryIndex(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should return only the data object, not the full response
    expect(result.current.data).toEqual(mockGroupedResponse.data)
    expect(result.current.data).not.toHaveProperty('success')
  })

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch glossary index')
    vi.mocked(apiClient.api.get).mockRejectedValue(error)

    const { result } = renderHook(() => useGlossaryIndex(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })
})

describe('useGlossaryTerm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch single glossary term', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockDetailResponse)

    const { result } = renderHook(() => useGlossaryTerm('full-limited-animation'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockDetailResponse.data)
    expect(apiClient.api.get).toHaveBeenCalled()
  })

  it('should not fetch when slug is undefined', () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockDetailResponse)

    const { result } = renderHook(() => useGlossaryTerm(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
    expect(apiClient.api.get).not.toHaveBeenCalled()
  })

  it('should select only data object', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockDetailResponse)

    const { result } = renderHook(() => useGlossaryTerm('term-slug'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Should return only the data object, not the full response
    expect(result.current.data).toEqual(mockDetailResponse.data)
    expect(result.current.data).not.toHaveProperty('success')
  })

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch term')
    vi.mocked(apiClient.api.get).mockRejectedValue(error)

    const { result } = renderHook(() => useGlossaryTerm('term-slug'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toEqual(error)
  })
})

describe('usePrefetchGlossaryTerm', () => {
  it('should return prefetch configuration', () => {
    const { result } = renderHook(() => usePrefetchGlossaryTerm())

    const prefetchConfig = result.current.prefetch('term-slug')

    expect(prefetchConfig).toHaveProperty('queryKey')
    expect(prefetchConfig).toHaveProperty('queryFn')
    expect(prefetchConfig.queryKey).toEqual(['glossary', 'detail', 'term-slug'])
  })

  it('should have correct query function', async () => {
    vi.mocked(apiClient.api.get).mockResolvedValue(mockDetailResponse)

    const { result } = renderHook(() => usePrefetchGlossaryTerm())

    const prefetchConfig = result.current.prefetch('term-slug')
    const data = await prefetchConfig.queryFn()

    expect(data).toEqual(mockDetailResponse)
    expect(apiClient.api.get).toHaveBeenCalled()
  })
})
