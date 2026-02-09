import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/clips/[slug]/favorite/route'
import * as clipsQueries from '@/lib/db/queries/clips'
import * as authUtils from '@/lib/auth/utils'

// Mock the database queries
vi.mock('@/lib/db/queries/clips', () => ({
  getClipBySlug: vi.fn(),
  toggleFavorite: vi.fn(),
  isClipFavorited: vi.fn(),
}))

// Mock the auth utils
vi.mock('@/lib/auth/utils', () => ({
  getSession: vi.fn(),
}))

describe('POST /api/clips/[slug]/favorite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should toggle favorite for authenticated user', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
        email: 'test@example.com',
        name: 'Test User',
      },
    }

    const mockClip = {
      id: 'cklclip123456789abcdefghi',
      slug: 'test-clip',
      title: 'Test Clip',
      videoUrl: 'https://example.com/video.mp4',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      duration: 30,
      viewCount: 100,
      favoriteCount: 10,
    }

    const mockResult = {
      favorited: true,
      favoriteCount: 11,
    }

    vi.mocked(authUtils.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.getClipBySlug).mockResolvedValue(mockClip as any)
    vi.mocked(clipsQueries.toggleFavorite).mockResolvedValue(mockResult)

    const request = new NextRequest('http://localhost:3000/api/clips/test-clip/favorite', {
      method: 'POST',
    })

    const response = await POST(request, { params: { slug: 'test-clip' } })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data).toEqual(mockResult)
    expect(authUtils.getSession).toHaveBeenCalled()
    expect(clipsQueries.getClipBySlug).toHaveBeenCalledWith('test-clip')
    expect(clipsQueries.toggleFavorite).toHaveBeenCalledWith('ckluser123456789abcdefghi', 'cklclip123456789abcdefghi')
  })

  it('should toggle favorite from favorited to unfavorited', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
        email: 'test@example.com',
      },
    }

    const mockClip = {
      id: 'cklclip123456789abcdefghi',
      slug: 'test-clip',
    }

    const mockResult = {
      favorited: false,
      favoriteCount: 9,
    }

    vi.mocked(authUtils.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.getClipBySlug).mockResolvedValue(mockClip as any)
    vi.mocked(clipsQueries.toggleFavorite).mockResolvedValue(mockResult)

    const request = new NextRequest('http://localhost:3000/api/clips/test-clip/favorite', {
      method: 'POST',
    })

    const response = await POST(request, { params: { slug: 'test-clip' } })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data.favorited).toBe(false)
    expect(json.data.favoriteCount).toBe(9)
  })

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(authUtils.getSession).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/clips/test-clip/favorite', {
      method: 'POST',
    })

    const response = await POST(request, { params: { slug: 'test-clip' } })
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('UNAUTHORIZED')
    expect(json.error.message).toBe('You must be logged in to favorite clips')
    expect(clipsQueries.getClipBySlug).not.toHaveBeenCalled()
    expect(clipsQueries.toggleFavorite).not.toHaveBeenCalled()
  })

  it('should return 401 when session has no user', async () => {
    vi.mocked(authUtils.getSession).mockResolvedValue({} as any)

    const request = new NextRequest('http://localhost:3000/api/clips/test-clip/favorite', {
      method: 'POST',
    })

    const response = await POST(request, { params: { slug: 'test-clip' } })
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('UNAUTHORIZED')
    expect(clipsQueries.getClipBySlug).not.toHaveBeenCalled()
    expect(clipsQueries.toggleFavorite).not.toHaveBeenCalled()
  })

  it('should return 404 when clip is not found', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
        email: 'test@example.com',
      },
    }

    vi.mocked(authUtils.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.getClipBySlug).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/clips/nonexistent-clip/favorite', {
      method: 'POST',
    })

    const response = await POST(request, { params: { slug: 'nonexistent-clip' } })
    const json = await response.json()

    expect(response.status).toBe(404)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('NOT_FOUND')
    expect(json.error.message).toBe('Clip not found')
    expect(clipsQueries.toggleFavorite).not.toHaveBeenCalled()
  })

  it('should return 500 on database error', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
        email: 'test@example.com',
      },
    }

    vi.mocked(authUtils.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.getClipBySlug).mockRejectedValue(
      new Error('Database connection failed')
    )

    const request = new NextRequest('http://localhost:3000/api/clips/test-clip/favorite', {
      method: 'POST',
    })

    const response = await POST(request, { params: { slug: 'test-clip' } })
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('INTERNAL_ERROR')
    expect(json.error.message).toBe('An unexpected error occurred')
  })

  it('should return 500 when toggleFavorite fails', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
        email: 'test@example.com',
      },
    }

    const mockClip = {
      id: 'cklclip123456789abcdefghi',
      slug: 'test-clip',
    }

    vi.mocked(authUtils.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.getClipBySlug).mockResolvedValue(mockClip as any)
    vi.mocked(clipsQueries.toggleFavorite).mockRejectedValue(
      new Error('Failed to toggle favorite')
    )

    const request = new NextRequest('http://localhost:3000/api/clips/test-clip/favorite', {
      method: 'POST',
    })

    const response = await POST(request, { params: { slug: 'test-clip' } })
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('INTERNAL_ERROR')
  })
})

