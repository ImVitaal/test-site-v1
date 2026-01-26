import { NextRequest, NextResponse } from 'next/server'
import { getGlossaryTerms, getGlossaryIndex } from '@/lib/db/queries/glossary'
import { z } from 'zod'

const glossaryQuerySchema = z.object({
  q: z.string().optional(),
  letter: z.string().length(1).optional(),
  limit: z.coerce.number().min(1).max(200).optional().default(100),
  offset: z.coerce.number().min(0).optional().default(0),
  grouped: z.enum(['true', 'false']).optional().default('false'),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = glossaryQuerySchema.parse({
      q: searchParams.get('q') ?? undefined,
      letter: searchParams.get('letter') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
      grouped: searchParams.get('grouped') ?? undefined,
    })

    // Return grouped by letter if requested
    if (params.grouped === 'true') {
      const grouped = await getGlossaryIndex()
      return NextResponse.json({
        success: true,
        data: grouped,
      })
    }

    // Return flat list with pagination
    const result = await getGlossaryTerms({
      q: params.q,
      letter: params.letter,
      limit: params.limit,
      offset: params.offset,
    })

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        limit: params.limit,
        offset: params.offset,
        hasMore: params.offset + params.limit < result.total,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    console.error('Error fetching glossary terms:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch glossary terms',
        },
      },
      { status: 500 }
    )
  }
}
