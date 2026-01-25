import { NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { ERROR_CODES, type ErrorCode } from '@/types/api'

interface ErrorResponseOptions {
  code: ErrorCode
  message: string
  status: number
  details?: Record<string, unknown>
}

export function createErrorResponse({
  code,
  message,
  status,
  details,
}: ErrorResponseOptions) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  )
}

// Pre-configured error responses
export const errors = {
  notFound: (resource: string) =>
    createErrorResponse({
      code: ERROR_CODES.NOT_FOUND,
      message: `${resource} not found`,
      status: 404,
    }),

  unauthorized: (message = 'Authentication required') =>
    createErrorResponse({
      code: ERROR_CODES.UNAUTHORIZED,
      message,
      status: 401,
    }),

  forbidden: (message = 'Access denied') =>
    createErrorResponse({
      code: ERROR_CODES.FORBIDDEN,
      message,
      status: 403,
    }),

  validation: (error: ZodError) =>
    createErrorResponse({
      code: ERROR_CODES.VALIDATION_ERROR,
      message: 'Validation failed',
      status: 400,
      details: error.flatten(),
    }),

  badRequest: (message: string, details?: Record<string, unknown>) =>
    createErrorResponse({
      code: ERROR_CODES.VALIDATION_ERROR,
      message,
      status: 400,
      details,
    }),

  internal: (error?: Error) => {
    if (error) {
      console.error('Internal error:', error)
    }
    return createErrorResponse({
      code: ERROR_CODES.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
      status: 500,
    })
  },

  duplicate: (resource: string) =>
    createErrorResponse({
      code: ERROR_CODES.DUPLICATE,
      message: `${resource} already exists`,
      status: 409,
    }),

  rateLimited: () =>
    createErrorResponse({
      code: ERROR_CODES.RATE_LIMITED,
      message: 'Too many requests, please try again later',
      status: 429,
    }),
}

// Error handler wrapper for API routes
export function withErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      if (error instanceof ZodError) {
        return errors.validation(error)
      }
      return errors.internal(error instanceof Error ? error : undefined)
    }
  }) as T
}
