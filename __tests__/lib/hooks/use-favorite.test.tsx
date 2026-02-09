import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useFavoriteClip } from '@/lib/hooks/use-favorite'
import { clipKeys } from '@/lib/hooks/use-clips'

// Test wrapper component
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useFavoriteClip', () => {
  const testSlug = 'test-clip-slug'

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should successfully favorite a clip', async () => {
    const mockResponse = {
      success: true,
      data: { favorited: true },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useFavoriteClip(testSlug), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(global.fetch).toHaveBeenCalledWith(
      `/api/clips/${testSlug}/favorite`,
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    )
    expect(result.current.data?.data.favorited).toBe(true)
  })

  it('should successfully unfavorite a clip', async () => {
    const mockResponse = {
      success: true,
      data: { favorited: false },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useFavoriteClip(testSlug), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.data.favorited).toBe(false)
  })

  it('should handle mutation error', async () => {
    const errorResponse = {
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => errorResponse,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useFavoriteClip(testSlug), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
    expect(result.current.error?.message).toBe('Authentication required')
  })

  it('should perform optimistic update when favoriting', async () => {
    const mockResponse = {
      success: true,
      data: { favorited: true },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Set initial favorited state to false
    queryClient.setQueryData(clipKeys.favorite(testSlug), false)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useFavoriteClip(testSlug), { wrapper })

    // Verify initial state
    expect(queryClient.getQueryData(clipKeys.favorite(testSlug))).toBe(false)

    // Trigger mutation
    result.current.mutate()

    // Optimistic update should toggle immediately
    await waitFor(() => {
      const favoriteState = queryClient.getQueryData(clipKeys.favorite(testSlug))
      expect(favoriteState).toBe(true)
    })

    // Wait for mutation to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Final state should match server response
    expect(queryClient.getQueryData(clipKeys.favorite(testSlug))).toBe(true)
  })

  it('should perform optimistic update when unfavoriting', async () => {
    const mockResponse = {
      success: true,
      data: { favorited: false },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Set initial favorited state to true
    queryClient.setQueryData(clipKeys.favorite(testSlug), true)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useFavoriteClip(testSlug), { wrapper })

    // Verify initial state
    expect(queryClient.getQueryData(clipKeys.favorite(testSlug))).toBe(true)

    // Trigger mutation
    result.current.mutate()

    // Optimistic update should toggle immediately
    await waitFor(() => {
      const favoriteState = queryClient.getQueryData(clipKeys.favorite(testSlug))
      expect(favoriteState).toBe(false)
    })

    // Wait for mutation to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Final state should match server response
    expect(queryClient.getQueryData(clipKeys.favorite(testSlug))).toBe(false)
  })

  it('should rollback optimistic update on error', async () => {
    const errorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Server error',
      },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => errorResponse,
    })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Set initial favorited state to false
    const initialState = false
    queryClient.setQueryData(clipKeys.favorite(testSlug), initialState)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useFavoriteClip(testSlug), { wrapper })

    // Trigger mutation
    result.current.mutate()

    // Wait for mutation to fail
    await waitFor(() => expect(result.current.isError).toBe(true))

    // State should be rolled back to original
    expect(queryClient.getQueryData(clipKeys.favorite(testSlug))).toBe(initialState)
  })

  it('should invalidate clip detail query after successful mutation', async () => {
    const mockResponse = {
      success: true,
      data: { favorited: true },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Set up clip detail data
    queryClient.setQueryData(clipKeys.detail(testSlug), {
      id: '1',
      slug: testSlug,
      favoriteCount: 10,
    })

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useFavoriteClip(testSlug), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verify invalidateQueries was called with clip detail key
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: clipKeys.detail(testSlug),
    })
  })

  it('should handle missing previous favorite state in optimistic update', async () => {
    const mockResponse = {
      success: true,
      data: { favorited: true },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Don't set any initial state - simulate first time favoriting

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useFavoriteClip(testSlug), { wrapper })

    // Verify no initial state
    expect(queryClient.getQueryData(clipKeys.favorite(testSlug))).toBeUndefined()

    // Trigger mutation
    result.current.mutate()

    // Wait for mutation to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Final state should be set from server response
    expect(queryClient.getQueryData(clipKeys.favorite(testSlug))).toBe(true)
  })

  it('should handle network errors', async () => {
    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

    const wrapper = createWrapper()
    const { result } = renderHook(() => useFavoriteClip(testSlug), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
    expect(result.current.error?.message).toBe('Network error')
  })

  it('should handle multiple rapid mutations', async () => {
    const mockResponse1 = {
      success: true,
      data: { favorited: true },
    }
    const mockResponse2 = {
      success: true,
      data: { favorited: false },
    }
    ;(global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse2,
      })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    queryClient.setQueryData(clipKeys.favorite(testSlug), false)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useFavoriteClip(testSlug), { wrapper })

    // First mutation - favorite
    result.current.mutate()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Second mutation - unfavorite
    result.current.mutate()
    await waitFor(() => {
      // The mutation should complete twice
      return result.current.data?.data.favorited === false
    })

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('should update favorite state with server response value', async () => {
    const mockResponse = {
      success: true,
      data: { favorited: true },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useFavoriteClip(testSlug), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verify the query data was updated with server response
    const favoriteState = queryClient.getQueryData(clipKeys.favorite(testSlug))
    expect(favoriteState).toBe(true)
  })

  it('should handle 404 not found error', async () => {
    const errorResponse = {
      error: {
        code: 'NOT_FOUND',
        message: 'Clip not found',
      },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => errorResponse,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useFavoriteClip(testSlug), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
    if (result.current.error) {
      expect(result.current.error.message).toBe('Clip not found')
    }
  })

  it('should handle 403 forbidden error', async () => {
    const errorResponse = {
      error: {
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => errorResponse,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useFavoriteClip(testSlug), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
    if (result.current.error) {
      expect(result.current.error.message).toBe('Insufficient permissions')
    }
  })

  it('should preserve error details in ApiClientError', async () => {
    const errorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request',
        details: { field: 'clipId', reason: 'invalid format' },
      },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => errorResponse,
    })

    const wrapper = createWrapper()
    const { result } = renderHook(() => useFavoriteClip(testSlug), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
    if (result.current.error) {
      expect(result.current.error.message).toBe('Invalid request')
      expect(result.current.error.details).toEqual({
        field: 'clipId',
        reason: 'invalid format',
      })
    }
  })

  it('should cancel outgoing queries before optimistic update', async () => {
    const mockResponse = {
      success: true,
      data: { favorited: true },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    const cancelQueriesSpy = vi.spyOn(queryClient, 'cancelQueries')

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useFavoriteClip(testSlug), { wrapper })

    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Verify cancelQueries was called with favorite key
    expect(cancelQueriesSpy).toHaveBeenCalledWith({
      queryKey: clipKeys.favorite(testSlug),
    })
  })
})
