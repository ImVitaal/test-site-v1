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
      // Fetch outgoing relations (this animator is the mentor/source)
      const outgoing = await prisma.animatorRelation.findMany({
        where: { mentorId: currentId },
        select: {
          studentId: true,
          relationType: true,
        },
      })

      // Fetch incoming relations (this animator is the student/target)
      const incoming = await prisma.animatorRelation.findMany({
        where: { studentId: currentId },
        select: {
          mentorId: true,
          relationType: true,
        },
      })

      // Process outgoing (mentor -> student)
      for (const rel of outgoing) {
        if (!visited.has(rel.studentId) && nodes.length < maxNodes) {
          visited.add(rel.studentId)
          queue.push([rel.studentId, currentDepth + 1])
        }

        // Add link
        links.push({
          source: currentId,
          target: rel.studentId,
          type: 'mentor_to',
        })
      }

      // Process incoming (student <- mentor)
      for (const rel of incoming) {
        if (!visited.has(rel.mentorId) && nodes.length < maxNodes) {
          visited.add(rel.mentorId)
          queue.push([rel.mentorId, currentDepth + 1])
        }

        // Add link
        links.push({
          source: currentId,
          target: rel.mentorId,
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
  // Get relations where this animator is the student (mentors)
  const mentorRelations = await prisma.animatorRelation.findMany({
    where: {
      studentId: animatorId,
      relationType: { in: ['mentor', 'influenced_by'] },
    },
    include: {
      mentor: {
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

  // Get relations where this animator is the mentor (students)
  const studentRelations = await prisma.animatorRelation.findMany({
    where: {
      mentorId: animatorId,
      relationType: { in: ['mentor', 'influenced_by'] },
    },
    include: {
      student: {
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
        { mentorId: animatorId, relationType: 'colleague' },
        { studentId: animatorId, relationType: 'colleague' },
      ],
    },
    include: {
      mentor: {
        select: {
          id: true,
          slug: true,
          name: true,
          nativeName: true,
          photoUrl: true,
        },
      },
      student: {
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
  const countSharedWorks = async (animator1Id: string, animator2Id: string) => {
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
    mentorRelations.map(async (rel) => ({
      ...rel.mentor,
      relationType: rel.relationType,
      sharedWorksCount: await countSharedWorks(animatorId, rel.mentor.id),
    }))
  )

  const students: RelationListItem[] = await Promise.all(
    studentRelations.map(async (rel) => ({
      ...rel.student,
      relationType: rel.relationType,
      sharedWorksCount: await countSharedWorks(animatorId, rel.student.id),
    }))
  )

  const colleagues: RelationListItem[] = await Promise.all(
    colleagueRelations.map(async (rel) => {
      const colleague =
        rel.mentorId === animatorId ? rel.student : rel.mentor
      return {
        ...colleague,
        relationType: 'colleague',
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
      where: { studentId: animatorId },
    }),
    prisma.animatorRelation.count({
      where: { mentorId: animatorId },
    }),
    prisma.animatorRelation.count({
      where: {
        relationType: 'colleague',
        OR: [{ mentorId: animatorId }, { studentId: animatorId }],
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
