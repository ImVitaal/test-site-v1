'use client'

import * as React from 'react'
import { Upload, Film, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  VIDEO_MAX_DURATION_SECONDS,
  VIDEO_MAX_SIZE_BYTES,
  VIDEO_ALLOWED_TYPES,
} from '@/config/constants'

interface VideoDropzoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
  error?: string
}

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid'

export function VideoDropzone({ onFileSelect, disabled, error }: VideoDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [validationState, setValidationState] = React.useState<ValidationState>('idle')
  const [validationError, setValidationError] = React.useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const validateFile = async (file: File): Promise<{ valid: boolean; error?: string }> => {
    // Check file type
    if (!VIDEO_ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Please upload MP4 or WebM.' }
    }

    // Check file size
    if (file.size > VIDEO_MAX_SIZE_BYTES) {
      return { valid: false, error: `File too large. Maximum size is ${VIDEO_MAX_SIZE_BYTES / 1024 / 1024}MB.` }
    }

    // Check duration using video element
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        if (video.duration > VIDEO_MAX_DURATION_SECONDS) {
          resolve({
            valid: false,
            error: `Video too long. Maximum duration is ${VIDEO_MAX_DURATION_SECONDS} seconds.`,
          })
        } else {
          resolve({ valid: true })
        }
      }

      video.onerror = () => {
        URL.revokeObjectURL(video.src)
        resolve({ valid: false, error: 'Could not read video file.' })
      }

      video.src = URL.createObjectURL(file)
    })
  }

  const handleFile = async (file: File) => {
    setValidationState('validating')
    setValidationError(null)

    const result = await validateFile(file)

    if (result.valid) {
      setValidationState('valid')
      setPreviewUrl(URL.createObjectURL(file))
      onFileSelect(file)
    } else {
      setValidationState('invalid')
      setValidationError(result.error || 'Invalid file')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (disabled) return

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  // Cleanup preview URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const displayError = error || validationError

  return (
    <div className="space-y-4">
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed p-6 transition-colors',
          isDragging && 'border-accent bg-accent/5',
          validationState === 'valid' && 'border-success bg-success/5',
          displayError && 'border-error bg-error/5',
          !isDragging && !displayError && validationState !== 'valid' && 'border-border hover:border-accent hover:bg-surface-hover',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={VIDEO_ALLOWED_TYPES.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {validationState === 'validating' ? (
          <>
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
            <p className="mt-4 text-sm text-foreground-muted">Validating video...</p>
          </>
        ) : validationState === 'valid' && previewUrl ? (
          <div className="w-full">
            <video
              src={previewUrl}
              controls
              className="mx-auto max-h-[300px] rounded-sm"
            />
            <div className="mt-4 flex items-center justify-center gap-2 text-success">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Video ready for upload</span>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-full bg-surface-hover p-4">
              {displayError ? (
                <AlertCircle className="h-8 w-8 text-error" />
              ) : (
                <Upload className="h-8 w-8 text-foreground-muted" />
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-foreground">
                {isDragging ? 'Drop your video here' : 'Drag and drop your video here'}
              </p>
              <p className="mt-1 text-xs text-foreground-muted">
                or click to browse
              </p>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-foreground-muted">
              <span className="flex items-center gap-1">
                <Film className="h-3 w-3" />
                MP4 or WebM
              </span>
              <span>Max {VIDEO_MAX_DURATION_SECONDS}s</span>
              <span>Max {VIDEO_MAX_SIZE_BYTES / 1024 / 1024}MB</span>
            </div>
          </>
        )}
      </div>

      {displayError && (
        <div className="flex items-center gap-2 text-sm text-error">
          <AlertCircle className="h-4 w-4" />
          {displayError}
        </div>
      )}
    </div>
  )
}
