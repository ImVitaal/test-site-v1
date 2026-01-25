import { Skeleton, SkeletonText } from '@/components/ui/skeleton'

export default function ClipLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video skeleton */}
          <Skeleton className="aspect-video w-full rounded-card" />

          {/* Title skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </div>

          {/* Stats skeleton */}
          <div className="flex gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
          </div>

          {/* Technique description skeleton */}
          <div className="card p-4">
            <Skeleton className="h-6 w-40 mb-3" />
            <SkeletonText lines={4} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Attribution skeleton */}
          <div className="card p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related clips skeleton */}
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card overflow-hidden">
                  <Skeleton className="aspect-video" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
