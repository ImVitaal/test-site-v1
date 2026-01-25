import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getPendingClips, getModerationStats } from '@/lib/db/queries/moderation'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sortBy: z.enum(['date', 'trust']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Check authentication and authorization
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in',
          },
        },
        { status: 401 }
      )
    }

    if (!['MODERATOR', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to access the moderation queue',
          },
        },
        { status: 403 }
      )
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const params = querySchema.parse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortOrder: searchParams.get('sortOrder') ?? undefined,
    })

    const result = await getPendingClips(params)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    console.error('Error fetching moderation queue:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    )
  }
}
