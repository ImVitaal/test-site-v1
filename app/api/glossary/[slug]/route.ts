import { NextRequest, NextResponse } from 'next/server'
import { getGlossaryTermBySlug, getRelatedTerms } from '@/lib/db/queries/glossary'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const term = await getGlossaryTermBySlug(params.slug)

    if (!term) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Glossary term not found',
          },
        },
        { status: 404 }
      )
    }

    // Fetch related terms if any
    const relatedTerms =
      term.relatedTerms.length > 0
        ? await getRelatedTerms(term.relatedTerms)
        : []

    return NextResponse.json({
      success: true,
      data: {
        ...term,
        relatedTermsData: relatedTerms,
      },
    })
  } catch (error) {
    console.error('Error fetching glossary term:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch glossary term',
        },
      },
      { status: 500 }
    )
  }
}
