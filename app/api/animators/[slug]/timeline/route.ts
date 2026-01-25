import { NextRequest, NextResponse } from 'next/server'
import { getAnimatorBySlug, getAnimatorTimeline } from '@/lib/db/queries/animators'

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

    const timeline = await getAnimatorTimeline(animator.id)

    return NextResponse.json({
      success: true,
      data: timeline,
    })
  } catch (error) {
    console.error('Error fetching animator timeline:', error)
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
