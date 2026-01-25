'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FavoriteButtonProps {
  clipSlug: string
  initialFavorited?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function FavoriteButton({
  clipSlug,
  initialFavorited = false,
  size = 'md',
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [isPending, startTransition] = useTransition()

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const handleClick = () => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/clips/${clipSlug}/favorite`, {
          method: 'POST',
        })

        if (response.ok) {
          const data = await response.json()
          setFavorited(data.data.favorited)
        } else if (response.status === 401) {
          // Redirect to login
          window.location.href = '/login'
        }
      } catch (error) {
        console.error('Error toggling favorite:', error)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'rounded-full transition-colors',
        sizes[size],
        favorited
          ? 'bg-error/20 text-error hover:bg-error/30'
          : 'bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground',
        isPending && 'opacity-50 cursor-not-allowed'
      )}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(iconSizes[size], favorited && 'fill-current')}
      />
    </button>
  )
}
