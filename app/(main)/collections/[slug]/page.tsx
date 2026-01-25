import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Globe, Lock, User } from 'lucide-react'
import { auth } from '@/lib/auth/config'
import { getCollectionBySlug } from '@/lib/db/queries/collections'
import { ClipGrid } from '@/components/clips/clip-grid'
import { Button } from '@/components/ui/button'

interface CollectionPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const collection = await getCollectionBySlug(params.slug)

  if (!collection) {
    return { title: 'Collection Not Found' }
  }

  return {
    title: `${collection.name} | Sakuga Legends`,
    description: collection.description || `A collection of ${collection.clipCount} animation clips.`,
  }
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const [collection, session] = await Promise.all([
    getCollectionBySlug(params.slug),
    auth(),
  ])

  if (!collection) {
    notFound()
  }

  const isOwner = session?.user?.id === collection.user.id

  // Check visibility
  if (!collection.isPublic && !isOwner) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Link href="/collections" className="inline-flex items-center text-sm text-foreground-muted hover:text-foreground mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Collections
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold text-foreground">{collection.name}</h1>
              {collection.isPublic ? (
                <Globe className="h-5 w-5 text-foreground-muted" title="Public" />
              ) : (
                <Lock className="h-5 w-5 text-foreground-muted" title="Private" />
              )}
            </div>
            {collection.description && (
              <p className="mt-2 text-foreground-muted">{collection.description}</p>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-foreground-muted">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {collection.user.name || 'Anonymous'}
              </span>
              <span>{collection.clipCount} clip{collection.clipCount !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {isOwner && (
            <Link href="/collections">
              <Button variant="secondary" size="sm">
                Manage Collections
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Clips */}
      {collection.clips.length > 0 ? (
        <ClipGrid clips={collection.clips} />
      ) : (
        <div className="rounded-card border border-border bg-surface py-12 text-center">
          <p className="text-foreground-muted">This collection is empty</p>
        </div>
      )}
    </main>
  )
}
