'use client'

import * as React from 'react'
import { Plus, Check, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils/cn'
import type { CollectionCardData } from './collection-card'

interface AddToCollectionModalProps {
  clipId: string
  clipTitle: string
  open: boolean
  onClose: () => void
  collections: CollectionCardData[]
  clipCollectionIds: string[]
  onAddToCollection: (collectionId: string) => void
  onRemoveFromCollection: (collectionId: string) => void
  onCreateCollection: () => void
  isLoading?: boolean
  pendingCollectionId?: string | null
}

export function AddToCollectionModal({
  clipId,
  clipTitle,
  open,
  onClose,
  collections,
  clipCollectionIds,
  onAddToCollection,
  onRemoveFromCollection,
  onCreateCollection,
  isLoading,
  pendingCollectionId,
}: AddToCollectionModalProps) {
  const [search, setSearch] = React.useState('')

  const filteredCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = (collection: CollectionCardData) => {
    const isInCollection = clipCollectionIds.includes(collection.id)
    if (isInCollection) {
      onRemoveFromCollection(collection.id)
    } else {
      onAddToCollection(collection.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Collection</DialogTitle>
          <DialogDescription>
            Save &quot;{clipTitle}&quot; to a collection
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Search */}
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collections..."
          />

          {/* Collections list */}
          <div className="max-h-64 overflow-y-auto space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
              </div>
            ) : filteredCollections.length === 0 ? (
              <p className="py-8 text-center text-sm text-foreground-muted">
                {search ? 'No collections found' : 'You have no collections yet'}
              </p>
            ) : (
              filteredCollections.map((collection) => {
                const isInCollection = clipCollectionIds.includes(collection.id)
                const isPending = pendingCollectionId === collection.id

                return (
                  <button
                    key={collection.id}
                    onClick={() => handleToggle(collection)}
                    disabled={isPending}
                    className={cn(
                      'flex w-full items-center justify-between rounded-button px-3 py-2 text-left transition-colors',
                      isInCollection ? 'bg-accent/10' : 'hover:bg-surface-hover',
                      isPending && 'opacity-50'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{collection.name}</p>
                      <p className="text-xs text-foreground-muted">
                        {collection.clipCount} clip{collection.clipCount !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="ml-2">
                      {isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin text-accent" />
                      ) : isInCollection ? (
                        <Check className="h-5 w-5 text-accent" />
                      ) : (
                        <Plus className="h-5 w-5 text-foreground-muted" />
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Create new collection */}
          <Button variant="secondary" className="w-full" onClick={onCreateCollection}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Collection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
