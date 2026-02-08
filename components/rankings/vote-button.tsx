'use client'

import { ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'

interface VoteButtonProps {
  voteCount: number
  hasVoted: boolean
  onVote: () => void
  isLoading?: boolean
  disabled?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function VoteButton({
  voteCount,
  hasVoted,
  onVote,
  isLoading = false,
  disabled = false,
  size = 'md',
  className,
}: VoteButtonProps) {
  const sizeClasses = {
    sm: 'h-8 px-2 text-xs gap-1',
    md: 'h-10 px-3 text-sm gap-2',
  }

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
  }

  return (
    <Button
      variant={hasVoted ? 'primary' : 'secondary'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onVote()
      }}
      disabled={disabled || isLoading}
      className={cn(
        'font-medium transition-all',
        sizeClasses[size],
        hasVoted && 'bg-accent text-white',
        className
      )}
      aria-label={hasVoted ? 'Remove vote' : 'Vote'}
      aria-pressed={hasVoted}
    >
      <ThumbsUp
        className={cn(
          iconSizes[size],
          'transition-transform',
          hasVoted && 'fill-current',
          isLoading && 'animate-pulse'
        )}
      />
      <span>{voteCount}</span>
    </Button>
  )
}
