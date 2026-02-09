import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { api, ApiClientError } from '@/lib/api/client'

describe('ApiClientError', () => {
  it('should create error with all properties', () => {
    const error = new ApiClientError('Not found', 'NOT_FOUND', 404, { id: '123' })
    expect(error.message).toBe('Not found')
    expect(error.code).toBe('NOT_FOUND')
    expect(error.status).toBe(404)
    expect(error.details).toEqual({ id: '123' })
    expect(error.name).toBe('ApiClientError')
  })

  it('should create error without details', () => {
    const error = new ApiClientError('Unauthorized', 'UNAUTHORIZED', 401)
    expect(error.message).toBe('Unauthorized')
    expect(error.code).toBe('UNAUTHORIZED')
    expect(error.status).toBe(401)
    expect(error.details).toBeUndefined()
  })

  it('should be instanceof Error', () => {
    const error = new ApiClientError('Test error', 'TEST', 500)
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ApiClientError)
  })
})

describe('api.get', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should make GET request to correct endpoint', async () => {
    const mockData = { data: { id: '1', name: 'Test' } }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.get('/test')

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    )
  })

  it('should return parsed JSON response', async () => {
    const mockData = { data: { id: '1', name: 'Test' } }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const result = await api.get('/test')

    expect(result).toEqual(mockData)
  })

  it('should append query parameters', async () => {
    const mockData = { data: [] }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.get('/test', { page: 1, limit: 20 })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test?page=1&limit=20',
      expect.any(Object)
    )
  })

  it('should filter out null and undefined params', async () => {
    const mockData = { data: [] }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.get('/test', { page: 1, filter: null, search: undefined, active: true })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test?page=1&active=true',
      expect.any(Object)
    )
  })

  it('should handle boolean params', async () => {
    const mockData = { data: [] }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.get('/test', { active: true, deleted: false })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test?active=true&deleted=false',
      expect.any(Object)
    )
  })

  it('should handle number params', async () => {
    const mockData = { data: [] }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.get('/test', { count: 42, offset: 0 })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test?count=42&offset=0',
      expect.any(Object)
    )
  })

  it('should work without params', async () => {
    const mockData = { data: [] }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.get('/test')

    expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.any(Object))
  })

  it('should throw ApiClientError on error response', async () => {
    const errorResponse = {
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
        details: { id: '123' },
      },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => errorResponse,
    })

    await expect(api.get('/test')).rejects.toThrow(ApiClientError)
  })

  it('should throw ApiClientError with correct error message', async () => {
    const errorResponse = {
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
        details: { id: '123' },
      },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => errorResponse,
    })

    await expect(api.get('/test')).rejects.toThrow('Resource not found')
  })

  it('should throw ApiClientError with correct properties', async () => {
    const errorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: { field: 'email' },
      },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => errorResponse,
    })

    try {
      await api.get('/test')
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError)
      if (error instanceof ApiClientError) {
        expect(error.code).toBe('VALIDATION_ERROR')
        expect(error.status).toBe(400)
        expect(error.message).toBe('Invalid input')
        expect(error.details).toEqual({ field: 'email' })
      }
    }
  })
})

describe('api.post', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should make POST request with JSON body', async () => {
    const mockData = { success: true, data: { id: '1' } }
    const body = { name: 'Test', email: 'test@example.com' }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.post('/test', body)

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
    )
  })

  it('should work without body', async () => {
    const mockData = { success: true }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.post('/test')

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'POST',
        body: undefined,
      })
    )
  })

  it('should return parsed response', async () => {
    const mockData = { success: true, data: { id: '1' } }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const result = await api.post('/test', { name: 'Test' })

    expect(result).toEqual(mockData)
  })

  it('should handle complex nested objects', async () => {
    const mockData = { success: true }
    const body = {
      user: {
        name: 'Test',
        roles: ['admin', 'user'],
        metadata: {
          created: '2024-01-01',
          active: true,
        },
      },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.post('/test', body)

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        body: JSON.stringify(body),
      })
    )
  })

  it('should throw ApiClientError on error response', async () => {
    const errorResponse = {
      error: {
        code: 'DUPLICATE',
        message: 'Resource already exists',
      },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => errorResponse,
    })

    await expect(api.post('/test', { name: 'Test' })).rejects.toThrow(ApiClientError)
  })
})

