import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { auth } from '@/lib/auth/config'
import { ModerationClipsClient } from './page-client'

export const metadata: Metadata = {
  title: 'Clip Moderation Queue | Sakuga Legends',
  description: 'Review and moderate clip submissions.',
}

export default async function ModerationClipsPage() {
  const session = await auth()

  // Check if user is moderator or admin
  if (!session?.user || !['MODERATOR', 'ADMIN'].includes(session.user.role)) {
    redirect('/login?callbackUrl=/moderation/clips')
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Clip Moderation Queue</h1>
        <p className="mt-2 text-foreground-muted">
          Review submitted clips and approve or reject them
        </p>
      </div>

      <ModerationClipsClient />
    </main>
  )
}
