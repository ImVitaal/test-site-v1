'use client'

import { Film, User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FavoritesTabsProps {
  activeTab: 'clips' | 'animators'
  onTabChange: (tab: 'clips' | 'animators') => void
  clipCount: number
  animatorCount: number
}

export function FavoritesTabs({
  activeTab,
  onTabChange,
  clipCount,
  animatorCount,
}: FavoritesTabsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onTabChange('clips')}
        className={cn(
          'flex items-center gap-2 rounded-button px-4 py-2 text-sm font-medium transition-colors',
          activeTab === 'clips'
            ? 'bg-accent text-white'
            : 'bg-surface-hover text-foreground hover:bg-surface-hover/80'
        )}
      >
        <Film className="h-4 w-4" />
        Clips
        <span className="ml-1 rounded-full bg-black/20 px-2 py-0.5 text-xs">{clipCount}</span>
      </button>
      <button
        onClick={() => onTabChange('animators')}
        className={cn(
          'flex items-center gap-2 rounded-button px-4 py-2 text-sm font-medium transition-colors',
          activeTab === 'animators'
            ? 'bg-accent text-white'
            : 'bg-surface-hover text-foreground hover:bg-surface-hover/80'
        )}
      >
        <User className="h-4 w-4" />
        Animators
        <span className="ml-1 rounded-full bg-black/20 px-2 py-0.5 text-xs">{animatorCount}</span>
      </button>
    </div>
  )
}
