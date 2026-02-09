import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/animators/route'
import * as animatorsQueries from '@/lib/db/queries/animators'

// Mock the database queries
vi.mock('@/lib/db/queries/animators', () => ({
  listAnimators: vi.fn(),
}))

describe('GET /api/animators', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return animators with default pagination', async () => {
    const mockAnimators = {
      data: [
        {
          id: 'animator1',
          slug: 'yutaka-nakamura',
          name: 'Yutaka Nakamura',
          nativeName: '中村豊',
          photoUrl: 'https://example.com/photo1.jpg',
          bio: 'Renowned animator known for action sequences',
          _count: {
            attributions: 42,
          },
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    }

    vi.mocked(animatorsQueries.listAnimators).mockResolvedValue(mockAnimators)

    const request = new NextRequest('http://localhost:3000/api/animators')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data).toEqual(mockAnimators.data)
    expect(json.pagination).toEqual(mockAnimators.pagination)
    expect(animatorsQueries.listAnimators).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 20,
        sortOrder: 'desc',
      })
    )
  })

  it('should handle pagination parameters', async () => {
    const mockAnimators = {
      data: [],
      pagination: {
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      },
    }

    vi.mocked(animatorsQueries.listAnimators).mockResolvedValue(mockAnimators)

    const request = new NextRequest('http://localhost:3000/api/animators?page=2&limit=10')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(animatorsQueries.listAnimators).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        limit: 10,
        sortOrder: 'desc',
      })
    )
  })

  it('should handle search query parameter', async () => {
    const mockAnimators = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(animatorsQueries.listAnimators).mockResolvedValue(mockAnimators)

    const request = new NextRequest('http://localhost:3000/api/animators?q=nakamura')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(animatorsQueries.listAnimators).toHaveBeenCalledWith(
      expect.objectContaining({
        q: 'nakamura',
        page: 1,
        limit: 20,
        sortOrder: 'desc',
      })
    )
  })

  it('should handle sort parameters', async () => {
    const mockAnimators = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(animatorsQueries.listAnimators).mockResolvedValue(mockAnimators)

    const request = new NextRequest(
      'http://localhost:3000/api/animators?sortBy=name&sortOrder=asc'
    )
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(animatorsQueries.listAnimators).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'name',
        sortOrder: 'asc',
        page: 1,
        limit: 20,
      })
    )
  })

  it('should handle hasPhoto filter parameter', async () => {
    const mockAnimators = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(animatorsQueries.listAnimators).mockResolvedValue(mockAnimators)

    const request = new NextRequest('http://localhost:3000/api/animators?hasPhoto=true')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(animatorsQueries.listAnimators).toHaveBeenCalledWith(
      expect.objectContaining({
        hasPhoto: true,
        page: 1,
        limit: 20,
        sortOrder: 'desc',
      })
    )
  })

  it('should handle multiple parameters together', async () => {
    const mockAnimators = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(animatorsQueries.listAnimators).mockResolvedValue(mockAnimators)

    const request = new NextRequest(
      'http://localhost:3000/api/animators?page=3&limit=15&q=yutaka&sortBy=name&sortOrder=asc&hasPhoto=true'
    )
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(animatorsQueries.listAnimators).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 3,
        limit: 15,
        q: 'yutaka',
        sortBy: 'name',
        sortOrder: 'asc',
        hasPhoto: true,
      })
    )
  })

  it('should return 400 for invalid page parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/animators?page=invalid')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('VALIDATION_ERROR')
    expect(json.error.message).toBe('Invalid query parameters')
    expect(json.error.details).toBeDefined()
  })

  it('should return 400 for invalid limit parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/animators?limit=abc')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('VALIDATION_ERROR')
    expect(json.error.message).toBe('Invalid query parameters')
  })

  it('should return 400 for limit exceeding maximum', async () => {
    const request = new NextRequest('http://localhost:3000/api/animators?limit=999')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('should return 400 for negative page number', async () => {
    const request = new NextRequest('http://localhost:3000/api/animators?page=-1')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })

  it('should return 400 for invalid sortOrder', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/animators?sortOrder=invalid'
    )
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(400)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('VALIDATION_ERROR')
  })


  it('should return 500 on database error', async () => {
    vi.mocked(animatorsQueries.listAnimators).mockRejectedValue(
      new Error('Database connection failed')
    )

    const request = new NextRequest('http://localhost:3000/api/animators')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json.success).toBe(false)
    expect(json.error.code).toBe('INTERNAL_ERROR')
    expect(json.error.message).toBe('An unexpected error occurred')
  })

  it('should handle empty result set', async () => {
    const mockAnimators = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(animatorsQueries.listAnimators).mockResolvedValue(mockAnimators)

    const request = new NextRequest('http://localhost:3000/api/animators')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data).toEqual([])
    expect(json.pagination.total).toBe(0)
  })

  it('should handle animators with all optional fields', async () => {
    const mockAnimators = {
      data: [
        {
          id: 'animator1',
          slug: 'yutaka-nakamura',
          name: 'Yutaka Nakamura',
          nativeName: '中村豊',
          photoUrl: 'https://example.com/photo1.jpg',
          bio: 'Renowned animator known for action sequences',
          birthDate: new Date('1967-01-01'),
          deathDate: null,
          twitterHandle: '@nakamura_yutaka',
          pixivId: '12345',
          websiteUrl: 'https://example.com',
          _count: {
            attributions: 42,
          },
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    }

    vi.mocked(animatorsQueries.listAnimators).mockResolvedValue(mockAnimators)

    const request = new NextRequest('http://localhost:3000/api/animators')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data).toHaveLength(1)
    expect(json.data[0]).toHaveProperty('nativeName')
    expect(json.data[0]).toHaveProperty('bio')
    expect(json.data[0]).toHaveProperty('twitterHandle')
  })

  it('should handle animators with minimal fields', async () => {
    const mockAnimators = {
      data: [
        {
          id: 'animator1',
          slug: 'john-doe',
          name: 'John Doe',
          nativeName: null,
          photoUrl: null,
          bio: null,
          _count: {
            attributions: 0,
          },
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    }

    vi.mocked(animatorsQueries.listAnimators).mockResolvedValue(mockAnimators)

    const request = new NextRequest('http://localhost:3000/api/animators')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.data).toHaveLength(1)
    expect(json.data[0].name).toBe('John Doe')
  })

  it('should handle large page numbers', async () => {
    const mockAnimators = {
      data: [],
      pagination: {
        page: 100,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(animatorsQueries.listAnimators).mockResolvedValue(mockAnimators)

    const request = new NextRequest('http://localhost:3000/api/animators?page=100')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.pagination.page).toBe(100)
  })

  it('should handle search with special characters', async () => {
    const mockAnimators = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(animatorsQueries.listAnimators).mockResolvedValue(mockAnimators)

    const request = new NextRequest(
      'http://localhost:3000/api/animators?q=' + encodeURIComponent('中村豊')
    )
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(animatorsQueries.listAnimators).toHaveBeenCalledWith(
      expect.objectContaining({
        q: '中村豊',
      })
    )
  })

  it('should coerce string page to number', async () => {
    const mockAnimators = {
      data: [],
      pagination: {
        page: 5,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(animatorsQueries.listAnimators).mockResolvedValue(mockAnimators)

    const request = new NextRequest('http://localhost:3000/api/animators?page=5')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(animatorsQueries.listAnimators).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 5,
      })
    )
  })

  it('should coerce string hasPhoto to boolean', async () => {
    const mockAnimators = {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    }

    vi.mocked(animatorsQueries.listAnimators).mockResolvedValue(mockAnimators)

    const request = new NextRequest('http://localhost:3000/api/animators?hasPhoto=1')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(animatorsQueries.listAnimators).toHaveBeenCalledWith(
      expect.objectContaining({
        hasPhoto: true,
      })
    )
  })

})
