import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db/prisma'
import {
  getInfluenceGraph,
  getRelationsGrouped,
  getRelationStats,
} from '@/lib/db/queries/relations'

const querySchema = z.object({
  view: z.enum(['graph', 'list', 'stats']).default('graph'),
  depth: z.coerce.number().min(1).max(3).default(2),
  maxNodes: z.coerce.number().min(5).max(50).default(30),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Find animator by slug first
    const animator = await prisma.animator.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    })

    if (!animator) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Animator not found',
            details: { slug: params.slug },
          },
        },
        { status: 404 }
      )
    }

    // Parse query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const parseResult = querySchema.safeParse(searchParams)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: parseResult.error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    const { view, depth, maxNodes } = parseResult.data

    // Return data based on view type
    switch (view) {
      case 'graph': {
        const graphData = await getInfluenceGraph(animator.id, depth, maxNodes)
        return NextResponse.json({
          success: true,
          data: graphData,
        })
      }
      case 'list': {
        const groupedData = await getRelationsGrouped(animator.id)
        return NextResponse.json({
          success: true,
          data: groupedData,
        })
      }
      case 'stats': {
        const stats = await getRelationStats(animator.id)
        return NextResponse.json({
          success: true,
          data: stats,
        })
      }
    }
  } catch (error) {
    console.error('Error fetching animator relations:', error)
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
