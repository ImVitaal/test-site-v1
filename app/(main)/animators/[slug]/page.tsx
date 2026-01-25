import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getAnimatorBySlug, getAnimatorTimeline, getSignatureClips } from '@/lib/db/queries/animators'
import { AnimatorHeader } from '@/components/animators/animator-header'
import { CareerTimeline } from '@/components/animators/career-timeline'

interface AnimatorPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: AnimatorPageProps): Promise<Metadata> {
  const animator = await getAnimatorBySlug(params.slug)

  if (!animator) {
    return {
      title: 'Animator Not Found',
    }
  }

  return {
    title: animator.name,
    description: animator.bio || `Profile of ${animator.name}, key animator in the anime industry.`,
    openGraph: {
      title: animator.name,
      description: animator.bio || `Profile of ${animator.name}`,
      images: animator.photoUrl ? [animator.photoUrl] : undefined,
    },
  }
}

export default async function AnimatorPage({ params }: AnimatorPageProps) {
  const [animator, timeline, signatureClips] = await Promise.all([
    getAnimatorBySlug(params.slug),
    getAnimatorBySlug(params.slug).then(a => a ? getAnimatorTimeline(a.id) : []),
    getAnimatorBySlug(params.slug).then(a => a ? getSignatureClips(a.id) : []),
  ])

  if (!animator) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <AnimatorHeader
        name={animator.name}
        nativeName={animator.nativeName}
        photoUrl={animator.photoUrl}
        bio={animator.bio}
        twitterHandle={animator.twitterHandle}
        pixivId={animator.pixivId}
        websiteUrl={animator.websiteUrl}
        stats={{
          clipCount: animator._count.attributions,
          favoriteCount: animator._count.favorites,
        }}
      />

      {/* Career Timeline */}
      <section className="mt-12">
        <h2 className="font-display text-heading-lg text-foreground mb-6">
          Career Timeline
        </h2>
        <CareerTimeline timeline={timeline} />
      </section>

      {/* Signature Works */}
      {signatureClips.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-heading-lg text-foreground mb-6">
            Signature Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {signatureClips.map((clip) => (
              <a
                key={clip.id}
                href={`/clips/${clip.slug}`}
                className="card card-hover overflow-hidden"
              >
                <div className="aspect-video bg-surface-hover relative">
                  {clip.thumbnailUrl && (
                    <img
                      src={clip.thumbnailUrl}
                      alt={clip.title}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-foreground truncate">{clip.title}</h3>
                  <p className="text-sm text-foreground-muted">{clip.anime.title}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Mentor/Student Relations */}
      {(animator.mentors.length > 0 || animator.students.length > 0) && (
        <section className="mt-12">
          <h2 className="font-display text-heading-lg text-foreground mb-6">
            Influence Network
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {animator.mentors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Mentors</h3>
                <div className="space-y-3">
                  {animator.mentors.map((relation) => (
                    <a
                      key={relation.mentor.id}
                      href={`/animators/${relation.mentor.slug}`}
                      className="flex items-center gap-3 p-3 rounded-card bg-surface hover:bg-surface-hover transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-surface-hover overflow-hidden">
                        {relation.mentor.photoUrl ? (
                          <img
                            src={relation.mentor.photoUrl}
                            alt={relation.mentor.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                            ?
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-foreground">
                        {relation.mentor.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {animator.students.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Students</h3>
                <div className="space-y-3">
                  {animator.students.map((relation) => (
                    <a
                      key={relation.student.id}
                      href={`/animators/${relation.student.slug}`}
                      className="flex items-center gap-3 p-3 rounded-card bg-surface hover:bg-surface-hover transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-surface-hover overflow-hidden">
                        {relation.student.photoUrl ? (
                          <img
                            src={relation.student.photoUrl}
                            alt={relation.student.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                            ?
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-foreground">
                        {relation.student.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
