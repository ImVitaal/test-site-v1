import prisma from '@/lib/db/prisma'

/**
 * Types for the influence graph
 */
export interface GraphNode {
  id: string
  slug: string
  name: string
  nativeName: string | null
  photoUrl: string | null
  isCurrent: boolean
}

export interface GraphLink {
  source: string
  target: string
  type: 'mentored_by' | 'mentor_to' | 'colleague' | 'influenced_by'
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export interface RelationListItem {
  id: string
  slug: string
  name: string
  nativeName: string | null
  photoUrl: string | null
  relationType: string
  sharedWorksCount: number
}

export interface RelationsGrouped {
  mentors: RelationListItem[]
  students: RelationListItem[]
  colleagues: RelationListItem[]
}

/**
 * Get influence graph data for an animator
 * Uses BFS to traverse relationships to a specified depth
 */
export async function getInfluenceGraph(
  animatorId: string,
  depth = 2,
  maxNodes = 30
): Promise<GraphData> {
  const visited = new Set<string>()
  const nodes: GraphNode[] = []
  const links: GraphLink[] = []

  // BFS queue: [animatorId, currentDepth]
  const queue: [string, number][] = [[animatorId, 0]]
  visited.add(animatorId)

  while (queue.length > 0 && nodes.length < maxNodes) {
    const [currentId, currentDepth] = queue.shift()!

    // Fetch animator data
    const animator = await prisma.animator.findUnique({
      where: { id: currentId },
      select: {
        id: true,
        slug: true,
        name: true,
        nativeName: true,
        photoUrl: true,
      },
    })

    if (!animator) continue

    nodes.push({
      ...animator,
      isCurrent: currentId === animatorId,
    })

    // If we haven't reached max depth, fetch relations
    if (currentDepth < depth) {
      // Fetch outgoing relations (this animator is the source)
      const outgoing = await prisma.animatorRelation.findMany({
        where: { sourceId: currentId },
        select: {
          targetId: true,
          relationType: true,
        },
      })

      // Fetch incoming relations (this animator is the target)
      const incoming = await prisma.animatorRelation.findMany({
        where: { targetId: currentId },
        select: {
          sourceId: true,
          relationType: true,
        },
      })

      // Process outgoing (source -> target)
      for (const rel of outgoing) {
        if (!visited.has(rel.targetId) && nodes.length < maxNodes) {
          visited.add(rel.targetId)
          queue.push([rel.targetId, currentDepth + 1])
        }

        // Add link
        links.push({
          source: currentId,
          target: rel.targetId,
          type: 'mentor_to',
        })
      }

      // Process incoming (target <- source)
      for (const rel of incoming) {
        if (!visited.has(rel.sourceId) && nodes.length < maxNodes) {
          visited.add(rel.sourceId)
          queue.push([rel.sourceId, currentDepth + 1])
        }

        // Add link
        links.push({
          source: currentId,
          target: rel.sourceId,
          type: 'mentored_by',
        })
      }
    }
  }

  return { nodes, links }
}

/**
 * Get relations grouped by type (for list view fallback)
 */
export async function getRelationsGrouped(animatorId: string): Promise<RelationsGrouped> {
  // Get relations where this animator is the target (mentors/influences)
  const mentorRelations = await prisma.animatorRelation.findMany({
    where: {
      targetId: animatorId,
      relationType: { in: ['MENTOR', 'INFLUENCED_BY'] },
    },
    include: {
      source: {
        select: {
          id: true,
          slug: true,
          name: true,
          nativeName: true,
          photoUrl: true,
        },
      },
    },
  })

  // Get relations where this animator is the source (students)
  const studentRelations = await prisma.animatorRelation.findMany({
    where: {
      sourceId: animatorId,
      relationType: { in: ['MENTOR', 'INFLUENCED_BY'] },
    },
    include: {
      target: {
        select: {
          id: true,
          slug: true,
          name: true,
          nativeName: true,
          photoUrl: true,
        },
      },
    },
  })

  // Get colleague relations
  const colleagueRelations = await prisma.animatorRelation.findMany({
    where: {
      OR: [
        { sourceId: animatorId, relationType: 'COLLEAGUE' },
        { targetId: animatorId, relationType: 'COLLEAGUE' },
      ],
    },
    include: {
      source: {
        select: {
          id: true,
          slug: true,
          name: true,
          nativeName: true,
          photoUrl: true,
        },
      },
      target: {
        select: {
          id: true,
          slug: true,
          name: true,
          nativeName: true,
          photoUrl: true,
        },
      },
    },
  })

  // Count shared works (clips with both animators)
  const countSharedWorks = async (animator1Id: string, animator2Id: string): Promise<number> => {
    const count = await prisma.clip.count({
      where: {
        attributions: {
          some: { animatorId: animator1Id },
        },
        AND: {
          attributions: {
            some: { animatorId: animator2Id },
          },
        },
      },
    })
    return count
  }

  // Transform to list items
  const mentors: RelationListItem[] = await Promise.all(
    mentorRelations.map(async (rel: typeof mentorRelations[number]) => ({
      ...rel.source,
      relationType: rel.relationType,
      sharedWorksCount: await countSharedWorks(animatorId, rel.source.id),
    }))
  )

  const students: RelationListItem[] = await Promise.all(
    studentRelations.map(async (rel: typeof studentRelations[number]) => ({
      ...rel.target,
      relationType: rel.relationType,
      sharedWorksCount: await countSharedWorks(animatorId, rel.target.id),
    }))
  )

  const colleagues: RelationListItem[] = await Promise.all(
    colleagueRelations.map(async (rel: typeof colleagueRelations[number]) => {
      const colleague =
        rel.sourceId === animatorId ? rel.target : rel.source
      return {
        ...colleague,
        relationType: 'COLLEAGUE',
        sharedWorksCount: await countSharedWorks(animatorId, colleague.id),
      }
    })
  )

  return { mentors, students, colleagues }
}

/**
 * Get basic relation stats for an animator
 */
export async function getRelationStats(animatorId: string) {
  const [mentorCount, studentCount, colleagueCount] = await Promise.all([
    prisma.animatorRelation.count({
      where: { targetId: animatorId },
    }),
    prisma.animatorRelation.count({
      where: { sourceId: animatorId },
    }),
    prisma.animatorRelation.count({
      where: {
        relationType: 'COLLEAGUE',
        OR: [{ sourceId: animatorId }, { targetId: animatorId }],
      },
    }),
  ])

  return {
    mentorCount,
    studentCount,
    colleagueCount,
    totalConnections: mentorCount + studentCount + colleagueCount,
  }
}
