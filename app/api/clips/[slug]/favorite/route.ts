import { NextRequest, NextResponse } from 'next/server'
import { getClipBySlug, toggleFavorite, isClipFavorited } from '@/lib/db/queries/clips'
import { getSession } from '@/lib/auth/utils'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to favorite clips',
          },
        },
        { status: 401 }
      )
    }

    const clip = await getClipBySlug(params.slug)

    if (!clip) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Clip not found',
          },
        },
        { status: 404 }
      )
    }

    const result = await toggleFavorite(session.user.id, clip.id)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error toggling favorite:', error)
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

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({
        success: true,
        data: { favorited: false },
      })
    }

    const clip = await getClipBySlug(params.slug)

    if (!clip) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Clip not found',
          },
        },
        { status: 404 }
      )
    }

    const favorited = await isClipFavorited(session.user.id, clip.id)

    return NextResponse.json({
      success: true,
      data: { favorited },
    })
  } catch (error) {
    console.error('Error checking favorite:', error)
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
