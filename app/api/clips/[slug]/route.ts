import { NextRequest, NextResponse } from 'next/server'
import { getClipBySlug, incrementClipViews } from '@/lib/db/queries/clips'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const clip = await getClipBySlug(params.slug)

    if (!clip) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Clip not found',
            details: { slug: params.slug },
          },
        },
        { status: 404 }
      )
    }

    // Increment view count (fire and forget)
    incrementClipViews(clip.id).catch(console.error)

    return NextResponse.json({
      success: true,
      data: clip,
    })
  } catch (error) {
    console.error('Error fetching clip:', error)
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
