import { cn } from '@/lib/utils/cn'
import { RankingCard } from './ranking-card'
import type { RankingListSummary } from '@/lib/hooks/use-rankings'

interface RankingGridProps {
  rankings: RankingListSummary[]
  className?: string
}

export function RankingGrid({ rankings, className }: RankingGridProps) {
  if (rankings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground-muted">No rankings found.</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
        className
      )}
    >
      {rankings.map((ranking) => (
        <RankingCard key={ranking.id} ranking={ranking} />
      ))}
    </div>
  )
}
