'use client'

import * as React from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Film, User, Clock, CheckCircle, XCircle, Eye } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export interface ModerationQueueItem {
  id: string
  slug: string
  title: string
  thumbnailUrl: string | null
  duration: number
  techniqueDescription: string
  submittedAt: Date
  anime: {
    title: string
  }
  submittedBy: {
    id: string
    name: string | null
    image: string | null
    trustScore: number
  }
  attributions: {
    animator: {
      name: string
    }
    role: string
  }[]
}

interface ModerationQueueTableProps {
  items: ModerationQueueItem[]
  onReview: (item: ModerationQueueItem) => void
  onQuickApprove?: (item: ModerationQueueItem) => void
  onQuickReject?: (item: ModerationQueueItem) => void
  isLoading?: boolean
}

export function ModerationQueueTable({
  items,
  onReview,
  onQuickApprove,
  onQuickReject,
  isLoading,
}: ModerationQueueTableProps) {
  if (isLoading) {
    return <ModerationQueueTableSkeleton />
  }

  if (items.length === 0) {
    return (
      <div className="rounded-card border border-border bg-surface py-12 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-success" />
        <h3 className="mt-4 text-lg font-semibold">Queue is empty</h3>
        <p className="mt-2 text-foreground-muted">All clips have been reviewed!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <ModerationQueueRow
          key={item.id}
          item={item}
          onReview={() => onReview(item)}
          onQuickApprove={onQuickApprove ? () => onQuickApprove(item) : undefined}
          onQuickReject={onQuickReject ? () => onQuickReject(item) : undefined}
        />
      ))}
    </div>
  )
}

interface ModerationQueueRowProps {
  item: ModerationQueueItem
  onReview: () => void
  onQuickApprove?: () => void
  onQuickReject?: () => void
}

function ModerationQueueRow({ item, onReview, onQuickApprove, onQuickReject }: ModerationQueueRowProps) {
  const timeAgo = formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })

  return (
    <div className="flex items-start gap-4 rounded-card border border-border bg-surface p-4">
      {/* Thumbnail */}
      <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-sm bg-surface-hover">
        {item.thumbnailUrl ? (
          <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Film className="h-8 w-8 text-foreground-muted" />
          </div>
        )}
        <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs text-white">
          {formatDuration(item.duration)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground">{item.title}</h3>
            <p className="text-sm text-foreground-muted">{item.anime.title}</p>
          </div>
          <TrustBadge score={item.submittedBy.trustScore} />
        </div>

        {/* Attributions */}
        <div className="mt-2 flex flex-wrap gap-2">
          {item.attributions.slice(0, 3).map((attr, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {attr.animator.name} - {formatRole(attr.role)}
            </Badge>
          ))}
          {item.attributions.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{item.attributions.length - 3} more
            </Badge>
          )}
        </div>

        {/* Meta */}
        <div className="mt-3 flex items-center gap-4 text-xs text-foreground-muted">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {item.submittedBy.name || 'Unknown'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
        </div>

        {/* Description preview */}
        <p className="mt-2 text-sm text-foreground-muted line-clamp-2">{item.techniqueDescription}</p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 flex-col gap-2">
        <Button variant="primary" size="sm" onClick={onReview}>
          <Eye className="mr-1 h-3 w-3" />
          Review
        </Button>
        {onQuickApprove && (
          <Button variant="ghost" size="sm" className="text-success hover:text-success" onClick={onQuickApprove}>
            <CheckCircle className="mr-1 h-3 w-3" />
            Approve
          </Button>
        )}
        {onQuickReject && (
          <Button variant="ghost" size="sm" className="text-error hover:text-error" onClick={onQuickReject}>
            <XCircle className="mr-1 h-3 w-3" />
            Reject
          </Button>
        )}
      </div>
    </div>
  )
}

function TrustBadge({ score }: { score: number }) {
  const level =
    score >= 201
      ? { label: 'Expert', color: 'bg-accent text-white' }
      : score >= 51
        ? { label: 'Trusted', color: 'bg-success text-white' }
        : score >= 11
          ? { label: 'Contributor', color: 'bg-blue-500 text-white' }
          : { label: 'New User', color: 'bg-surface-hover text-foreground-muted' }

  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', level.color)}>
      {level.label} ({score})
    </span>
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatRole(role: string): string {
  return role.split('_').map((word) => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')
}

function ModerationQueueTableSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 rounded-card border border-border bg-surface p-4">
          <Skeleton className="aspect-video w-40 rounded-sm" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
