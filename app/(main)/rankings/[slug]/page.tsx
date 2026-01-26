'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trophy, AlertCircle } from 'lucide-react'
import { useRankingDetail, useVote } from '@/lib/hooks/use-rankings'
import { RankingList } from '@/components/rankings'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from 'next-auth/react'

interface RankingDetailPageProps {
  params: { slug: string }
}

export default function RankingDetailPage({ params }: RankingDetailPageProps) {
  const { data: session } = useSession()
  const { data: ranking, isLoading, error } = useRankingDetail(params.slug)
  const voteMutation = useVote(params.slug)
  const [votingItemId, setVotingItemId] = useState<string | null>(null)

  const handleVote = async (itemId: string) => {
    if (!session) {
      // Could show a login modal here
      return
    }

    setVotingItemId(itemId)
    try {
      await voteMutation.mutateAsync(itemId)
    } finally {
      setVotingItemId(null)
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Trophy className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Ranking Not Found
          </h1>
          <p className="text-foreground-muted mb-4">
            The ranking list you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/rankings">
            <Button variant="secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Rankings
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href="/rankings"
        className="inline-flex items-center text-foreground-muted hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Rankings
      </Link>

      {isLoading ? (
        <RankingDetailSkeleton />
      ) : ranking ? (
        <>
          {/* Login prompt for community rankings */}
          {!session && ranking.type === 'COMMUNITY' && (
            <div className="mb-6 p-4 rounded-lg bg-accent/10 border border-accent/20 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Sign in to vote
                </p>
                <p className="text-sm text-foreground-muted">
                  Join our community and vote for your favorite entries in this ranking.
                </p>
              </div>
            </div>
          )}

          <RankingList
            ranking={ranking}
            userVotes={ranking.userVotes}
            onVote={handleVote}
            votingItemId={votingItemId}
          />
        </>
      ) : null}
    </div>
  )
}

function RankingDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start gap-4">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      </div>

      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />

      {/* Items skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
