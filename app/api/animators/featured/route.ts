import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

/**
 * GET /api/animators/featured
 * Returns a featured animator for the homepage hero section.
 * Uses a weekly rotation based on the current week number.
 */
export async function GET() {
  try {
    // Get the current week of the year for rotation
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)
    const weekNumber = Math.ceil(
      ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
    )

    // Get animators with photos and clips, ordered by favorites
    const animators = await prisma.animator.findMany({
      where: {
        photoUrl: { not: null },
        attributions: {
          some: {
            clip: {
              submissionStatus: 'APPROVED',
            },
          },
        },
      },
      include: {
        _count: {
          select: {
            attributions: true,
            favorites: true,
          },
        },
        attributions: {
          where: {
            clip: {
              submissionStatus: 'APPROVED',
            },
          },
          take: 1,
          orderBy: {
            clip: {
              favoriteCount: 'desc',
            },
          },
          include: {
            clip: {
              select: {
                id: true,
                slug: true,
                title: true,
                thumbnailUrl: true,
                videoUrl: true,
                duration: true,
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
      orderBy: [
        { favorites: { _count: 'desc' } },
        { attributions: { _count: 'desc' } },
      ],
      take: 52, // Get enough for yearly rotation
    })

    if (animators.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'No featured animator available',
          },
        },
        { status: 404 }
      )
    }

    // Select animator based on week number
    const selectedIndex = weekNumber % animators.length
    const featured = animators[selectedIndex]
    const signatureClip = featured.attributions[0]?.clip || null

    return NextResponse.json({
      success: true,
      data: {
        id: featured.id,
        slug: featured.slug,
        name: featured.name,
        nativeName: featured.nativeName,
        bio: featured.bio,
        photoUrl: featured.photoUrl,
        clipCount: featured._count.attributions,
        favoriteCount: featured._count.favorites,
        signatureClip,
      },
    })
  } catch (error) {
    console.error('Error fetching featured animator:', error)
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
