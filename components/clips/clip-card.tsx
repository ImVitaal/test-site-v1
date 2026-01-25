import Link from 'next/link'
import { Play } from 'lucide-react'
import { VerificationBadge } from '@/components/ui/badge'
import { formatDuration } from '@/lib/utils/format'
import { cn } from '@/lib/utils/cn'
import type { VerificationStatus } from '@prisma/client'

interface ClipCardProps {
  slug: string
  title: string
  thumbnailUrl?: string | null
  duration: number
  animeTitle: string
  animatorName?: string | null
  verificationStatus: VerificationStatus
  className?: string
}

export function ClipCard({
  slug,
  title,
  thumbnailUrl,
  duration,
  animeTitle,
  animatorName,
  verificationStatus,
  className,
}: ClipCardProps) {
  return (
    <Link
      href={`/clips/${slug}`}
      className={cn('group card card-hover block overflow-hidden', className)}
    >
      {/* Thumbnail */}
      <div className="aspect-video relative bg-surface-hover">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="h-12 w-12 text-foreground-muted" />
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-xs text-white font-mono">
          {formatDuration(duration)}
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-accent/90 flex items-center justify-center">
            <Play className="w-6 h-6 text-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-foreground-muted line-clamp-1">{animeTitle}</p>
        <div className="mt-2 flex items-center justify-between">
          {animatorName && (
            <p className="text-xs text-foreground-muted truncate">{animatorName}</p>
          )}
          <VerificationBadge status={verificationStatus} />
        </div>
      </div>
    </Link>
  )
}