describe('api.patch', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should make PATCH request with JSON body', async () => {
    const mockData = { success: true, data: { id: '1', name: 'Updated' } }
    const body = { name: 'Updated' }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.patch('/test/1', body)

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test/1',
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
    )
  })

  it('should return parsed response', async () => {
    const mockData = { success: true, data: { id: '1' } }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const result = await api.patch('/test/1', { name: 'Updated' })

    expect(result).toEqual(mockData)
  })

  it('should throw ApiClientError on error response', async () => {
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

    await expect(api.patch('/test/1', { name: 'Test' })).rejects.toThrow(ApiClientError)
  })
})

describe('api.put', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should make PUT request with JSON body', async () => {
    const mockData = { success: true, data: { id: '1', name: 'Replaced' } }
    const body = { name: 'Replaced', email: 'replaced@example.com' }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.put('/test/1', body)

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test/1',
      expect.objectContaining({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
    )
  })

  it('should return parsed response', async () => {
    const mockData = { success: true, data: { id: '1' } }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const result = await api.put('/test/1', { name: 'Replaced' })

    expect(result).toEqual(mockData)
  })

  it('should throw ApiClientError on error response', async () => {
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

    await expect(api.put('/test/1', { name: 'Test' })).rejects.toThrow(ApiClientError)
  })
})

describe('api.delete', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should make DELETE request', async () => {
    const mockData = { success: true }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.delete('/test/1')

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test/1',
      expect.objectContaining({
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    )
  })

  it('should return parsed response', async () => {
    const mockData = { success: true }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const result = await api.delete('/test/1')

    expect(result).toEqual(mockData)
  })

  it('should not include body in DELETE request', async () => {
    const mockData = { success: true }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.delete('/test/1')

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test/1',
      expect.objectContaining({
        method: 'DELETE',
        body: undefined,
      })
    )
  })

  it('should throw ApiClientError on error response', async () => {
    const errorResponse = {
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found',
      },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => errorResponse,
    })

    await expect(api.delete('/test/1')).rejects.toThrow(ApiClientError)
  })
})

describe('request function edge cases', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should handle empty query string when all params are null/undefined', async () => {
    const mockData = { data: [] }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.get('/test', { param1: null, param2: undefined })

    expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.any(Object))
  })

  it('should preserve API base path', async () => {
    const mockData = { data: [] }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.get('/clips')

    expect(global.fetch).toHaveBeenCalledWith('/api/clips', expect.any(Object))
  })

  it('should handle endpoints starting with /', async () => {
    const mockData = { data: [] }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.get('/test')

    expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.any(Object))
  })

  it('should handle 500 server errors', async () => {
    const errorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => errorResponse,
    })

    try {
      await api.get('/test')
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError)
      if (error instanceof ApiClientError) {
        expect(error.status).toBe(500)
        expect(error.code).toBe('INTERNAL_ERROR')
      }
    }
  })

  it('should handle rate limiting errors', async () => {
    const errorResponse = {
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests',
        details: { retryAfter: 60 },
      },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => errorResponse,
    })

    try {
      await api.get('/test')
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError)
      if (error instanceof ApiClientError) {
        expect(error.status).toBe(429)
        expect(error.code).toBe('RATE_LIMITED')
        expect(error.details).toEqual({ retryAfter: 60 })
      }
    }
  })

  it('should handle error response without details', async () => {
    const errorResponse = {
      error: {
        code: 'NOT_FOUND',
        message: 'Not found',
      },
    }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => errorResponse,
    })

    try {
      await api.get('/test')
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError)
      if (error instanceof ApiClientError) {
        expect(error.details).toBeUndefined()
      }
    }
  })

  it('should handle special characters in query params', async () => {
    const mockData = { data: [] }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.get('/test', { q: 'hello world', filter: 'a&b=c' })

    const call = (global.fetch as any).mock.calls[0][0]
    expect(call).toContain('hello+world')
    expect(call).toContain('a%26b%3Dc')
  })

  it('should handle array-like param values as strings', async () => {
    const mockData = { data: [] }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.get('/test', { ids: 'id1,id2,id3' })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test?ids=id1%2Cid2%2Cid3',
      expect.any(Object)
    )
  })

  it('should handle zero as valid param value', async () => {
    const mockData = { data: [] }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.get('/test', { page: 0, count: 0 })

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test?page=0&count=0',
      expect.any(Object)
    )
  })

  it('should handle empty string as valid param value', async () => {
    const mockData = { data: [] }
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    await api.get('/test', { query: '' })

    expect(global.fetch).toHaveBeenCalledWith('/api/test?query=', expect.any(Object))
  })
})
