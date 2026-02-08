import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { ModerationStats } from '@/components/moderation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Film, Users, Flag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Moderation Dashboard | Sakuga Legends',
  description: 'Moderate clips and manage content on Sakuga Legends.',
}

export default async function ModerationPage() {
  const session = await auth()

  // Check if user is moderator or admin
  if (!session?.user || !['MODERATOR', 'ADMIN'].includes(session.user.role)) {
    redirect('/login?callbackUrl=/moderation')
  }

  // Fetch moderation stats
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [pending, approvedToday, rejectedToday, totalReviewed] = await Promise.all([
    prisma.clip.count({ where: { submissionStatus: 'PENDING' } }),
    prisma.clip.count({
      where: {
        submissionStatus: 'APPROVED',
        moderatedAt: { gte: today },
      },
    }),
    prisma.clip.count({
      where: {
        submissionStatus: 'REJECTED',
        moderatedAt: { gte: today },
      },
    }),
    prisma.clip.count({
      where: {
        submissionStatus: { in: ['APPROVED', 'REJECTED'] },
        moderatedBy: session.user.id,
      },
    }),
  ])

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Moderation Dashboard</h1>
        <p className="mt-2 text-foreground-muted">
          Review and manage submitted content
        </p>
      </div>

      {/* Stats */}
      <ModerationStats
        pending={pending}
        approvedToday={approvedToday}
        rejectedToday={rejectedToday}
        totalReviewed={totalReviewed}
      />

      {/* Quick Actions */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5 text-accent" />
              Clip Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground-muted">
              {pending} clip{pending !== 1 ? 's' : ''} pending review
            </p>
            <Link href="/moderation/clips">
              <Button variant="primary" size="sm" className="mt-4">
                Review Clips
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Animator Edits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground-muted">
              Review suggested animator profile edits
            </p>
            <Link href="/moderation/animators">
              <Button variant="secondary" size="sm" className="mt-4">
                View Edits
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-accent" />
              Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground-muted">
              View flagged content and user reports
            </p>
            <Button variant="secondary" size="sm" className="mt-4" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Guidelines */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Moderation Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li>• Clips must be 45 seconds or less</li>
            <li>• Technique description must be educational and at least 50 characters</li>
            <li>• Attributions should be verified when possible</li>
            <li>• No NSFW, leaked, or unreleased content</li>
            <li>• Check for duplicates before approving</li>
            <li>• When rejecting, always provide a clear reason</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
