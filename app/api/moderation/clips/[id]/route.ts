import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { moderateClip } from '@/lib/db/queries/moderation'
import { moderateClipSchema } from '@/lib/validations/clip'
import { z } from 'zod'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
            message: 'You do not have permission to moderate clips',
          },
        },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { action, reason } = moderateClipSchema.parse(body)

    // Perform moderation action
    const clip = await moderateClip(params.id, session.user.id, action, reason)

    return NextResponse.json({
      success: true,
      data: clip,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Clip not found') {
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

    console.error('Error moderating clip:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to moderate clip',
        },
      },
      { status: 500 }
    )
  }
}
