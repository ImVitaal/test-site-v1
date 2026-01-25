import { NextRequest, NextResponse } from 'next/server'
import { listClips } from '@/lib/db/queries/clips'
import { clipQuerySchema } from '@/lib/validations/clip'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = clipQuerySchema.parse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortOrder: searchParams.get('sortOrder') ?? undefined,
      animatorId: searchParams.get('animatorId') ?? undefined,
      animeId: searchParams.get('animeId') ?? undefined,
      studioId: searchParams.get('studioId') ?? undefined,
      tagIds: searchParams.get('tagIds') ?? undefined,
      verificationStatus: searchParams.get('verificationStatus') ?? undefined,
      yearStart: searchParams.get('yearStart') ?? undefined,
      yearEnd: searchParams.get('yearEnd') ?? undefined,
    })

    const result = await listClips(params)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    if (error instanceof ZodError) {
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

    console.error('Error listing clips:', error)
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
