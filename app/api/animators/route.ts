import { NextRequest, NextResponse } from 'next/server'
import { listAnimators } from '@/lib/db/queries/animators'
import { animatorQuerySchema } from '@/lib/validations/animator'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = animatorQuerySchema.parse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortOrder: searchParams.get('sortOrder') ?? undefined,
      hasPhoto: searchParams.get('hasPhoto') ?? undefined,
    })

    const result = await listAnimators(params)

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

    console.error('Error listing animators:', error)
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
