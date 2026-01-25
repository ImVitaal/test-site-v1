import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSearchClient, SEARCH_INDEXES } from '@/lib/search/client'
import { errors } from '@/lib/api/errors'

const searchSchema = z.object({
  q: z.string().min(1).max(200),
  index: z.enum(['ANIMATORS', 'CLIPS', 'ANIME', 'TAGS']).default('ANIMATORS'),
  limit: z.coerce.number().int().positive().max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
  filter: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const params = searchSchema.parse({
      q: searchParams.get('q'),
      index: searchParams.get('index'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      filter: searchParams.get('filter'),
    })

    const client = getSearchClient()
    const index = client.index(SEARCH_INDEXES[params.index])

    const results = await index.search(params.q, {
      limit: params.limit,
      offset: params.offset,
      filter: params.filter,
    })

    return NextResponse.json({
      success: true,
      data: {
        hits: results.hits,
        query: results.query,
        processingTimeMs: results.processingTimeMs,
        estimatedTotalHits: results.estimatedTotalHits,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errors.validation(error)
    }

    console.error('Search error:', error)
    return errors.internal(error instanceof Error ? error : undefined)
  }
}
