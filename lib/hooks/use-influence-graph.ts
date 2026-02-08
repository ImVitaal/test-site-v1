import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  GraphData,
  GraphNode,
  GraphLink,
  RelationsGrouped,
} from '@/lib/db/queries/relations'

// Re-export types for components
export type { GraphData, GraphNode, GraphLink, RelationsGrouped }

interface RelationStatsData {
  mentorCount: number
  studentCount: number
  colleagueCount: number
  totalConnections: number
}

interface GraphResponse {
  success: true
  data: GraphData
}

interface ListResponse {
  success: true
  data: RelationsGrouped
}

interface StatsResponse {
  success: true
  data: RelationStatsData
}

interface UseInfluenceGraphOptions {
  depth?: number
  maxNodes?: number
}

// Query key factory
export const influenceGraphKeys = {
  all: ['influence-graph'] as const,
  graphs: () => [...influenceGraphKeys.all, 'graph'] as const,
  graph: (slug: string, options?: UseInfluenceGraphOptions) =>
    [...influenceGraphKeys.graphs(), slug, options] as const,
  lists: () => [...influenceGraphKeys.all, 'list'] as const,
  list: (slug: string) => [...influenceGraphKeys.lists(), slug] as const,
  stats: () => [...influenceGraphKeys.all, 'stats'] as const,
  stat: (slug: string) => [...influenceGraphKeys.stats(), slug] as const,
}

/**
 * Fetch influence graph data for visualization
 */
export function useInfluenceGraph(
  slug: string | undefined,
  options: UseInfluenceGraphOptions = {}
) {
  const { depth = 2, maxNodes = 30 } = options

  return useQuery({
    queryKey: influenceGraphKeys.graph(slug!, { depth, maxNodes }),
    queryFn: () =>
      api.get<GraphResponse>(`/animators/${slug}/relations`, {
        view: 'graph',
        depth,
        maxNodes,
      }),
    select: (data) => data.data,
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

/**
 * Fetch relations as a grouped list (for mobile/accessibility fallback)
 */
export function useRelationsList(slug: string | undefined) {
  return useQuery({
    queryKey: influenceGraphKeys.list(slug!),
    queryFn: () =>
      api.get<ListResponse>(`/animators/${slug}/relations`, {
        view: 'list',
      }),
    select: (data) => data.data,
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Fetch basic relation stats for preview/summary
 */
export function useRelationStats(slug: string | undefined) {
  return useQuery({
    queryKey: influenceGraphKeys.stat(slug!),
    queryFn: () =>
      api.get<StatsResponse>(`/animators/${slug}/relations`, {
        view: 'stats',
      }),
    select: (data) => data.data,
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to get graph statistics for display
 */
export function useGraphMetrics(graphData: GraphData | undefined) {
  if (!graphData) {
    return {
      nodeCount: 0,
      linkCount: 0,
      mentorLinks: 0,
      studentLinks: 0,
      colleagueLinks: 0,
    }
  }

  const mentorLinks = graphData.links.filter(
    (l) => l.type === 'mentored_by'
  ).length
  const studentLinks = graphData.links.filter(
    (l) => l.type === 'mentor_to'
  ).length
  const colleagueLinks = graphData.links.filter(
    (l) => l.type === 'colleague'
  ).length

  return {
    nodeCount: graphData.nodes.length,
    linkCount: graphData.links.length,
    mentorLinks,
    studentLinks,
    colleagueLinks,
  }
}
