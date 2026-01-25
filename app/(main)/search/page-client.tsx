'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SearchHitCard, SearchFiltersPanel, type SearchFilters } from '@/components/search'
import { api } from '@/lib/api/client'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { useSearchStore } from '@/lib/stores/search-store'
import type { AnimatorCard } from '@/types/animator'
import type { ClipCard } from '@/types/clip'
import type { PaginatedResponse } from '@/types/api'

interface SearchPageClientProps {
  searchParams: {
    q?: string
    type?: string
    verificationStatus?: string
    yearStart?: string
    yearEnd?: string
    page?: string
  }
}

export function SearchPageClient({ searchParams }: SearchPageClientProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const { addRecentSearch } = useSearchStore()

  const [query, setQuery] = React.useState(searchParams.q || '')
  const [filters, setFilters] = React.useState<SearchFilters>({
    type: (searchParams.type as SearchFilters['type']) || 'all',
    verificationStatus: searchParams.verificationStatus as SearchFilters['verificationStatus'],
    yearStart: searchParams.yearStart ? parseInt(searchParams.yearStart) : undefined,
    yearEnd: searchParams.yearEnd ? parseInt(searchParams.yearEnd) : undefined,
  })
  const [page, setPage] = React.useState(parseInt(searchParams.page || '1'))

  const debouncedQuery = useDebounce(query, 300)

  // Update URL when search params change
  React.useEffect(() => {
    const params = new URLSearchParams()

    if (debouncedQuery) params.set('q', debouncedQuery)
    if (filters.type !== 'all') params.set('type', filters.type)
    if (filters.verificationStatus) params.set('verificationStatus', filters.verificationStatus)
    if (filters.yearStart) params.set('yearStart', String(filters.yearStart))
    if (filters.yearEnd) params.set('yearEnd', String(filters.yearEnd))
    if (page > 1) params.set('page', String(page))

    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search'
    router.replace(newUrl, { scroll: false })
  }, [debouncedQuery, filters, page, router])

  // Save recent searches
  React.useEffect(() => {
    if (debouncedQuery.trim()) {
      addRecentSearch(debouncedQuery.trim())
    }
  }, [debouncedQuery, addRecentSearch])

  // Fetch animators
  const animatorsQuery = useQuery({
    queryKey: ['search', 'animators', debouncedQuery, filters, page],
    queryFn: () =>
      api.get<PaginatedResponse<AnimatorCard>>('/animators', {
        q: debouncedQuery,
        page,
        limit: 10,
        activeYearStart: filters.yearStart,
        activeYearEnd: filters.yearEnd,
      }),
    enabled: !!debouncedQuery && (filters.type === 'all' || filters.type === 'animators'),
  })

  // Fetch clips
  const clipsQuery = useQuery({
    queryKey: ['search', 'clips', debouncedQuery, filters, page],
    queryFn: () =>
      api.get<PaginatedResponse<ClipCard>>('/clips', {
        q: debouncedQuery,
        page,
        limit: 10,
        verificationStatus: filters.verificationStatus,
        yearStart: filters.yearStart,
        yearEnd: filters.yearEnd,
      }),
    enabled: !!debouncedQuery && (filters.type === 'all' || filters.type === 'clips'),
  })

  const isLoading = animatorsQuery.isLoading || clipsQuery.isLoading
  const animators = animatorsQuery.data?.data || []
  const clips = clipsQuery.data?.data || []
  const totalAnimators = animatorsQuery.data?.pagination.total || 0
  const totalClips = clipsQuery.data?.pagination.total || 0
  const totalResults = totalAnimators + totalClips

  const hasResults = animators.length > 0 || clips.length > 0
  const showAnimators = filters.type === 'all' || filters.type === 'animators'
  const showClips = filters.type === 'all' || filters.type === 'clips'

  // Calculate pagination
  const currentTotal = filters.type === 'animators'
    ? totalAnimators
    : filters.type === 'clips'
      ? totalClips
      : Math.max(totalAnimators, totalClips)
  const totalPages = Math.ceil(currentTotal / 10)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
      {/* Filters sidebar */}
      <aside>
        <SearchFiltersPanel
          filters={filters}
          onChange={(newFilters) => {
            setFilters(newFilters)
            setPage(1)
          }}
          totalResults={{
            animators: totalAnimators,
            clips: totalClips,
          }}
        />
      </aside>

      {/* Results */}
      <div className="space-y-6">
        {/* Search input */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search animators, clips, anime..."
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        {/* Results count */}
        {debouncedQuery && !isLoading && (
          <p className="text-sm text-foreground-muted">
            Found {totalResults.toLocaleString()} result{totalResults !== 1 ? 's' : ''}
            {filters.type !== 'all' && ` in ${filters.type}`}
          </p>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        )}

        {/* No query */}
        {!debouncedQuery && !isLoading && (
          <div className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-foreground-muted" />
            <h2 className="mt-4 text-lg font-semibold">Start searching</h2>
            <p className="mt-2 text-foreground-muted">
              Enter a search term to find animators, clips, or anime
            </p>
          </div>
        )}

        {/* No results */}
        {debouncedQuery && !isLoading && !hasResults && (
          <div className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-foreground-muted" />
            <h2 className="mt-4 text-lg font-semibold">No results found</h2>
            <p className="mt-2 text-foreground-muted">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Results list */}
        {!isLoading && hasResults && (
          <div className="space-y-4">
            {/* Animators section */}
            {showAnimators && animators.length > 0 && (
              <section>
                {filters.type === 'all' && (
                  <h2 className="mb-3 text-sm font-medium text-foreground-muted">
                    Animators ({totalAnimators})
                  </h2>
                )}
                <div className="space-y-3">
                  {animators.map((animator) => (
                    <SearchHitCard key={animator.id} type="animator" hit={animator} />
                  ))}
                </div>
              </section>
            )}

            {/* Clips section */}
            {showClips && clips.length > 0 && (
              <section>
                {filters.type === 'all' && (
                  <h2 className="mb-3 text-sm font-medium text-foreground-muted">
                    Clips ({totalClips})
                  </h2>
                )}
                <div className="space-y-3">
                  {clips.map((clip) => (
                    <SearchHitCard key={clip.id} type="clip" hit={clip} />
                  ))}
                </div>
              </section>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-foreground-muted">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
