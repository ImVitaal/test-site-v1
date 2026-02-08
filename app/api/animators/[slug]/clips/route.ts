import { NextRequest, NextResponse } from 'next/server'
import { getAnimatorBySlug, getAnimatorClips } from '@/lib/db/queries/animators'
import { paginationSchema } from '@/lib/validations/common'
import { ZodError } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const animator = await getAnimatorBySlug(params.slug)

    if (!animator) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Animator not found',
          },
        },
        { status: 404 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const paginationParams = paginationSchema.parse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    })

    const result = await getAnimatorClips(animator.id, paginationParams)

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
          },
        },
        { status: 400 }
      )
    }

    console.error('Error fetching animator clips:', error)
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
