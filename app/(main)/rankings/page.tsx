'use client'

import { useState } from 'react'
import { Trophy } from 'lucide-react'
import { useRankingLists } from '@/lib/hooks/use-rankings'
import { RankingGrid, RankingFilters } from '@/components/rankings'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

type RankingType = 'EDITORIAL' | 'COMMUNITY'
type RankingCategory = 'ANIMATOR' | 'CLIP' | 'STUDIO' | 'ANIME'

export default function RankingsPage() {
  const [type, setType] = useState<RankingType | null>(null)
  const [category, setCategory] = useState<RankingCategory | null>(null)

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRankingLists({
      type: type || undefined,
      category: category || undefined,
      limit: 12,
    })

  const rankings = data?.lists ?? []

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-accent" />
          </div>
          <h1 className="font-display text-display-sm text-foreground">Rankings</h1>
        </div>
        <p className="text-foreground-muted max-w-2xl">
          Discover the best animators, clips, studios, and anime as voted by the community
          or curated by our editorial team.
        </p>
      </div>

      {/* Filters */}
      <RankingFilters
        selectedType={type}
        selectedCategory={category}
        onTypeChange={setType}
        onCategoryChange={setCategory}
        className="mb-8"
      />

      {/* Content */}
      {isLoading ? (
        <RankingsLoading />
      ) : error ? (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
          <p className="text-foreground-muted">Failed to load rankings.</p>
        </div>
      ) : (
        <>
          <RankingGrid rankings={rankings} />

          {/* Load more */}
          {hasNextPage && (
            <div className="mt-8 text-center">
              <Button
                variant="secondary"
                onClick={() => fetchNextPage()}
                isLoading={isFetchingNextPage}
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function RankingsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <Skeleton className="aspect-video" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
