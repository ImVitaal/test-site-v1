'use client'

import { cn } from '@/lib/utils/cn'

type RankingType = 'EDITORIAL' | 'COMMUNITY'
type RankingCategory = 'ANIMATOR' | 'CLIP' | 'STUDIO' | 'ANIME'

interface RankingFiltersProps {
  selectedType?: RankingType | null
  selectedCategory?: RankingCategory | null
  onTypeChange: (type: RankingType | null) => void
  onCategoryChange: (category: RankingCategory | null) => void
  className?: string
}

const typeOptions: { value: RankingType | null; label: string }[] = [
  { value: null, label: 'All Types' },
  { value: 'EDITORIAL', label: 'Editorial' },
  { value: 'COMMUNITY', label: 'Community' },
]

const categoryOptions: { value: RankingCategory | null; label: string }[] = [
  { value: null, label: 'All Categories' },
  { value: 'ANIMATOR', label: 'Animators' },
  { value: 'CLIP', label: 'Clips' },
  { value: 'STUDIO', label: 'Studios' },
  { value: 'ANIME', label: 'Anime' },
]

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-accent text-white'
          : 'bg-surface-secondary text-foreground-muted hover:bg-surface-hover hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}

export function RankingFilters({
  selectedType,
  selectedCategory,
  onTypeChange,
  onCategoryChange,
  className,
}: RankingFiltersProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Type filters */}
      <div>
        <label className="block text-sm font-medium text-foreground-muted mb-2">
          Type
        </label>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((option) => (
            <FilterButton
              key={option.label}
              active={selectedType === option.value}
              onClick={() => onTypeChange(option.value)}
            >
              {option.label}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* Category filters */}
      <div>
        <label className="block text-sm font-medium text-foreground-muted mb-2">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((option) => (
            <FilterButton
              key={option.label}
              active={selectedCategory === option.value}
              onClick={() => onCategoryChange(option.value)}
            >
              {option.label}
            </FilterButton>
          ))}
        </div>
      </div>
    </div>
  )
}
