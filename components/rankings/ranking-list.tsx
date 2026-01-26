'use client'

import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import { RankingItem } from './ranking-item'
import { getCategoryLabel, getTypeLabel } from '@/lib/hooks/use-rankings'
import type { RankingListDetail } from '@/lib/hooks/use-rankings'

interface RankingListProps {
  ranking: RankingListDetail
  userVotes: string[]
  onVote: (itemId: string) => void
  votingItemId?: string | null
  className?: string
}

export function RankingList({
  ranking,
  userVotes,
  onVote,
  votingItemId,
  className,
}: RankingListProps) {
  const isEditorial = ranking.type === 'EDITORIAL'
  const userVoteSet = new Set(userVotes)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{ranking.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={isEditorial ? 'verified' : 'default'}>
                {getTypeLabel(ranking.type)}
              </Badge>
              <Badge variant="outline">{getCategoryLabel(ranking.category)}</Badge>
              <Badge variant="outline">{ranking.itemCount} items</Badge>
            </div>
          </div>
        </div>

        {ranking.description && (
          <p className="text-foreground-muted">{ranking.description}</p>
        )}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {ranking.items.map((item) => (
          <RankingItem
            key={item.id}
            item={item}
            hasVoted={userVoteSet.has(item.id)}
            onVote={() => onVote(item.id)}
            isVoting={votingItemId === item.id}
            showVoteButton={!isEditorial}
          />
        ))}
      </div>

      {ranking.items.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
          <p className="text-foreground-muted">No items in this ranking yet.</p>
        </div>
      )}
    </div>
  )
}
