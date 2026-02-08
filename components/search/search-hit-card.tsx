'use client'

import Link from 'next/link'
import Image from 'next/image'
import { User, Film, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/config/routes'
import type { AnimatorCard } from '@/types/animator'
import type { ClipCard } from '@/types/clip'

interface AnimatorHitCardProps {
  type: 'animator'
  hit: AnimatorCard
}

interface ClipHitCardProps {
  type: 'clip'
  hit: ClipCard
}

type SearchHitCardProps = AnimatorHitCardProps | ClipHitCardProps

export function SearchHitCard(props: SearchHitCardProps) {
  if (props.type === 'animator') {
    return <AnimatorHit animator={props.hit} />
  }
  return <ClipHit clip={props.hit} />
}

function AnimatorHit({ animator }: { animator: AnimatorCard }) {
  return (
    <Link
      href={ROUTES.animators.detail(animator.slug)}
      className="group flex items-center gap-4 rounded-card border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-surface-hover">
        {animator.photoUrl ? (
          <Image
            src={animator.photoUrl}
            alt={animator.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-8 w-8 text-foreground-muted" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
            {animator.name}
          </h3>
          {animator.nativeName && (
            <span className="text-sm text-foreground-muted truncate">{animator.nativeName}</span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-3 text-sm text-foreground-muted">
          <span>{animator.clipCount} clips</span>
          <span>•</span>
          <span>Active {animator.activeYears}</span>
        </div>
      </div>

      <Badge variant="default">
        <User className="mr-1 h-3 w-3" />
        Animator
      </Badge>
    </Link>
  )
}

function ClipHit({ clip }: { clip: ClipCard }) {
  const isVerified = clip.verificationStatus === 'VERIFIED'

  return (
    <Link
      href={ROUTES.clips.detail(clip.slug)}
      className="group flex items-center gap-4 rounded-card border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
    >
      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-sm bg-surface-hover">
        {clip.thumbnailUrl ? (
          <Image
            src={clip.thumbnailUrl}
            alt={clip.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Film className="h-6 w-6 text-foreground-muted" />
          </div>
        )}
        <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-xs text-white">
          {formatDuration(clip.duration)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
          {clip.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-sm text-foreground-muted">
          <span className="truncate">{clip.anime.title}</span>
          {clip.primaryAnimator && (
            <>
              <span>•</span>
              <span className="truncate">{clip.primaryAnimator.name}</span>
            </>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-foreground-muted">
          <span>{clip.viewCount.toLocaleString()} views</span>
          <span>•</span>
          <span>{clip.favoriteCount.toLocaleString()} favorites</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <Badge variant="default">
          <Film className="mr-1 h-3 w-3" />
          Clip
        </Badge>
        <div className={cn('flex items-center gap-1 text-xs', isVerified ? 'text-success' : 'text-foreground-muted')}>
          {isVerified ? (
            <>
              <CheckCircle className="h-3 w-3" />
              Verified
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3" />
              Speculative
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