describe('GET /api/clips/[slug]/favorite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return favorited status for authenticated user who favorited the clip', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
        email: 'test@example.com',
        name: 'Test User',
      },
    }

    const mockClip = {
      id: 'cklclip123456789abcdefghi',
      slug: 'test-clip',
      title: 'Test Clip',
    }

    vi.mocked(authUtils.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.getClipBySlug).mockResolvedValue(mockClip as any)
    vi.mocked(clipsQueries.isClipFavorited).mockResolvedValue(true)

    const request = new NextRequest('http://localhost:3000/api/clips/test-clip/favorite')

    const response = await GET(request, { params: { slug: 'test-clip' } })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data.favorited).toBe(true)
    expect(authUtils.getSession).toHaveBeenCalled()
    expect(clipsQueries.getClipBySlug).toHaveBeenCalledWith('test-clip')
    expect(clipsQueries.isClipFavorited).toHaveBeenCalledWith('ckluser123456789abcdefghi', 'cklclip123456789abcdefghi')
  })

  it('should return favorited status for authenticated user who has not favorited the clip', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
        email: 'test@example.com',
      },
    }

    const mockClip = {
      id: 'cklclip123456789abcdefghi',
      slug: 'test-clip',
    }

    vi.mocked(authUtils.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.getClipBySlug).mockResolvedValue(mockClip as any)
    vi.mocked(clipsQueries.isClipFavorited).mockResolvedValue(false)

    const request = new NextRequest('http://localhost:3000/api/clips/test-clip/favorite')

    const response = await GET(request, { params: { slug: 'test-clip' } })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data.favorited).toBe(false)
  })

  it('should return favorited false for unauthenticated user', async () => {
    vi.mocked(authUtils.getSession).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/clips/test-clip/favorite')

    const response = await GET(request, { params: { slug: 'test-clip' } })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data.favorited).toBe(false)
    expect(clipsQueries.getClipBySlug).not.toHaveBeenCalled()
    expect(clipsQueries.isClipFavorited).not.toHaveBeenCalled()
  })

  it('should return favorited false when session has no user', async () => {
    vi.mocked(authUtils.getSession).mockResolvedValue({} as any)

    const request = new NextRequest('http://localhost:3000/api/clips/test-clip/favorite')

    const response = await GET(request, { params: { slug: 'test-clip' } })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data.favorited).toBe(false)
    expect(clipsQueries.getClipBySlug).not.toHaveBeenCalled()
    expect(clipsQueries.isClipFavorited).not.toHaveBeenCalled()
  })

  it('should return 404 when clip is not found', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
        email: 'test@example.com',
      },
    }

    vi.mocked(authUtils.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.getClipBySlug).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/clips/nonexistent-clip/favorite')

    const response = await GET(request, { params: { slug: 'nonexistent-clip' } })
    const json = await response.json()

    expect(response.status).toBe(404)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('NOT_FOUND')
    expect(json.error.message).toBe('Clip not found')
    expect(clipsQueries.isClipFavorited).not.toHaveBeenCalled()
  })

  it('should return 500 on database error when fetching clip', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
        email: 'test@example.com',
      },
    }

    vi.mocked(authUtils.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.getClipBySlug).mockRejectedValue(
      new Error('Database connection failed')
    )

    const request = new NextRequest('http://localhost:3000/api/clips/test-clip/favorite')

    const response = await GET(request, { params: { slug: 'test-clip' } })
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('INTERNAL_ERROR')
    expect(json.error.message).toBe('An unexpected error occurred')
  })

  it('should return 500 when isClipFavorited fails', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
        email: 'test@example.com',
      },
    }

    const mockClip = {
      id: 'cklclip123456789abcdefghi',
      slug: 'test-clip',
    }

    vi.mocked(authUtils.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.getClipBySlug).mockResolvedValue(mockClip as any)
    vi.mocked(clipsQueries.isClipFavorited).mockRejectedValue(
      new Error('Failed to check favorite status')
    )

    const request = new NextRequest('http://localhost:3000/api/clips/test-clip/favorite')

    const response = await GET(request, { params: { slug: 'test-clip' } })
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('INTERNAL_ERROR')
  })

  it('should handle different clip slugs correctly', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
        email: 'test@example.com',
      },
    }

    const mockClip = {
      id: 'cklclip987654321abcdefghi',
      slug: 'another-clip-slug',
    }

    vi.mocked(authUtils.getSession).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.getClipBySlug).mockResolvedValue(mockClip as any)
    vi.mocked(clipsQueries.isClipFavorited).mockResolvedValue(true)

    const request = new NextRequest('http://localhost:3000/api/clips/another-clip-slug/favorite')

    const response = await GET(request, { params: { slug: 'another-clip-slug' } })
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(clipsQueries.getClipBySlug).toHaveBeenCalledWith('another-clip-slug')
    expect(clipsQueries.isClipFavorited).toHaveBeenCalledWith('ckluser123456789abcdefghi', 'cklclip987654321abcdefghi')
  })
})
