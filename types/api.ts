export interface ApiResponse<T> {
  data: T
  success: true
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  success: false
}

export type ApiResult<T> = ApiResponse<T> | ApiError

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SearchParams {
  q?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface AnimatorSearchParams extends SearchParams {
  hasPhoto?: boolean
  activeYearStart?: number
  activeYearEnd?: number
}

export interface ClipSearchParams extends SearchParams {
  animatorId?: string
  animeId?: string
  studioId?: string
  tagIds?: string[]
  verificationStatus?: string
  yearStart?: number
  yearEnd?: number
}

// API Error codes
export const ERROR_CODES = {
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DUPLICATE: 'DUPLICATE',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]
