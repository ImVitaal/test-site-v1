import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

/**
 * GET /api/clips/recent
 * Returns recently added clips for the homepage.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '6'), 12)

    const clips = await prisma.clip.findMany({
      where: {
        submissionStatus: 'APPROVED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        anime: {
          select: {
            title: true,
            slug: true,
          },
        },
        attributions: {
          where: {
            role: 'KEY_ANIMATION',
          },
          take: 1,
          include: {
            animator: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    const recentClips = clips.map((clip) => ({
      id: clip.id,
      slug: clip.slug,
      title: clip.title,
      thumbnailUrl: clip.thumbnailUrl,
      duration: clip.duration,
      viewCount: clip.viewCount,
      favoriteCount: clip.favoriteCount,
      createdAt: clip.createdAt.toISOString(),
      anime: clip.anime,
      primaryAnimator: clip.attributions[0]?.animator || null,
      verificationStatus: clip.attributions[0]?.verificationStatus || 'SPECULATIVE',
    }))

    return NextResponse.json({
      success: true,
      data: recentClips,
    })
  } catch (error) {
    console.error('Error fetching recent clips:', error)
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
