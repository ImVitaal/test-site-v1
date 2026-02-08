import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import { getAnimatorBySlug } from '@/lib/db/queries/animators'
import { InfluenceSection } from '@/components/graphs'

interface InfluencePageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: InfluencePageProps): Promise<Metadata> {
  const animator = await getAnimatorBySlug(params.slug)

  if (!animator) {
    return {
      title: 'Animator Not Found',
    }
  }

  return {
    title: `${animator.name} - Influence Network`,
    description: `Explore the professional relationships and influence network of ${animator.name}, including mentors, students, and colleagues in the anime industry.`,
    openGraph: {
      title: `${animator.name} - Influence Network`,
      description: `Explore the professional relationships of ${animator.name}`,
      images: animator.photoUrl ? [animator.photoUrl] : undefined,
    },
  }
}

export default async function InfluencePage({ params }: InfluencePageProps) {
  const animator = await getAnimatorBySlug(params.slug)

  if (!animator) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back navigation */}
      <Link
        href={`/animators/${params.slug}`}
        className="inline-flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to {animator.name}
      </Link>

      {/* Animator mini-header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-surface-secondary flex-shrink-0">
          {animator.photoUrl ? (
            <Image
              src={animator.photoUrl}
              alt={animator.name}
              fill
              className="object-cover"
              sizes="64px"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground-muted text-2xl">
              {animator.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{animator.name}</h1>
          {animator.nativeName && (
            <p className="text-foreground-muted">{animator.nativeName}</p>
          )}
        </div>
      </div>

      {/* Influence Graph Section */}
      <InfluenceSection animatorSlug={params.slug} />

      {/* Info section */}
      <div className="mt-8 p-4 bg-surface-secondary rounded-lg">
        <h3 className="font-semibold mb-2">About the Influence Network</h3>
        <p className="text-sm text-foreground-muted">
          This visualization shows the professional relationships between animators in the
          anime industry. Connections include mentor/student relationships, colleagues who
          have worked together, and artistic influences. The data is curated from interviews,
          documentaries, and official sources.
        </p>
        <p className="text-sm text-foreground-muted mt-2">
          <strong>Note:</strong> Not all relationships may be documented. If you have
          information about missing connections, please contribute to our database.
        </p>
      </div>
    </div>
  )
}
