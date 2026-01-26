import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getRankingLists, getFeaturedRankingLists } from '@/lib/db/queries/rankings'

const querySchema = z.object({
  type: z.enum(['EDITORIAL', 'COMMUNITY']).optional(),
  category: z.enum(['ANIMATOR', 'CLIP', 'STUDIO', 'ANIME']).optional(),
  featured: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const parseResult = querySchema.safeParse(searchParams)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    const { type, category, featured, limit, offset } = parseResult.data

    // If featured is requested, return featured lists
    if (featured === 'true') {
      const lists = await getFeaturedRankingLists(limit)
      return NextResponse.json({
        success: true,
        data: lists,
      })
    }

    // Otherwise return filtered list
    const result = await getRankingLists({
      type: type as any,
      category: category as any,
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      data: result.lists,
      pagination: {
        total: result.total,
        limit,
        offset,
        hasMore: result.hasMore,
      },
    })
  } catch (error) {
    console.error('Error fetching ranking lists:', error)
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
