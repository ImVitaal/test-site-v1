'use client'

import { useState, useMemo } from 'react'
import { TermCard } from './term-card'
import { Skeleton } from '@/components/ui/skeleton'
import { useGlossaryIndex } from '@/lib/hooks/use-glossary'
import { cn } from '@/lib/utils/cn'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

interface GlossaryIndexProps {
  className?: string
}

export function GlossaryIndex({ className }: GlossaryIndexProps) {
  const { data: grouped, isLoading, error } = useGlossaryIndex()
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)

  // Get available letters (those with terms)
  const availableLetters = useMemo(() => {
    if (!grouped) return new Set<string>()
    return new Set(Object.keys(grouped))
  }, [grouped])

  // Filter terms by selected letter
  const displayedTerms = useMemo(() => {
    if (!grouped) return []
    if (selectedLetter) {
      return grouped[selectedLetter] || []
    }
    // If no letter selected, show all
    return Object.values(grouped).flat()
  }, [grouped, selectedLetter])

  if (error) {
    return (
      <div className={cn('text-center py-12', className)}>
        <p className="text-foreground-muted">
          Failed to load glossary. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Alphabet Navigation */}
      <nav className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 border-b border-border mb-6">
        <div className="flex flex-wrap gap-1 justify-center">
          <button
            onClick={() => setSelectedLetter(null)}
            className={cn(
              'px-2 py-1 text-sm rounded transition-colors',
              selectedLetter === null
                ? 'bg-accent text-white'
                : 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
            )}
          >
            All
          </button>
          {ALPHABET.map((letter) => {
            const hasTerms = availableLetters.has(letter)
            return (
              <button
                key={letter}
                onClick={() => hasTerms && setSelectedLetter(letter)}
                disabled={!hasTerms}
                className={cn(
                  'w-8 h-8 text-sm rounded transition-colors',
                  selectedLetter === letter
                    ? 'bg-accent text-white'
                    : hasTerms
                    ? 'text-foreground-muted hover:text-foreground hover:bg-surface-hover'
                    : 'text-foreground-muted/30 cursor-not-allowed'
                )}
              >
                {letter}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Terms Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card p-4 space-y-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : displayedTerms.length > 0 ? (
        <>
          {selectedLetter ? (
            // Single letter view
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedTerms.map((term) => (
                <TermCard
                  key={term.id}
                  slug={term.slug}
                  term={term.term}
                  definition={term.definition}
                />
              ))}
            </div>
          ) : (
            // All letters view with sections
            <div className="space-y-8">
              {ALPHABET.filter((letter) => grouped?.[letter]?.length).map(
                (letter) => (
                  <section key={letter} id={`letter-${letter}`}>
                    <h2 className="font-display text-heading-md text-foreground mb-4 sticky top-16 bg-background py-2">
                      {letter}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grouped?.[letter]?.map((term) => (
                        <TermCard
                          key={term.id}
                          slug={term.slug}
                          term={term.term}
                          definition={term.definition}
                        />
                      ))}
                    </div>
                  </section>
                )
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-foreground-muted">
            {selectedLetter
              ? `No terms starting with "${selectedLetter}"`
              : 'No glossary terms available'}
          </p>
        </div>
      )}
    </div>
  )
}
