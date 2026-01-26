import { NextRequest, NextResponse } from 'next/server'
import { getRankingListBySlug, getUserVotesForList } from '@/lib/db/queries/rankings'
import { getServerSession } from 'next-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const list = await getRankingListBySlug(params.slug)

    if (!list) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Ranking list not found',
            details: { slug: params.slug },
          },
        },
        { status: 404 }
      )
    }

    // Get user's votes if logged in
    let userVotes: string[] = []
    try {
      const session = await getServerSession()
      if (session?.user?.email) {
        // For now, we'll skip user votes - will be added with auth
        // userVotes = await getUserVotesForList(session.user.id, list.id)
      }
    } catch {
      // Session not available, continue without votes
    }

    return NextResponse.json({
      success: true,
      data: {
        ...list,
        userVotes,
      },
    })
  } catch (error) {
    console.error('Error fetching ranking list:', error)
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
