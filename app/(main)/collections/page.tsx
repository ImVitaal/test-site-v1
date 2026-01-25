import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { auth } from '@/lib/auth/config'
import { getUserCollections } from '@/lib/db/queries/collections'
import { CollectionsPageClient } from './page-client'

export const metadata: Metadata = {
  title: 'My Collections | Sakuga Legends',
  description: 'Manage your clip collections on Sakuga Legends.',
}

export default async function CollectionsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/collections')
  }

  const collections = await getUserCollections(session.user.id)

  return (
    <main className="container mx-auto px-4 py-8">
      <CollectionsPageClient initialCollections={collections} />
    </main>
  )
}
