'use client'

import { FolderPlus } from 'lucide-react'
import { CollectionCard, type CollectionCardData } from './collection-card'
import { Skeleton } from '@/components/ui/skeleton'

interface CollectionGridProps {
  collections: CollectionCardData[]
  isOwner?: boolean
  onEdit?: (collection: CollectionCardData) => void
  onDelete?: (collection: CollectionCardData) => void
  isLoading?: boolean
  emptyMessage?: string
}

export function CollectionGrid({
  collections,
  isOwner,
  onEdit,
  onDelete,
  isLoading,
  emptyMessage = 'No collections found',
}: CollectionGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-card border border-border bg-surface">
            <Skeleton className="aspect-video rounded-t-card" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (collections.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface py-12 text-center">
        <FolderPlus className="mx-auto h-12 w-12 text-foreground-muted" />
        <h3 className="mt-4 text-lg font-semibold">{emptyMessage}</h3>
        <p className="mt-2 text-foreground-muted">
          Create a collection to organize your favorite clips
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          isOwner={isOwner}
          onEdit={onEdit ? () => onEdit(collection) : undefined}
          onDelete={onDelete ? () => onDelete(collection) : undefined}
        />
      ))}
    </div>
  )
}
