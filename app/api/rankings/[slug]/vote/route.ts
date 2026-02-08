import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth/config'
import { toggleVote } from '@/lib/db/queries/rankings'
import prisma from '@/lib/db/prisma'

const bodySchema = z.object({
  itemId: z.string().min(1),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to vote',
          },
        },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User not found',
          },
        },
        { status: 401 }
      )
    }

    // Parse and validate body
    const body = await request.json()
    const parseResult = bodySchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    const { itemId } = parseResult.data

    // Verify the item belongs to this ranking list
    const item = await prisma.rankingItem.findFirst({
      where: {
        id: itemId,
        list: { slug: params.slug },
      },
    })

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Ranking item not found in this list',
          },
        },
        { status: 404 }
      )
    }

    // Toggle the vote
    const result = await toggleVote(user.id, itemId)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error toggling vote:', error)
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
