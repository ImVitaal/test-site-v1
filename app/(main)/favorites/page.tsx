import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { auth } from '@/lib/auth/config'
import { getUserFavoriteClips, getUserFavoriteAnimators } from '@/lib/db/queries/favorites'
import { FavoritesPageClient } from './page-client'

export const metadata: Metadata = {
  title: 'My Favorites | Sakuga Legends',
  description: 'Your favorite clips and animators on Sakuga Legends.',
}

export default async function FavoritesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/favorites')
  }

  const [clips, animators] = await Promise.all([
    getUserFavoriteClips(session.user.id),
    getUserFavoriteAnimators(session.user.id),
  ])

  return (
    <main className="container mx-auto px-4 py-8">
      <FavoritesPageClient initialClips={clips} initialAnimators={animators} />
    </main>
  )
}
