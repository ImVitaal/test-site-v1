'use client'

import * as React from 'react'
import { Loader2, CheckCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error'

interface UploadProgressProps {
  progress: number
  status: UploadStatus
  onCancel?: () => void
  error?: string
}

export function UploadProgress({ progress, status, onCancel, error }: UploadProgressProps) {
  const statusText = {
    idle: 'Ready to upload',
    uploading: 'Uploading...',
    processing: 'Processing video...',
    complete: 'Upload complete!',
    error: 'Upload failed',
  }

  const statusIcon = {
    idle: null,
    uploading: <Loader2 className="h-5 w-5 animate-spin text-accent" />,
    processing: <Loader2 className="h-5 w-5 animate-spin text-accent" />,
    complete: <CheckCircle className="h-5 w-5 text-success" />,
    error: <AlertCircle className="h-5 w-5 text-error" />,
  }

  if (status === 'idle') return null

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {statusIcon[status]}
          <div>
            <p className="text-sm font-medium text-foreground">{statusText[status]}</p>
            {error && <p className="text-xs text-error">{error}</p>}
          </div>
        </div>

        {(status === 'uploading' || status === 'processing') && onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {(status === 'uploading' || status === 'processing') && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span>{status === 'uploading' ? 'Uploading' : 'Processing'}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-hover">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                status === 'processing' ? 'bg-accent animate-pulse' : 'bg-accent'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
