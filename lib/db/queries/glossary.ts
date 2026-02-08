import prisma from '@/lib/db/prisma'

export interface GlossaryTerm {
  id: string
  slug: string
  term: string
  definition: string
  exampleClipId: string | null
  relatedTerms: string[]
  createdAt: Date
  updatedAt: Date
}

export interface GlossaryTermWithExample extends GlossaryTerm {
  exampleClip: {
    id: string
    slug: string
    title: string
    thumbnailUrl: string | null
    duration: number
  } | null
}

interface GlossarySearchParams {
  q?: string
  letter?: string
  limit?: number
  offset?: number
}

/**
 * Get all glossary terms, optionally filtered
 */
export async function getGlossaryTerms(params: GlossarySearchParams = {}): Promise<{
  data: GlossaryTerm[]
  total: number
}> {
  const { q, letter, limit = 100, offset = 0 } = params

  const where = {
    ...(q && {
      OR: [
        { term: { contains: q, mode: 'insensitive' as const } },
        { definition: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
    ...(letter && {
      term: { startsWith: letter, mode: 'insensitive' as const },
    }),
  }

  const [terms, total] = await Promise.all([
    prisma.glossaryTerm.findMany({
      where,
      orderBy: { term: 'asc' },
      skip: offset,
      take: limit,
    }),
    prisma.glossaryTerm.count({ where }),
  ])

  return { data: terms, total }
}

/**
 * Get a single glossary term by slug with example clip
 */
export async function getGlossaryTermBySlug(
  slug: string
): Promise<GlossaryTermWithExample | null> {
  const term = await prisma.glossaryTerm.findUnique({
    where: { slug },
  })

  if (!term) return null

  // Fetch example clip if exists
  let exampleClip = null
  if (term.exampleClipId) {
    exampleClip = await prisma.clip.findUnique({
      where: { id: term.exampleClipId },
      select: {
        id: true,
        slug: true,
        title: true,
        thumbnailUrl: true,
        duration: true,
      },
    })
  }

  return {
    ...term,
    exampleClip,
  }
}

/**
 * Get glossary terms grouped by first letter
 */
export async function getGlossaryIndex(): Promise<Record<string, GlossaryTerm[]>> {
  const terms = await prisma.glossaryTerm.findMany({
    orderBy: { term: 'asc' },
  })

  // Group by first letter
  const grouped = terms.reduce((acc: Record<string, GlossaryTerm[]>, term: GlossaryTerm) => {
    const letter = term.term[0].toUpperCase()
    if (!acc[letter]) {
      acc[letter] = []
    }
    acc[letter].push(term)
    return acc
  }, {} as Record<string, GlossaryTerm[]>)

  return grouped
}

/**
 * Get related terms for a glossary term
 */
export async function getRelatedTerms(slugs: string[]): Promise<GlossaryTerm[]> {
  if (slugs.length === 0) return []

  return prisma.glossaryTerm.findMany({
    where: {
      slug: { in: slugs },
    },
    orderBy: { term: 'asc' },
  })
}

/**
 * Search glossary terms (for autocomplete)
 */
export async function searchGlossaryTerms(
  query: string,
  limit = 10
): Promise<Pick<GlossaryTerm, 'slug' | 'term'>[]> {
  return prisma.glossaryTerm.findMany({
    where: {
      OR: [
        { term: { contains: query, mode: 'insensitive' } },
        { definition: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      slug: true,
      term: true,
    },
    orderBy: { term: 'asc' },
    take: limit,
  })
}
