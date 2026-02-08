import { NextRequest, NextResponse } from 'next/server'
import { getTrendingClips } from '@/lib/db/queries/trending'
import { z } from 'zod'

const trendingQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(12),
  offset: z.coerce.number().min(0).optional().default(0),
  windowDays: z.coerce.number().min(1).max(90).optional().default(30),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = trendingQuerySchema.parse({
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
      windowDays: searchParams.get('windowDays') ?? undefined,
    })

    const result = await getTrendingClips(params)

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        limit: params.limit,
        offset: params.offset,
        hasMore: params.offset + params.limit < result.total,
      },
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

    console.error('Error fetching trending clips:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch trending clips',
        },
      },
      { status: 500 }
    )
  }
}
