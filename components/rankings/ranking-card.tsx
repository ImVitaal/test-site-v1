import Link from 'next/link'
import Image from 'next/image'
import { Trophy, Users, ListOrdered } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import type { RankingListSummary } from '@/lib/hooks/use-rankings'
import { getCategoryLabel, getTypeLabel } from '@/lib/hooks/use-rankings'

interface RankingCardProps {
  ranking: RankingListSummary
  className?: string
}

export function RankingCard({ ranking, className }: RankingCardProps) {
  const isEditorial = ranking.type === 'EDITORIAL'

  return (
    <Link
      href={`/rankings/${ranking.slug}`}
      className={cn('group card card-hover block overflow-hidden', className)}
    >
      {/* Cover image */}
      <div className="aspect-video relative bg-surface-hover">
        {ranking.coverUrl ? (
          <Image
            src={ranking.coverUrl}
            alt={ranking.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
            <Trophy className="h-12 w-12 text-accent/50" />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <Badge variant={isEditorial ? 'verified' : 'default'}>
            {getTypeLabel(ranking.type)}
          </Badge>
        </div>

        {/* Category badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="bg-black/50 border-white/20 text-white">
            {getCategoryLabel(ranking.category)}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
          {ranking.title}
        </h3>
        {ranking.description && (
          <p className="mt-1 text-sm text-foreground-muted line-clamp-2">
            {ranking.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-4 text-xs text-foreground-muted">
          <span className="flex items-center gap-1">
            <ListOrdered className="h-3.5 w-3.5" />
            {ranking.itemCount} items
          </span>
          {!isEditorial && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              Community votes
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
