'use client'

import * as React from 'react'
import { CheckCircle, XCircle, AlertTriangle, User, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { ModerationQueueItem } from './moderation-queue-table'

export interface ModerationAction {
  action: 'approve' | 'reject'
  reason?: string
}

interface ModerationReviewModalProps {
  item: ModerationQueueItem | null
  open: boolean
  onClose: () => void
  onAction: (action: ModerationAction) => void
  isSubmitting: boolean
}

const REJECTION_REASONS = [
  'Duplicate content',
  'Poor video quality',
  'Incorrect attribution',
  'Exceeds duration limit',
  'Copyright concern',
  'Inappropriate content',
  'Insufficient technique description',
  'Not anime content',
]

export function ModerationReviewModal({
  item,
  open,
  onClose,
  onAction,
  isSubmitting,
}: ModerationReviewModalProps) {
  const [action, setAction] = React.useState<'approve' | 'reject' | null>(null)
  const [reason, setReason] = React.useState('')
  const [checklist, setChecklist] = React.useState({
    durationOk: false,
    qualityOk: false,
    attributionOk: false,
    descriptionOk: false,
    contentOk: false,
  })

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setAction(null)
      setReason('')
      setChecklist({
        durationOk: false,
        qualityOk: false,
        attributionOk: false,
        descriptionOk: false,
        contentOk: false,
      })
    }
  }, [open])

  const allChecked = Object.values(checklist).every(Boolean)

  const handleSubmit = () => {
    if (!action) return
    onAction({ action, reason: reason.trim() || undefined })
  }

  const toggleChecklist = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Clip Submission</DialogTitle>
          <DialogDescription>
            Review this clip and decide whether to approve or reject it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Video Preview */}
          <div className="aspect-video w-full overflow-hidden rounded-sm bg-black">
            {item.thumbnailUrl ? (
              <video
                src={item.thumbnailUrl.replace('thumbnail.jpg', 'manifest/video.m3u8')}
                controls
                className="h-full w-full"
                poster={item.thumbnailUrl}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white">
                Video preview not available
              </div>
            )}
          </div>

          {/* Clip Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-foreground-muted">Title</h4>
              <p className="text-foreground">{item.title}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground-muted">Anime</h4>
              <p className="text-foreground">{item.anime.title}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground-muted">Duration</h4>
              <p className="text-foreground">{item.duration}s</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground-muted">Submitter</h4>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-foreground-muted" />
                <span>{item.submittedBy.name || 'Unknown'}</span>
                <Badge variant="secondary" className="text-xs">
                  Trust: {item.submittedBy.trustScore}
                </Badge>
              </div>
            </div>
          </div>

          {/* Attributions */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground-muted">Attributions</h4>
            <div className="space-y-2">
              {item.attributions.map((attr, i) => (
                <div key={i} className="flex items-center justify-between rounded-sm bg-surface-hover p-2">
                  <div>
                    <span className="font-medium">{attr.animator.name}</span>
                    <span className="ml-2 text-foreground-muted">{formatRole(attr.role)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technique Description */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-foreground-muted">Technique Description</h4>
            <p className="rounded-sm bg-surface-hover p-3 text-sm">{item.techniqueDescription}</p>
          </div>

          {/* Review Checklist */}
          <div className="rounded-card border border-border p-4">
            <h4 className="mb-3 font-medium text-foreground">Review Checklist</h4>
            <div className="space-y-2">
              <ChecklistItem
                checked={checklist.durationOk}
                onChange={() => toggleChecklist('durationOk')}
                label="Duration is 45 seconds or less"
              />
              <ChecklistItem
                checked={checklist.qualityOk}
                onChange={() => toggleChecklist('qualityOk')}
                label="Video quality is acceptable"
              />
              <ChecklistItem
                checked={checklist.attributionOk}
                onChange={() => toggleChecklist('attributionOk')}
                label="Attribution appears accurate"
              />
              <ChecklistItem
                checked={checklist.descriptionOk}
                onChange={() => toggleChecklist('descriptionOk')}
                label="Technique description is educational and sufficient"
              />
              <ChecklistItem
                checked={checklist.contentOk}
                onChange={() => toggleChecklist('contentOk')}
                label="Content is appropriate (no NSFW/copyright issues)"
              />
            </div>
          </div>

          {/* Action Selection */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setAction('approve')}
              className={cn(
                'flex-1 rounded-card border-2 p-4 text-left transition-colors',
                action === 'approve'
                  ? 'border-success bg-success/10'
                  : 'border-border hover:border-success/50'
              )}
            >
              <CheckCircle className={cn('h-6 w-6', action === 'approve' ? 'text-success' : 'text-foreground-muted')} />
              <h4 className="mt-2 font-medium">Approve</h4>
              <p className="text-sm text-foreground-muted">Publish this clip to the database</p>
            </button>

            <button
              type="button"
              onClick={() => setAction('reject')}
              className={cn(
                'flex-1 rounded-card border-2 p-4 text-left transition-colors',
                action === 'reject'
                  ? 'border-error bg-error/10'
                  : 'border-border hover:border-error/50'
              )}
            >
              <XCircle className={cn('h-6 w-6', action === 'reject' ? 'text-error' : 'text-foreground-muted')} />
              <h4 className="mt-2 font-medium">Reject</h4>
              <p className="text-sm text-foreground-muted">Do not publish this clip</p>
            </button>
          </div>

          {/* Rejection Reason */}
          {action === 'reject' && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Rejection Reason</h4>
              <div className="flex flex-wrap gap-2">
                {REJECTION_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={cn(
                      'rounded-full px-3 py-1 text-sm transition-colors',
                      reason === r
                        ? 'bg-error text-white'
                        : 'bg-surface-hover text-foreground hover:bg-surface-hover/80'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Or type a custom reason..."
                maxLength={1000}
                showCount
              />
            </div>
          )}

          {/* Warning for approve without checklist */}
          {action === 'approve' && !allChecked && (
            <div className="flex items-center gap-2 rounded-sm bg-warning/10 p-3 text-sm text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>You haven&apos;t completed the review checklist. Are you sure you want to approve?</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant={action === 'approve' ? 'primary' : 'danger'}
            onClick={handleSubmit}
            disabled={!action || isSubmitting}
            isLoading={isSubmitting}
          >
            {action === 'approve' ? 'Approve Clip' : 'Reject Clip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ChecklistItem({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
      />
      <span className="text-sm">{label}</span>
    </label>
  )
}

function formatRole(role: string): string {
  return role
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}
