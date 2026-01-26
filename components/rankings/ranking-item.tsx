'use client'

import Link from 'next/link'
import Image from 'next/image'
import { User, Play, Building2, Tv } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { VoteButton } from './vote-button'
import type { RankingItemWithEntity } from '@/lib/hooks/use-rankings'

interface RankingItemProps {
  item: RankingItemWithEntity
  hasVoted: boolean
  onVote: () => void
  isVoting?: boolean
  showVoteButton?: boolean
  className?: string
}

export function RankingItem({
  item,
  hasVoted,
  onVote,
  isVoting = false,
  showVoteButton = true,
  className,
}: RankingItemProps) {
  // Determine which entity type is present
  const entity = item.animator || item.clip || item.studio || item.anime
  if (!entity) return null

  const isAnimator = !!item.animator
  const isClip = !!item.clip
  const isStudio = !!item.studio
  const isAnime = !!item.anime

  // Build link based on entity type
  const href = isAnimator
    ? `/animators/${item.animator!.slug}`
    : isClip
      ? `/clips/${item.clip!.slug}`
      : isStudio
        ? `/studios/${item.studio!.slug}`
        : `/anime/${item.anime!.slug}`

  // Get image URL
  const imageUrl = isAnimator
    ? item.animator!.photoUrl
    : isClip
      ? item.clip!.thumbnailUrl
      : isStudio
        ? item.studio!.logoUrl
        : item.anime!.coverUrl

  // Get primary text
  const primaryText = isAnimator
    ? item.animator!.name
    : isClip
      ? item.clip!.title
      : isStudio
        ? item.studio!.name
        : item.anime!.title

  // Get secondary text
  const secondaryText = isAnimator
    ? item.animator!.nativeName
    : isClip
      ? item.clip!.anime.title
      : isStudio
        ? item.studio!.nativeName
        : item.anime!.nativeTitle

  // Get icon based on type
  const Icon = isAnimator ? User : isClip ? Play : isStudio ? Building2 : Tv

  // Rank styling based on position
  const rankStyles = {
    1: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    2: 'bg-gray-300/20 text-gray-300 border-gray-300/30',
    3: 'bg-amber-600/20 text-amber-600 border-amber-600/30',
  }

  const rankClass =
    rankStyles[item.rank as keyof typeof rankStyles] ||
    'bg-surface-secondary text-foreground-muted border-border'

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg bg-surface border border-border hover:border-accent/50 transition-colors',
        className
      )}
    >
      {/* Rank badge */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center font-bold text-lg',
          rankClass
        )}
      >
        {item.rank}
      </div>

      {/* Entity image */}
      <Link href={href} className="flex-shrink-0">
        <div
          className={cn(
            'relative overflow-hidden bg-surface-secondary',
            isClip ? 'w-20 h-12 rounded' : 'w-12 h-12 rounded-full'
          )}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={primaryText}
              fill
              className="object-cover"
              sizes={isClip ? '80px' : '48px'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground-muted">
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </Link>

      {/* Entity info */}
      <Link href={href} className="flex-1 min-w-0">
        <h3 className="font-medium truncate hover:text-accent transition-colors">
          {primaryText}
        </h3>
        {secondaryText && (
          <p className="text-sm text-foreground-muted truncate">{secondaryText}</p>
        )}
        {isAnime && item.anime!.year && (
          <p className="text-xs text-foreground-muted">{item.anime!.year}</p>
        )}
      </Link>

      {/* Vote button */}
      {showVoteButton && (
        <VoteButton
          voteCount={item.voteCount}
          hasVoted={hasVoted}
          onVote={onVote}
          isLoading={isVoting}
          size="sm"
        />
      )}
    </div>
  )
}
