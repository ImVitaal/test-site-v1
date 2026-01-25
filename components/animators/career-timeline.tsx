'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface TimelineEntry {
  year: number
  works: {
    animeTitle: string
    animeSlug: string
    role: string
    clipCount: number
  }[]
}

interface CareerTimelineProps {
  timeline: TimelineEntry[]
  className?: string
}

export function CareerTimeline({ timeline, className }: CareerTimelineProps) {
  if (timeline.length === 0) {
    return (
      <div className="text-center py-8 text-foreground-muted">
        No timeline data available yet.
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Horizontal scrollable container */}
      <div className="overflow-x-auto no-scrollbar pb-4">
        <div className="flex gap-8 min-w-max px-4">
          {timeline.map((entry, index) => (
            <div key={entry.year} className="flex flex-col items-center">
              {/* Year marker */}
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-accent z-10 relative" />
                {index < timeline.length - 1 && (
                  <div className="absolute top-2 left-4 w-24 h-px bg-border" />
                )}
              </div>

              {/* Year label */}
              <p className="mt-2 font-bold text-foreground">{entry.year}</p>

              {/* Works */}
              <div className="mt-4 space-y-2 w-40">
                {entry.works.slice(0, 3).map((work) => (
                  <Link
                    key={work.animeSlug}
                    href={`/clips?anime=${work.animeSlug}`}
                    className="block p-2 rounded-md bg-surface hover:bg-surface-hover transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground truncate">
                      {work.animeTitle}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {work.clipCount} {work.clipCount === 1 ? 'clip' : 'clips'}
                    </p>
                  </Link>
                ))}
                {entry.works.length > 3 && (
                  <p className="text-xs text-foreground-muted text-center">
                    +{entry.works.length - 3} more
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
