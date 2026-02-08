'use client'

import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useFavoriteClip, useClipFavoriteStatus } from '@/lib/hooks'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/config/routes'

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
  const router = useRouter()
  const { data: session } = useSession()
  const { data: favorited, isLoading: isLoadingStatus } = useClipFavoriteStatus(
    session ? clipSlug : undefined
  )
  const { mutate: toggleFavorite, isPending } = useFavoriteClip(clipSlug)

  // Use server-provided initial value if not authenticated or still loading
  const isFavorited = favorited ?? initialFavorited

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
    if (!session) {
      router.push(ROUTES.login)
      return
    }
    toggleFavorite()
  }

  const isDisabled = isPending || isLoadingStatus

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={cn(
        'rounded-full transition-colors',
        sizes[size],
        isFavorited
          ? 'bg-error/20 text-error hover:bg-error/30'
          : 'bg-surface hover:bg-surface-hover text-foreground-muted hover:text-foreground',
        isDisabled && 'opacity-50 cursor-not-allowed'
      )}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(iconSizes[size], isFavorited && 'fill-current')}
      />
    </button>
  )
}
