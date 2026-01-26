'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import {
  useInfluenceGraph,
  useRelationsList,
  useRelationStats,
  useGraphMetrics,
} from '@/lib/hooks/use-influence-graph'
import { InfluenceGraph } from './influence-graph'
import { RelationsList } from './relations-list'

interface InfluenceSectionProps {
  animatorSlug: string
  className?: string
}

type ViewMode = 'graph' | 'list'

export function InfluenceSection({
  animatorSlug,
  className,
}: InfluenceSectionProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [viewMode, setViewMode] = useState<ViewMode>(isMobile ? 'list' : 'graph')
  const [depth, setDepth] = useState(2)

  // Fetch data based on view mode
  const {
    data: graphData,
    isLoading: graphLoading,
    error: graphError,
  } = useInfluenceGraph(animatorSlug, { depth, maxNodes: 30 })

  const {
    data: listData,
    isLoading: listLoading,
    error: listError,
  } = useRelationsList(animatorSlug)

  const { data: stats } = useRelationStats(animatorSlug)
  const metrics = useGraphMetrics(graphData)

  const isLoading = viewMode === 'graph' ? graphLoading : listLoading
  const error = viewMode === 'graph' ? graphError : listError

  if (error) {
    return (
      <div className={cn('card p-6', className)}>
        <div className="text-center text-foreground-muted">
          <p>Unable to load connections</p>
          <p className="text-sm mt-1">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('card p-6', className)}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Influence Network</h2>
          {stats && (
            <p className="text-sm text-foreground-muted mt-1">
              {stats.totalConnections} connections
              {stats.mentorCount > 0 && ` · ${stats.mentorCount} mentors`}
              {stats.studentCount > 0 && ` · ${stats.studentCount} students`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-lg bg-surface-secondary p-1">
            <button
              onClick={() => setViewMode('graph')}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                viewMode === 'graph'
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-foreground-muted hover:text-foreground'
              )}
            >
              Graph
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-foreground-muted hover:text-foreground'
              )}
            >
              List
            </button>
          </div>

          {/* Depth control (graph only) */}
          {viewMode === 'graph' && (
            <select
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="bg-surface-secondary text-sm rounded-lg px-3 py-1.5 border-0 focus:ring-2 focus:ring-accent"
            >
              <option value={1}>1 level</option>
              <option value={2}>2 levels</option>
              <option value={3}>3 levels</option>
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent" />
        </div>
      ) : viewMode === 'graph' && graphData ? (
        <>
          <InfluenceGraph data={graphData} />
          {metrics.nodeCount > 0 && (
            <div className="mt-4 pt-4 border-t border-surface-secondary text-sm text-foreground-muted text-center">
              Showing {metrics.nodeCount} animators with {metrics.linkCount}{' '}
              connections
            </div>
          )}
        </>
      ) : listData ? (
        <RelationsList data={listData} currentAnimatorSlug={animatorSlug} />
      ) : (
        <div className="text-center py-16 text-foreground-muted">
          <p>No connections found</p>
          <p className="text-sm mt-1">
            This animator has no known relationships in our database
          </p>
        </div>
      )}
    </div>
  )
}
