export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResult<T> {
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

export function getPaginationParams(params: PaginationParams) {
  const page = Math.max(1, params.page ?? 1)
  const limit = Math.min(100, Math.max(1, params.limit ?? 20))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit)

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  }
}

export function buildOrderBy(
  sortBy: string | undefined,
  sortOrder: 'asc' | 'desc' = 'desc',
  allowedFields: string[]
): Record<string, 'asc' | 'desc'> | undefined {
  if (!sortBy || !allowedFields.includes(sortBy)) {
    return undefined
  }

  return { [sortBy]: sortOrder }
}
