import { Suspense } from 'react'
import { listClips } from '@/lib/db/queries/clips'
import { ClipGrid } from '@/components/clips/clip-grid'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface ClipsPageProps {
  searchParams: {
    page?: string
    q?: string
  }
}

export const metadata = {
  title: 'Clips',
  description: 'Browse the sakuga clip database featuring the best animation sequences.',
}

async function ClipsList({ page, q }: { page: number; q?: string }) {
  const result = await listClips({
    page,
    limit: 20,
    q,
    sortOrder: 'desc',
  })

  const clips = result.data as {
    id: string
    slug: string
    title: string
    thumbnailUrl: string | null
    duration: number
    anime: { title: string; slug: string }
    primaryAnimator: { name: string; slug: string } | null
    verificationStatus: import('@prisma/client').VerificationStatus
  }[]

  return (
    <>
      <ClipGrid clips={clips} />

      {/* Pagination */}
      {result.pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {result.pagination.hasPrev && (
            <a
              href={`/clips?page=${page - 1}${q ? `&q=${q}` : ''}`}
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
              href={`/clips?page=${page + 1}${q ? `&q=${q}` : ''}`}
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

function ClipsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <Skeleton className="aspect-video" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ClipsPage({ searchParams }: ClipsPageProps) {
  const page = Number(searchParams.page) || 1
  const q = searchParams.q

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-display-sm text-foreground">Sakuga Clips</h1>
        <p className="mt-2 text-foreground-muted">
          Explore the database of animation sequences with frame-by-frame analysis.
        </p>
      </div>

      {/* Search */}
      <form className="mb-8 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            type="search"
            name="q"
            placeholder="Search clips..."
            defaultValue={q}
            className="pl-10"
          />
        </div>
      </form>

      {/* Grid */}
      <Suspense fallback={<ClipsLoading />}>
        <ClipsList page={page} q={q} />
      </Suspense>
    </div>
  )
}
