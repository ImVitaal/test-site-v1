import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/clips/route'
import * as clipsQueries from '@/lib/db/queries/clips'
import * as authConfig from '@/lib/auth/config'

// Mock the database queries
vi.mock('@/lib/db/queries/clips', () => ({
  listClips: vi.fn(),
  createClip: vi.fn(),
}))

// Mock the auth config
vi.mock('@/lib/auth/config', () => ({
  auth: vi.fn(),
}))

describe('GET /api/clips', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return clips with default pagination', async () => {
    const mockClips = {
      data: [
        {
          id: 'clip1',
          slug: 'test-clip-1',
          title: 'Test Clip 1',
          thumbnailUrl: 'https://example.com/thumb1.jpg',
          duration: 30,
          viewCount: 100,
          favoriteCount: 10,
          anime: { title: 'Test Anime', slug: 'test-anime' },
          primaryAnimator: { name: 'Test Animator', slug: 'test-animator' },
          verificationStatus: 'VERIFIED',
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    }

    vi.mocked(clipsQueries.listClips).mockResolvedValue(mockClips)

    const request = new NextRequest('http://localhost:3000/api/clips')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data).toEqual(mockClips.data)
    expect(json.pagination).toEqual(mockClips.pagination)
    expect(clipsQueries.listClips).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        sortOrder: 'desc',
      })
    )
  })

  it('should handle pagination parameters', async () => {
    const mockClips = {
      data: [],
      pagination: {
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      },
    }

    vi.mocked(clipsQueries.listClips).mockResolvedValue(mockClips)

    const request = new NextRequest('http://localhost:3000/api/clips?page=2&limit=10')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(clipsQueries.listClips).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 10,
        sortOrder: 'desc',
      })
    )
  })

  it('should handle search query parameter', async () => {
    const mockClips = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(clipsQueries.listClips).mockResolvedValue(mockClips)

    const request = new NextRequest('http://localhost:3000/api/clips?q=sakuga')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(clipsQueries.listClips).toHaveBeenCalledWith(
      expect.objectContaining({
        q: 'sakuga',
        page: 1,
        limit: 20,
        sortOrder: 'desc',
      })
    )
  })

  it('should handle sort parameters', async () => {
    const mockClips = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(clipsQueries.listClips).mockResolvedValue(mockClips)

    const request = new NextRequest(
      'http://localhost:3000/api/clips?sortBy=favoriteCount&sortOrder=desc'
    )
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(clipsQueries.listClips).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'favoriteCount',
        sortOrder: 'desc',
        page: 1,
        limit: 20,
      })
    )
  })

  it('should handle filter parameters', async () => {
    const mockClips = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(clipsQueries.listClips).mockResolvedValue(mockClips)

    const request = new NextRequest(
      'http://localhost:3000/api/clips?animatorId=ckl1234567890abcdefghijklm&animeId=ckl9876543210abcdefghijklm&studioId=cklstudio123456abcdefghij'
    )
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(clipsQueries.listClips).toHaveBeenCalledWith(
      expect.objectContaining({
        animatorId: 'ckl1234567890abcdefghijklm',
        animeId: 'ckl9876543210abcdefghijklm',
        studioId: 'cklstudio123456abcdefghij',
        page: 1,
        limit: 20,
        sortOrder: 'desc',
      })
    )
  })

  it('should handle tagIds parameter', async () => {
    const mockClips = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(clipsQueries.listClips).mockResolvedValue(mockClips)

    const request = new NextRequest(
      'http://localhost:3000/api/clips?tagIds=ckltag1234567890abcdefghi,ckltag9876543210abcdefghi,ckltagxyz123456abcdefghij'
    )
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(clipsQueries.listClips).toHaveBeenCalledWith(
      expect.objectContaining({
        tagIds: ['ckltag1234567890abcdefghi', 'ckltag9876543210abcdefghi', 'ckltagxyz123456abcdefghij'],
        page: 1,
        limit: 20,
        sortOrder: 'desc',
      })
    )
  })

  it('should handle verificationStatus parameter', async () => {
    const mockClips = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(clipsQueries.listClips).mockResolvedValue(mockClips)

    const request = new NextRequest('http://localhost:3000/api/clips?verificationStatus=VERIFIED')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(clipsQueries.listClips).toHaveBeenCalledWith(
      expect.objectContaining({
        verificationStatus: 'VERIFIED',
        page: 1,
        limit: 20,
        sortOrder: 'desc',
      })
    )
  })

  it('should handle year range parameters', async () => {
    const mockClips = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(clipsQueries.listClips).mockResolvedValue(mockClips)

    const request = new NextRequest('http://localhost:3000/api/clips?yearStart=2020&yearEnd=2023')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(clipsQueries.listClips).toHaveBeenCalledWith(
      expect.objectContaining({
        yearStart: 2020,
        yearEnd: 2023,
        page: 1,
        limit: 20,
        sortOrder: 'desc',
      })
    )
  })

  it('should handle multiple parameters together', async () => {
    const mockClips = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(clipsQueries.listClips).mockResolvedValue(mockClips)

    const request = new NextRequest(
      'http://localhost:3000/api/clips?page=3&limit=15&q=fight&sortBy=viewCount&sortOrder=desc&animatorId=ckl1234567890abcdefghijklm&verificationStatus=VERIFIED'
    )
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(clipsQueries.listClips).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 3,
        limit: 15,
        q: 'fight',
        sortBy: 'viewCount',
        sortOrder: 'desc',
        animatorId: 'ckl1234567890abcdefghijklm',
        verificationStatus: 'VERIFIED',
      })
    )
  })

  it('should return 400 for invalid query parameters', async () => {
    const request = new NextRequest('http://localhost:3000/api/clips?page=invalid')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('VALIDATION_ERROR')
    expect(json.error.message).toBe('Invalid query parameters')
    expect(json.error.details).toBeDefined()
  })

  it('should return 400 for invalid verificationStatus', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/clips?verificationStatus=INVALID'
    )
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('should return 500 on database error', async () => {
    vi.mocked(clipsQueries.listClips).mockRejectedValue(new Error('Database connection failed'))

    const request = new NextRequest('http://localhost:3000/api/clips')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('INTERNAL_ERROR')
    expect(json.error.message).toBe('An unexpected error occurred')
  })
})

