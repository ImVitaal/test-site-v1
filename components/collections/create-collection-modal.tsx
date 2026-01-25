'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { CollectionCardData } from './collection-card'

interface CreateCollectionModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description?: string; isPublic: boolean }) => void
  isSubmitting?: boolean
  editingCollection?: CollectionCardData | null
}

export function CreateCollectionModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  editingCollection,
}: CreateCollectionModalProps) {
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [isPublic, setIsPublic] = React.useState(true)
  const [error, setError] = React.useState('')

  const isEditing = !!editingCollection

  // Reset form when modal opens/closes or editing changes
  React.useEffect(() => {
    if (open) {
      if (editingCollection) {
        setName(editingCollection.name)
        setDescription(editingCollection.description || '')
        setIsPublic(editingCollection.isPublic)
      } else {
        setName('')
        setDescription('')
        setIsPublic(true)
      }
      setError('')
    }
  }, [open, editingCollection])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Collection name is required')
      return
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      isPublic,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Collection' : 'Create Collection'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your collection details'
              : 'Create a new collection to organize your favorite clips'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Name <span className="text-error">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              placeholder="My Favorite Sakuga"
              error={error}
              maxLength={100}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A collection of my favorite animation clips..."
              maxLength={500}
              showCount
            />
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
              />
              <div>
                <span className="text-sm font-medium text-foreground">Make public</span>
                <p className="text-xs text-foreground-muted">
                  Public collections can be viewed and shared with anyone
                </p>
              </div>
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isEditing ? 'Save Changes' : 'Create Collection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
