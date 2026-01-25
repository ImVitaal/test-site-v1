'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, Film, Clock, X, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { useSearchStore } from '@/lib/stores/search-store'
import { api } from '@/lib/api/client'
import { ROUTES } from '@/config/routes'
import type { AnimatorCard } from '@/types/animator'
import type { ClipCard } from '@/types/clip'
import type { PaginatedResponse } from '@/types/api'

interface SearchResults {
  animators: AnimatorCard[]
  clips: ClipCard[]
}

interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<SearchResults>({ animators: [], clips: [] })
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const { recentSearches, addRecentSearch, clearRecentSearches } = useSearchStore()
  const debouncedQuery = useDebounce(query, 200)

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setResults({ animators: [], clips: [] })
      setSelectedIndex(0)
    }
  }, [open])

  // Global keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  // Fetch results
  React.useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults({ animators: [], clips: [] })
      return
    }

    const fetchResults = async () => {
      setIsLoading(true)
      try {
        const [animatorsRes, clipsRes] = await Promise.all([
          api.get<PaginatedResponse<AnimatorCard>>('/animators', { q: debouncedQuery, limit: 4 }),
          api.get<PaginatedResponse<ClipCard>>('/clips', { q: debouncedQuery, limit: 4 }),
        ])

        setResults({
          animators: animatorsRes.data,
          clips: clipsRes.data,
        })
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery])

  // All selectable items
  const allItems = React.useMemo(() => {
    const items: { type: 'animator' | 'clip' | 'search'; data: AnimatorCard | ClipCard | string }[] = []

    results.animators.forEach((a) => items.push({ type: 'animator', data: a }))
    results.clips.forEach((c) => items.push({ type: 'clip', data: c }))

    if (query.trim()) {
      items.push({ type: 'search', data: query })
    }

    return items
  }, [results, query])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onOpenChange(false)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && allItems.length > 0) {
      e.preventDefault()
      handleSelect(allItems[selectedIndex])
    }
  }

  const handleSelect = (item: { type: 'animator' | 'clip' | 'search'; data: AnimatorCard | ClipCard | string }) => {
    if (item.type === 'animator') {
      const animator = item.data as AnimatorCard
      addRecentSearch(animator.name)
      router.push(ROUTES.animators.detail(animator.slug))
    } else if (item.type === 'clip') {
      const clip = item.data as ClipCard
      addRecentSearch(clip.title)
      router.push(ROUTES.clips.detail(clip.slug))
    } else {
      addRecentSearch(item.data as string)
      router.push(`/search?q=${encodeURIComponent(item.data as string)}`)
    }
    onOpenChange(false)
  }

  const handleRecentSearch = (term: string) => {
    setQuery(term)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/80"
            onClick={() => onOpenChange(false)}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-card border border-border bg-surface shadow-2xl">
              {/* Search Input */}
              <div className="flex items-center border-b border-border px-4">
                <Search className="h-5 w-5 shrink-0 text-foreground-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search animators, clips, anime..."
                  className="flex-1 bg-transparent px-4 py-4 text-base text-foreground placeholder:text-foreground-muted focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-foreground-muted hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {!query.trim() && recentSearches.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-xs font-medium text-foreground-muted">Recent Searches</span>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-foreground-muted hover:text-foreground"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleRecentSearch(term)}
                        className="flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm hover:bg-surface-hover"
                      >
                        <Clock className="h-4 w-4 text-foreground-muted" />
                        {term}
                      </button>
                    ))}
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  </div>
                )}

                {!isLoading && query.trim() && (
                  <>
                    {/* Animators */}
                    {results.animators.length > 0 && (
                      <div className="p-2">
                        <span className="px-2 py-1 text-xs font-medium text-foreground-muted">Animators</span>
                        {results.animators.map((animator, i) => (
                          <button
                            key={animator.id}
                            onClick={() => handleSelect({ type: 'animator', data: animator })}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm',
                              selectedIndex === i ? 'bg-surface-hover' : 'hover:bg-surface-hover'
                            )}
                          >
                            <User className="h-4 w-4 shrink-0 text-foreground-muted" />
                            <div className="flex-1 text-left">
                              <span className="font-medium">{animator.name}</span>
                              {animator.nativeName && (
                                <span className="ml-2 text-foreground-muted">{animator.nativeName}</span>
                              )}
                            </div>
                            <span className="text-xs text-foreground-muted">{animator.clipCount} clips</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Clips */}
                    {results.clips.length > 0 && (
                      <div className="p-2">
                        <span className="px-2 py-1 text-xs font-medium text-foreground-muted">Clips</span>
                        {results.clips.map((clip, i) => (
                          <button
                            key={clip.id}
                            onClick={() => handleSelect({ type: 'clip', data: clip })}
                            className={cn(
                              'flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm',
                              selectedIndex === results.animators.length + i
                                ? 'bg-surface-hover'
                                : 'hover:bg-surface-hover'
                            )}
                          >
                            <Film className="h-4 w-4 shrink-0 text-foreground-muted" />
                            <div className="flex-1 text-left">
                              <span className="font-medium">{clip.title}</span>
                              <span className="ml-2 text-foreground-muted">{clip.anime.title}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* View all results */}
                    {query.trim() && (
                      <div className="border-t border-border p-2">
                        <button
                          onClick={() => handleSelect({ type: 'search', data: query })}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-sm px-2 py-2 text-sm',
                            selectedIndex === allItems.length - 1 ? 'bg-surface-hover' : 'hover:bg-surface-hover'
                          )}
                        >
                          <Search className="h-4 w-4 shrink-0 text-foreground-muted" />
                          <span>
                            Search for &quot;<span className="font-medium">{query}</span>&quot;
                          </span>
                          <ArrowRight className="ml-auto h-4 w-4 text-foreground-muted" />
                        </button>
                      </div>
                    )}

                    {/* No results */}
                    {results.animators.length === 0 && results.clips.length === 0 && (
                      <div className="py-8 text-center text-sm text-foreground-muted">
                        No results found for &quot;{query}&quot;
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-foreground-muted">
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-border bg-surface-hover px-1.5 py-0.5">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-border bg-surface-hover px-1.5 py-0.5">Enter</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-border bg-surface-hover px-1.5 py-0.5">Esc</kbd>
                  <span>Close</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