describe('POST /api/clips', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create clip with valid data and authentication', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
        email: 'test@example.com',
        name: 'Test User',
      },
    }

    const mockClip = {
      id: 'cklclip123456789abcdefghi',
      slug: 'test-clip-abc123',
      title: 'Test Clip',
      videoUrl: 'https://example.com/video.mp4',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      duration: 30,
      animeId: 'cklanime12345678abcdefghi',
      episodeNumber: 5,
      timestampStart: '12:34',
      techniqueDescription:
        'This is a detailed technique description explaining the animation techniques used in this clip for educational purposes.',
      submissionStatus: 'PENDING',
      attributions: [
        {
          id: 'cklattr123456789abcdefghi',
          animatorId: 'cklanimator12345abcdefghi',
          role: 'KEY_ANIMATION',
          verificationStatus: 'SPECULATIVE',
          sourceUrl: 'https://example.com/source',
          animator: {
            id: 'cklanimator12345abcdefghi',
            name: 'Test Animator',
            slug: 'test-animator',
          },
        },
      ],
      anime: {
        id: 'cklanime12345678abcdefghi',
        title: 'Test Anime',
        slug: 'test-anime',
      },
      tags: [],
    }

    vi.mocked(authConfig.auth).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.createClip).mockResolvedValue(mockClip as any)

    const requestBody = {
      title: 'Test Clip',
      videoUrl: 'https://example.com/video.mp4',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      duration: 30,
      animeId: 'cklanime12345678abcdefghi',
      episodeNumber: 5,
      timestampStart: '12:34',
      techniqueDescription:
        'This is a detailed technique description explaining the animation techniques used in this clip for educational purposes.',
      attributions: [
        {
          animatorId: 'cklanimator12345abcdefghi',
          role: 'KEY_ANIMATION',
          sourceUrl: 'https://example.com/source',
        },
      ],
    }

    const request = new NextRequest('http://localhost:3000/api/clips', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data).toEqual(mockClip)
    expect(clipsQueries.createClip).toHaveBeenCalledWith(requestBody, 'ckluser123456789abcdefghi')
  })

  it('should create clip with optional fields omitted', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
        email: 'test@example.com',
      },
    }

    const mockClip = {
      id: 'cklclip123456789abcdefghi',
      slug: 'minimal-clip-abc123',
      title: 'Minimal Clip',
      videoUrl: 'https://example.com/video.mp4',
      duration: 20,
      submissionStatus: 'PENDING',
    }

    vi.mocked(authConfig.auth).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.createClip).mockResolvedValue(mockClip as any)

    const requestBody = {
      title: 'Minimal Clip',
      videoUrl: 'https://example.com/video.mp4',
      duration: 20,
      animeId: 'cklanime12345678abcdefghi',
      techniqueDescription:
        'This is a detailed technique description explaining the animation techniques used in this clip for educational purposes.',
      attributions: [
        {
          animatorId: 'cklanimator12345abcdefghi',
          role: 'KEY_ANIMATION',
          sourceUrl: 'https://example.com/source',
        },
      ],
    }

    const request = new NextRequest('http://localhost:3000/api/clips', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(clipsQueries.createClip).toHaveBeenCalledWith(requestBody, 'ckluser123456789abcdefghi')
  })

  it('should return 401 when user is not authenticated', async () => {
    vi.mocked(authConfig.auth).mockResolvedValue(null)

    const requestBody = {
      title: 'Test Clip',
      videoUrl: 'https://example.com/video.mp4',
      duration: 30,
      animeId: 'cklanime12345678abcdefghi',
      techniqueDescription:
        'This is a detailed technique description explaining the animation techniques used in this clip for educational purposes.',
      attributions: [
        {
          animatorId: 'cklanimator12345abcdefghi',
          role: 'KEY_ANIMATION',
          sourceUrl: 'https://example.com/source',
        },
      ],
    }

    const request = new NextRequest('http://localhost:3000/api/clips', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('UNAUTHORIZED')
    expect(json.error.message).toBe('You must be logged in to submit clips')
    expect(clipsQueries.createClip).not.toHaveBeenCalled()
  })

  it('should return 401 when session has no user', async () => {
    vi.mocked(authConfig.auth).mockResolvedValue({} as any)

    const requestBody = {
      title: 'Test Clip',
      videoUrl: 'https://example.com/video.mp4',
      duration: 30,
      animeId: 'cklanime12345678abcdefghi',
      techniqueDescription:
        'This is a detailed technique description explaining the animation techniques used in this clip for educational purposes.',
      attributions: [
        {
          animatorId: 'cklanimator12345abcdefghi',
          role: 'KEY_ANIMATION',
          sourceUrl: 'https://example.com/source',
        },
      ],
    }

    const request = new NextRequest('http://localhost:3000/api/clips', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(401)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('UNAUTHORIZED')
  })

  it('should return 400 for missing required fields', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
        email: 'test@example.com',
      },
    }

    vi.mocked(authConfig.auth).mockResolvedValue(mockSession as any)

    const requestBody = {
      title: 'Test Clip',
      // Missing videoUrl, duration, animeId, techniqueDescription, attributions
    }

    const request = new NextRequest('http://localhost:3000/api/clips', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('VALIDATION_ERROR')
    expect(json.error.message).toBe('Invalid request body')
    expect(json.error.details).toBeDefined()
    expect(clipsQueries.createClip).not.toHaveBeenCalled()
  })

  it('should return 400 for invalid videoUrl', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
      },
    }

    vi.mocked(authConfig.auth).mockResolvedValue(mockSession as any)

    const requestBody = {
      title: 'Test Clip',
      videoUrl: 'not-a-valid-url',
      duration: 30,
      animeId: 'cklanime12345678abcdefghi',
      techniqueDescription:
        'This is a detailed technique description explaining the animation techniques used in this clip for educational purposes.',
      attributions: [
        {
          animatorId: 'cklanimator12345abcdefghi',
          role: 'KEY_ANIMATION',
          sourceUrl: 'https://example.com/source',
        },
      ],
    }

    const request = new NextRequest('http://localhost:3000/api/clips', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('should return 400 for techniqueDescription too short', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
      },
    }

    vi.mocked(authConfig.auth).mockResolvedValue(mockSession as any)

    const requestBody = {
      title: 'Test Clip',
      videoUrl: 'https://example.com/video.mp4',
      duration: 30,
      animeId: 'cklanime12345678abcdefghi',
      techniqueDescription: 'Too short',
      attributions: [
        {
          animatorId: 'cklanimator12345abcdefghi',
          role: 'KEY_ANIMATION',
          sourceUrl: 'https://example.com/source',
        },
      ],
    }

    const request = new NextRequest('http://localhost:3000/api/clips', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('should return 400 for empty attributions array', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
      },
    }

    vi.mocked(authConfig.auth).mockResolvedValue(mockSession as any)

    const requestBody = {
      title: 'Test Clip',
      videoUrl: 'https://example.com/video.mp4',
      duration: 30,
      animeId: 'cklanime12345678abcdefghi',
      techniqueDescription:
        'This is a detailed technique description explaining the animation techniques used in this clip for educational purposes.',
      attributions: [],
    }

    const request = new NextRequest('http://localhost:3000/api/clips', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('should return 400 for invalid role in attribution', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
      },
    }

    vi.mocked(authConfig.auth).mockResolvedValue(mockSession as any)

    const requestBody = {
      title: 'Test Clip',
      videoUrl: 'https://example.com/video.mp4',
      duration: 30,
      animeId: 'cklanime12345678abcdefghi',
      techniqueDescription:
        'This is a detailed technique description explaining the animation techniques used in this clip for educational purposes.',
      attributions: [
        {
          animatorId: 'cklanimator12345abcdefghi',
          role: 'INVALID_ROLE',
          sourceUrl: 'https://example.com/source',
        },
      ],
    }

    const request = new NextRequest('http://localhost:3000/api/clips', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('should return 400 for duration exceeding maximum', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
      },
    }

    vi.mocked(authConfig.auth).mockResolvedValue(mockSession as any)

    const requestBody = {
      title: 'Test Clip',
      videoUrl: 'https://example.com/video.mp4',
      duration: 9999, // Exceeds VIDEO_MAX_DURATION_SECONDS
      animeId: 'cklanime12345678abcdefghi',
      techniqueDescription:
        'This is a detailed technique description explaining the animation techniques used in this clip for educational purposes.',
      attributions: [
        {
          animatorId: 'cklanimator12345abcdefghi',
          role: 'KEY_ANIMATION',
          sourceUrl: 'https://example.com/source',
        },
      ],
    }

    const request = new NextRequest('http://localhost:3000/api/clips', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('should handle invalid JSON body', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
      },
    }

    vi.mocked(authConfig.auth).mockResolvedValue(mockSession as any)

    const request = new NextRequest('http://localhost:3000/api/clips', {
      method: 'POST',
      body: 'invalid json{',
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('INTERNAL_ERROR')
    expect(json.error.message).toBe('Failed to create clip')
  })

  it('should return 500 on database error', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
      },
    }

    vi.mocked(authConfig.auth).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.createClip).mockRejectedValue(
      new Error('Database connection failed')
    )

    const requestBody = {
      title: 'Test Clip',
      videoUrl: 'https://example.com/video.mp4',
      duration: 30,
      animeId: 'cklanime12345678abcdefghi',
      techniqueDescription:
        'This is a detailed technique description explaining the animation techniques used in this clip for educational purposes.',
      attributions: [
        {
          animatorId: 'cklanimator12345abcdefghi',
          role: 'KEY_ANIMATION',
          sourceUrl: 'https://example.com/source',
        },
      ],
    }

    const request = new NextRequest('http://localhost:3000/api/clips', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('INTERNAL_ERROR')
    expect(json.error.message).toBe('Failed to create clip')
  })

  it('should handle attribution with optional sourceNote', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
      },
    }

    const mockClip = {
      id: 'cklclip123456789abcdefghi',
      slug: 'test-clip-abc123',
      submissionStatus: 'PENDING',
    }

    vi.mocked(authConfig.auth).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.createClip).mockResolvedValue(mockClip as any)

    const requestBody = {
      title: 'Test Clip',
      videoUrl: 'https://example.com/video.mp4',
      duration: 30,
      animeId: 'cklanime12345678abcdefghi',
      techniqueDescription:
        'This is a detailed technique description explaining the animation techniques used in this clip for educational purposes.',
      attributions: [
        {
          animatorId: 'cklanimator12345abcdefghi',
          role: 'KEY_ANIMATION',
          sourceUrl: 'https://example.com/source',
          sourceNote: 'Additional context about this attribution',
        },
      ],
    }

    const request = new NextRequest('http://localhost:3000/api/clips', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(clipsQueries.createClip).toHaveBeenCalledWith(requestBody, 'ckluser123456789abcdefghi')
  })

  it('should handle multiple attributions', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
      },
    }

    const mockClip = {
      id: 'cklclip123456789abcdefghi',
      slug: 'test-clip-abc123',
      submissionStatus: 'PENDING',
    }

    vi.mocked(authConfig.auth).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.createClip).mockResolvedValue(mockClip as any)

    const requestBody = {
      title: 'Test Clip',
      videoUrl: 'https://example.com/video.mp4',
      duration: 30,
      animeId: 'cklanime12345678abcdefghi',
      techniqueDescription:
        'This is a detailed technique description explaining the animation techniques used in this clip for educational purposes.',
      attributions: [
        {
          animatorId: 'cklanimator1234abcdefghij',
          role: 'KEY_ANIMATION',
          sourceUrl: 'https://example.com/source1',
        },
        {
          animatorId: 'cklanimator5678abcdefghij',
          role: 'ANIMATION_DIRECTOR',
          sourceUrl: 'https://example.com/source2',
        },
      ],
    }

    const request = new NextRequest('http://localhost:3000/api/clips', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(clipsQueries.createClip).toHaveBeenCalledWith(requestBody, 'ckluser123456789abcdefghi')
  })

  it('should handle tagIds array', async () => {
    const mockSession = {
      user: {
        id: 'ckluser123456789abcdefghi',
      },
    }

    const mockClip = {
      id: 'cklclip123456789abcdefghi',
      slug: 'test-clip-abc123',
      submissionStatus: 'PENDING',
    }

    vi.mocked(authConfig.auth).mockResolvedValue(mockSession as any)
    vi.mocked(clipsQueries.createClip).mockResolvedValue(mockClip as any)

    const requestBody = {
      title: 'Test Clip',
      videoUrl: 'https://example.com/video.mp4',
      duration: 30,
      animeId: 'cklanime12345678abcdefghi',
      techniqueDescription:
        'This is a detailed technique description explaining the animation techniques used in this clip for educational purposes.',
      attributions: [
        {
          animatorId: 'cklanimator12345abcdefghi',
          role: 'KEY_ANIMATION',
          sourceUrl: 'https://example.com/source',
        },
      ],
      tagIds: [
        'ckltag1234567890abcdefghi',
        'ckltag9876543210abcdefghi',
        'ckltagxyz123456abcdefghij',
      ],
    }

    const request = new NextRequest('http://localhost:3000/api/clips', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    })

    const response = await POST(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(clipsQueries.createClip).toHaveBeenCalledWith(requestBody, 'ckluser123456789abcdefghi')
  })
})
