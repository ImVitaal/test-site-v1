'use client'

import * as React from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import {
  ModerationQueueTable,
  ModerationReviewModal,
  type ModerationQueueItem,
  type ModerationAction,
} from '@/components/moderation'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useModerationQueue, useModerateClip } from '@/lib/hooks/use-moderation'
import { useToast } from '@/components/ui/toast'

export function ModerationClipsClient() {
  const { addToast } = useToast()
  const [page, setPage] = React.useState(1)
  const [sortBy, setSortBy] = React.useState<'date' | 'trust'>('date')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')
  const [selectedItem, setSelectedItem] = React.useState<ModerationQueueItem | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = React.useState(false)

  const { data, isLoading, refetch } = useModerationQueue({
    page,
    limit: 20,
    sortBy,
    sortOrder,
  })

  const moderateMutation = useModerateClip()

  const handleReview = (item: ModerationQueueItem) => {
    setSelectedItem(item)
    setReviewModalOpen(true)
  }

  const handleAction = async (action: ModerationAction) => {
    if (!selectedItem) return

    try {
      await moderateMutation.mutateAsync({ clipId: selectedItem.id, action })

      addToast({
        type: 'success',
        title: action.action === 'approve' ? 'Clip Approved' : 'Clip Rejected',
        description: `"${selectedItem.title}" has been ${action.action === 'approve' ? 'approved and published' : 'rejected'}.`,
      })

      setReviewModalOpen(false)
      setSelectedItem(null)
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        description: error instanceof Error ? error.message : 'Failed to process action',
      })
    }
  }

  const handleQuickApprove = async (item: ModerationQueueItem) => {
    try {
      await moderateMutation.mutateAsync({
        clipId: item.id,
        action: { action: 'approve' },
      })

      addToast({
        type: 'success',
        title: 'Clip Approved',
        description: `"${item.title}" has been approved and published.`,
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        description: error instanceof Error ? error.message : 'Failed to approve clip',
      })
    }
  }

  const handleQuickReject = async (item: ModerationQueueItem) => {
    try {
      await moderateMutation.mutateAsync({
        clipId: item.id,
        action: { action: 'reject', reason: 'Quick rejection' },
      })

      addToast({
        type: 'success',
        title: 'Clip Rejected',
        description: `"${item.title}" has been rejected.`,
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        description: error instanceof Error ? error.message : 'Failed to reject clip',
      })
    }
  }

  const items = data?.data || []
  const pagination = data?.pagination

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/moderation">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          <Select
            value={sortBy}
            onChange={(v) => setSortBy(v as 'date' | 'trust')}
            options={[
              { value: 'date', label: 'Sort by Date' },
              { value: 'trust', label: 'Sort by Trust Score' },
            ]}
            className="w-40"
          />
          <Select
            value={sortOrder}
            onChange={(v) => setSortOrder(v as 'asc' | 'desc')}
            options={[
              { value: 'asc', label: 'Oldest First' },
              { value: 'desc', label: 'Newest First' },
            ]}
            className="w-36"
          />
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Queue */}
      <ModerationQueueTable
        items={items}
        onReview={handleReview}
        onQuickApprove={handleQuickApprove}
        onQuickReject={handleQuickReject}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-foreground-muted">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Review Modal */}
      <ModerationReviewModal
        item={selectedItem}
        open={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false)
          setSelectedItem(null)
        }}
        onAction={handleAction}
        isSubmitting={moderateMutation.isPending}
      />
    </div>
  )
}
