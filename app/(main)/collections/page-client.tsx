'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CollectionGrid,
  CreateCollectionModal,
  type CollectionCardData,
} from '@/components/collections'
import {
  useUserCollections,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
} from '@/lib/hooks/use-collections'
import { useToast } from '@/components/ui/toast'

interface CollectionsPageClientProps {
  initialCollections: CollectionCardData[]
}

export function CollectionsPageClient({ initialCollections }: CollectionsPageClientProps) {
  const { addToast } = useToast()
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const [editingCollection, setEditingCollection] = React.useState<CollectionCardData | null>(null)

  const { data: collections } = useUserCollections()
  const createMutation = useCreateCollection()
  const updateMutation = useUpdateCollection()
  const deleteMutation = useDeleteCollection()

  const displayCollections = collections || initialCollections

  const handleCreate = async (data: { name: string; description?: string; isPublic: boolean }) => {
    try {
      await createMutation.mutateAsync(data)
      setCreateModalOpen(false)
      addToast({
        type: 'success',
        title: 'Collection created',
        description: `"${data.name}" has been created.`,
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to create collection',
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const handleUpdate = async (data: { name: string; description?: string; isPublic: boolean }) => {
    if (!editingCollection) return

    try {
      await updateMutation.mutateAsync({ id: editingCollection.id, data })
      setEditingCollection(null)
      addToast({
        type: 'success',
        title: 'Collection updated',
        description: 'Your changes have been saved.',
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to update collection',
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  const handleDelete = async (collection: CollectionCardData) => {
    if (!confirm(`Are you sure you want to delete "${collection.name}"?`)) return

    try {
      await deleteMutation.mutateAsync(collection.id)
      addToast({
        type: 'success',
        title: 'Collection deleted',
        description: `"${collection.name}" has been deleted.`,
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to delete collection',
        description: error instanceof Error ? error.message : 'Please try again',
      })
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">My Collections</h1>
          <p className="mt-2 text-foreground-muted">
            Organize your favorite clips into collections
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Collection
        </Button>
      </div>

      {/* Grid */}
      <CollectionGrid
        collections={displayCollections}
        isOwner
        onEdit={setEditingCollection}
        onDelete={handleDelete}
      />

      {/* Create/Edit Modal */}
      <CreateCollectionModal
        open={createModalOpen || !!editingCollection}
        onClose={() => {
          setCreateModalOpen(false)
          setEditingCollection(null)
        }}
        onSubmit={editingCollection ? handleUpdate : handleCreate}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        editingCollection={editingCollection}
      />
    </div>
  )
}
