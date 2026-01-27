import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

/**
 * GET /api/animators/rising
 * Returns rising star animators - animators with recent clip activity
 * who are gaining traction.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 10)

    // Get animators who have had clips added in the last 30 days
    // and sort by recent activity and engagement
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const animators = await prisma.animator.findMany({
      where: {
        photoUrl: { not: null },
        attributions: {
          some: {
            clip: {
              submissionStatus: 'APPROVED',
              createdAt: {
                gte: thirtyDaysAgo,
              },
            },
          },
        },
      },
      include: {
        _count: {
          select: {
            attributions: {
              where: {
                clip: {
                  submissionStatus: 'APPROVED',
                  createdAt: {
                    gte: thirtyDaysAgo,
                  },
                },
              },
            },
          },
        },
        attributions: {
          where: {
            clip: {
              submissionStatus: 'APPROVED',
            },
          },
          orderBy: {
            clip: {
              createdAt: 'desc',
            },
          },
          take: 1,
          include: {
            clip: {
              select: {
                id: true,
                slug: true,
                title: true,
                thumbnailUrl: true,
                viewCount: true,
                favoriteCount: true,
                anime: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        attributions: {
          _count: 'desc',
        },
      },
      take: limit,
    })

    const risingStars = animators.map((animator) => ({
      id: animator.id,
      slug: animator.slug,
      name: animator.name,
      nativeName: animator.nativeName,
      photoUrl: animator.photoUrl,
      recentClipCount: animator._count.attributions,
      latestClip: animator.attributions[0]?.clip || null,
    }))

    return NextResponse.json({
      success: true,
      data: risingStars,
    })
  } catch (error) {
    console.error('Error fetching rising animators:', error)
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
