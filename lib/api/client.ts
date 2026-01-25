import type { ApiError } from '@/types/api'

const API_BASE = '/api'

interface RequestConfig extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>
  body?: unknown
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiClientError'
  }
}

async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { params, body, ...fetchConfig } = config

  let url = `${API_BASE}${endpoint}`

  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  const response = await fetch(url, {
    ...fetchConfig,
    headers: {
      'Content-Type': 'application/json',
      ...fetchConfig.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json()

  if (!response.ok) {
    const error = data as ApiError
    throw new ApiClientError(
      error.error.message,
      error.error.code,
      response.status,
      error.error.details
    )
  }

  return data
}

export const api = {
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return request<T>(endpoint, { method: 'GET', params })
  },

  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return request<T>(endpoint, { method: 'POST', body })
  },

  patch<T>(endpoint: string, body: unknown): Promise<T> {
    return request<T>(endpoint, { method: 'PATCH', body })
  },

  put<T>(endpoint: string, body: unknown): Promise<T> {
    return request<T>(endpoint, { method: 'PUT', body })
  },

  delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' })
  },
}
