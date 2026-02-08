import { Suspense } from 'react'
import { listAnimators } from '@/lib/db/queries/animators'
import { AnimatorGrid } from '@/components/animators/animator-grid'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface AnimatorsPageProps {
  searchParams: {
    page?: string
    q?: string
  }
}

export const metadata = {
  title: 'Animators',
  description: 'Browse and discover the most talented key animators in anime.',
}

async function AnimatorsList({ page, q }: { page: number; q?: string }) {
  const result = await listAnimators({
    page,
    limit: 20,
    q,
    sortOrder: 'asc',
  })

  const animators = result.data as {
    id: string
    slug: string
    name: string
    nativeName: string | null
    photoUrl: string | null
    _count: { attributions: number }
  }[]

  return (
    <>
      <AnimatorGrid animators={animators} />

      {/* Pagination */}
      {result.pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {result.pagination.hasPrev && (
            <a
              href={`/animators?page=${page - 1}${q ? `&q=${q}` : ''}`}
              className="btn-secondary px-4 py-2 rounded-button"
            >
              Previous
            </a>
          )}
          <span className="px-4 py-2 text-foreground-muted">
            Page {result.pagination.page} of {result.pagination.totalPages}
          </span>
          {result.pagination.hasNext && (
            <a
              href={`/animators?page=${page + 1}${q ? `&q=${q}` : ''}`}
              className="btn-secondary px-4 py-2 rounded-button"
            >
              Next
            </a>
          )}
        </div>
      )}
    </>
  )
}

function AnimatorsLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <Skeleton className="aspect-square" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AnimatorsPage({ searchParams }: AnimatorsPageProps) {
  const page = Number(searchParams.page) || 1
  const q = searchParams.q

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-display-sm text-foreground">Animators</h1>
        <p className="mt-2 text-foreground-muted">
          Discover the talented key animators behind your favorite anime scenes.
        </p>
      </div>

      {/* Search */}
      <form className="mb-8 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            type="search"
            name="q"
            placeholder="Search animators..."
            defaultValue={q}
            className="pl-10"
          />
        </div>
      </form>

      {/* Grid */}
      <Suspense fallback={<AnimatorsLoading />}>
        <AnimatorsList page={page} q={q} />
      </Suspense>
    </div>
  )
}
