import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getModerationStats } from '@/lib/db/queries/moderation'

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
            message: 'You do not have permission to view moderation stats',
          },
        },
        { status: 403 }
      )
    }

    const stats = await getModerationStats(session.user.id)

    return NextResponse.json({
      success: true,
      ...stats,
    })
  } catch (error) {
    console.error('Error fetching moderation stats:', error)
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
