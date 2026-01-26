'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useGlossaryTerm } from '@/lib/hooks/use-glossary'
import { cn } from '@/lib/utils/cn'
import { formatDuration } from '@/lib/utils/format'

interface TermTagProps {
  term: string
  slug: string
  className?: string
}

/**
 * A clickable tag that shows a glossary term tooltip on hover/tap
 * Used below video players to explain animation techniques
 */
export function TermTag({ term, slug, className }: TermTagProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: glossaryTerm, isLoading } = useGlossaryTerm(isOpen ? slug : undefined)

  return (
    <div className="relative inline-block">
      <Badge
        variant="outline"
        className={cn(
          'cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors',
          className
        )}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {term}
      </Badge>

      {/* Tooltip */}
      {isOpen && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="bg-surface border border-border rounded-card shadow-card p-4">
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-1/2 bg-surface-hover rounded animate-pulse" />
                <div className="h-3 w-full bg-surface-hover rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-surface-hover rounded animate-pulse" />
              </div>
            ) : glossaryTerm ? (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">{glossaryTerm.term}</h4>
                <p className="text-sm text-foreground-muted line-clamp-3">
                  {glossaryTerm.definition}
                </p>

                {/* Example clip thumbnail */}
                {glossaryTerm.exampleClip && (
                  <div className="flex items-center gap-2 p-2 bg-background rounded-md">
                    <div className="relative w-16 h-9 bg-surface-hover rounded overflow-hidden flex-shrink-0">
                      {glossaryTerm.exampleClip.thumbnailUrl ? (
                        <img
                          src={glossaryTerm.exampleClip.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-foreground-muted">
                          Video
                        </div>
                      )}
                      <span className="absolute bottom-0.5 right-0.5 text-[10px] bg-black/80 text-white px-1 rounded">
                        {formatDuration(glossaryTerm.exampleClip.duration)}
                      </span>
                    </div>
                    <span className="text-xs text-foreground-muted truncate">
                      {glossaryTerm.exampleClip.title}
                    </span>
                  </div>
                )}

                <Link
                  href={`/glossary/${slug}`}
                  className="text-xs text-accent hover:underline inline-flex items-center"
                >
                  Learn more &rarr;
                </Link>
              </div>
            ) : (
              <p className="text-sm text-foreground-muted">Term not found</p>
            )}
          </div>

          {/* Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-surface border-r border-b border-border transform rotate-45" />
        </div>
      )}
    </div>
  )
}
