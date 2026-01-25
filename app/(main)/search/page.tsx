import { Suspense } from 'react'
import { Metadata } from 'next'
import { SearchPageClient } from './page-client'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Search | Sakuga Legends',
  description: 'Search for animators, clips, and anime in the Sakuga Legends database.',
}

interface SearchPageProps {
  searchParams: {
    q?: string
    type?: string
    verificationStatus?: string
    yearStart?: string
    yearEnd?: string
    page?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Search Results</h1>
        {searchParams.q && (
          <p className="mt-2 text-foreground-muted">
            Showing results for &quot;<span className="text-foreground">{searchParams.q}</span>&quot;
          </p>
        )}
      </div>

      <Suspense fallback={<SearchPageSkeleton />}>
        <SearchPageClient searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

function SearchPageSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
      {/* Filters skeleton */}
      <div className="hidden lg:block space-y-6">
        <Skeleton className="h-4 w-16" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
        <Skeleton className="h-4 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>

      {/* Results skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-card" />
        ))}
      </div>
    </div>
  )
}
