import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { UploadPageClient } from './page-client'

export const metadata: Metadata = {
  title: 'Upload Clip | Sakuga Legends',
  description: 'Submit a new animation clip to the Sakuga Legends database.',
}

export default async function UploadPage() {
  const session = await getServerSession(authConfig)

  if (!session?.user) {
    redirect('/login?callbackUrl=/upload')
  }

  // Fetch available tags for the form
  const tags = await prisma.tag.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Upload Clip</h1>
          <p className="mt-2 text-foreground-muted">
            Contribute to the Sakuga Legends database by submitting animation clips for review.
          </p>
        </div>

        <UploadPageClient tags={tags} />
      </div>
    </main>
  )
}
