'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import { useMediaQuery } from '@/lib/hooks/use-media-query'
import type { GraphData, GraphNode, GraphLink } from '@/lib/hooks/use-influence-graph'

interface InfluenceGraphProps {
  data: GraphData
  className?: string
  onNodeClick?: (node: GraphNode) => void
}

interface NodePosition {
  node: GraphNode
  x: number
  y: number
  ring: number
}

const LINK_COLORS: Record<GraphLink['type'], string> = {
  mentored_by: 'stroke-blue-500',
  mentor_to: 'stroke-green-500',
  colleague: 'stroke-purple-500',
  influenced_by: 'stroke-amber-500',
}

const LINK_LABELS: Record<GraphLink['type'], string> = {
  mentored_by: 'Mentored by',
  mentor_to: 'Mentor to',
  colleague: 'Colleague',
  influenced_by: 'Influenced by',
}

export function InfluenceGraph({
  data,
  className,
  onNodeClick,
}: InfluenceGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Calculate node positions in concentric circles
  const nodePositions = useMemo(() => {
    const positions: NodePosition[] = []
    const centerX = 200
    const centerY = 200
    const ringSpacing = isMobile ? 60 : 80

    // Find the current (center) node
    const centerNode = data.nodes.find((n) => n.isCurrent)
    if (!centerNode) return positions

    positions.push({
      node: centerNode,
      x: centerX,
      y: centerY,
      ring: 0,
    })

    // Group remaining nodes by distance from center
    const otherNodes = data.nodes.filter((n) => !n.isCurrent)
    const nodesPerRing = isMobile ? 6 : 8

    otherNodes.forEach((node, index) => {
      const ring = Math.floor(index / nodesPerRing) + 1
      const posInRing = index % nodesPerRing
      const nodesInThisRing = Math.min(
        nodesPerRing,
        otherNodes.length - (ring - 1) * nodesPerRing
      )
      const angle = (2 * Math.PI * posInRing) / nodesInThisRing - Math.PI / 2

      positions.push({
        node,
        x: centerX + Math.cos(angle) * (ringSpacing * ring),
        y: centerY + Math.sin(angle) * (ringSpacing * ring),
        ring,
      })
    })

    return positions
  }, [data.nodes, isMobile])

  // Get position for a node by ID
  const getPosition = useCallback(
    (nodeId: string) => {
      return nodePositions.find((p) => p.node.id === nodeId)
    },
    [nodePositions]
  )

  // Filter links to only show relevant ones when hovering
  const visibleLinks = useMemo(() => {
    if (!hoveredNode && !selectedNode) return data.links

    const activeNode = selectedNode || hoveredNode
    return data.links.filter(
      (link) => link.source === activeNode || link.target === activeNode
    )
  }, [data.links, hoveredNode, selectedNode])

  // Get connections for the hovered/selected node
  const activeConnections = useMemo(() => {
    const activeNode = selectedNode || hoveredNode
    if (!activeNode) return []

    return data.links
      .filter((link) => link.source === activeNode || link.target === activeNode)
      .map((link) => {
        const connectedId =
          link.source === activeNode ? link.target : link.source
        const connectedNode = data.nodes.find((n) => n.id === connectedId)
        return {
          node: connectedNode,
          type: link.type,
        }
      })
  }, [data.links, data.nodes, hoveredNode, selectedNode])

  const handleNodeClick = (node: GraphNode) => {
    if (node.isCurrent) return

    if (selectedNode === node.id) {
      setSelectedNode(null)
    } else {
      setSelectedNode(node.id)
      onNodeClick?.(node)
    }
  }

  const svgSize = isMobile ? 300 : 400
  const scale = svgSize / 400

  return (
    <div className={cn('relative', className)}>
      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        {Object.entries(LINK_LABELS).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className={cn(
                'w-4 h-0.5',
                LINK_COLORS[type as GraphLink['type']].replace('stroke-', 'bg-')
              )}
            />
            <span className="text-foreground-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* SVG Graph */}
      <div className="relative flex justify-center">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="overflow-visible"
        >
          {/* Links */}
          <g className="links">
            {visibleLinks.map((link, index) => {
              const source = getPosition(link.source)
              const target = getPosition(link.target)
              if (!source || !target) return null

              const isActive =
                hoveredNode === link.source ||
                hoveredNode === link.target ||
                selectedNode === link.source ||
                selectedNode === link.target

              return (
                <line
                  key={`${link.source}-${link.target}-${index}`}
                  x1={source.x * scale}
                  y1={source.y * scale}
                  x2={target.x * scale}
                  y2={target.y * scale}
                  className={cn(
                    LINK_COLORS[link.type],
                    'transition-opacity duration-200',
                    isActive ? 'opacity-100' : 'opacity-30'
                  )}
                  strokeWidth={isActive ? 2 : 1}
                />
              )
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {nodePositions.map(({ node, x, y }) => {
              const isCenter = node.isCurrent
              const isHovered = hoveredNode === node.id
              const isSelected = selectedNode === node.id
              const isConnected = activeConnections.some(
                (c) => c.node?.id === node.id
              )
              const isActive = isCenter || isHovered || isSelected || isConnected
              const size = isCenter ? 28 : isActive ? 22 : 18

              return (
                <g
                  key={node.id}
                  transform={`translate(${x * scale}, ${y * scale})`}
                  onMouseEnter={() => !isMobile && setHoveredNode(node.id)}
                  onMouseLeave={() => !isMobile && setHoveredNode(null)}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer"
                >
                  {/* Node circle */}
                  <circle
                    r={size}
                    className={cn(
                      'transition-all duration-200',
                      isCenter
                        ? 'fill-accent stroke-accent'
                        : isActive
                        ? 'fill-surface-secondary stroke-accent'
                        : 'fill-surface stroke-surface-secondary'
                    )}
                    strokeWidth={isActive ? 2 : 1}
                  />

                  {/* Node avatar or initial */}
                  {node.photoUrl ? (
                    <clipPath id={`clip-${node.id}`}>
                      <circle r={size - 2} />
                    </clipPath>
                  ) : (
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      className={cn(
                        'text-xs font-medium pointer-events-none',
                        isCenter ? 'fill-white' : 'fill-foreground'
                      )}
                    >
                      {node.name.charAt(0).toUpperCase()}
                    </text>
                  )}

                  {/* Name label (shown on hover/select) */}
                  {(isHovered || isSelected || isCenter) && (
                    <text
                      y={size + 14}
                      textAnchor="middle"
                      className="text-[10px] fill-foreground pointer-events-none"
                    >
                      {node.name.length > 12
                        ? `${node.name.slice(0, 12)}...`
                        : node.name}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {/* Active node details panel */}
      {(selectedNode || hoveredNode) && (
        <div className="mt-4 p-4 bg-surface-secondary rounded-lg">
          {(() => {
            const activeId = selectedNode || hoveredNode
            const activeNode = data.nodes.find((n) => n.id === activeId)
            if (!activeNode) return null

            return (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-surface flex-shrink-0">
                    {activeNode.photoUrl ? (
                      <Image
                        src={activeNode.photoUrl}
                        alt={activeNode.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground-muted text-lg">
                        {activeNode.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/animators/${activeNode.slug}`}
                      className="font-semibold hover:text-accent transition-colors"
                    >
                      {activeNode.name}
                    </Link>
                    {activeNode.nativeName && (
                      <p className="text-sm text-foreground-muted">
                        {activeNode.nativeName}
                      </p>
                    )}
                  </div>
                </div>

                {activeConnections.length > 0 && (
                  <div className="text-sm">
                    <p className="text-foreground-muted mb-1">Connections:</p>
                    <div className="flex flex-wrap gap-1">
                      {activeConnections.slice(0, 5).map((conn, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface rounded text-xs"
                        >
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full',
                              LINK_COLORS[conn.type].replace('stroke-', 'bg-')
                            )}
                          />
                          {conn.node?.name}
                        </span>
                      ))}
                      {activeConnections.length > 5 && (
                        <span className="text-xs text-foreground-muted px-2 py-0.5">
                          +{activeConnections.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* Instructions */}
      <p className="mt-3 text-xs text-foreground-muted text-center">
        {isMobile
          ? 'Tap a node to see connections'
          : 'Hover over nodes to explore connections. Click to select.'}
      </p>
    </div>
  )
}
