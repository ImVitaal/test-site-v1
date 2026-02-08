import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { getClipBySlug, getRelatedClips, isClipFavorited } from '@/lib/db/queries/clips'
import { getSession } from '@/lib/auth/utils'
import { VideoPlayer } from '@/components/clips/video-player'
import { AttributionPanel } from '@/components/clips/attribution-panel'
import { ClipCard } from '@/components/clips/clip-card'
import { FavoriteButton } from '@/components/common/favorite-button'
import { Badge } from '@/components/ui/badge'
import { formatDuration, formatNumber } from '@/lib/utils/format'
import { Eye, Calendar, Film } from 'lucide-react'

interface ClipPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ClipPageProps): Promise<Metadata> {
  const clip = await getClipBySlug(params.slug)

  if (!clip) {
    return {
      title: 'Clip Not Found',
    }
  }

  return {
    title: clip.title,
    description: clip.techniqueDescription.slice(0, 160),
    openGraph: {
      title: clip.title,
      description: clip.techniqueDescription.slice(0, 160),
      images: clip.thumbnailUrl ? [clip.thumbnailUrl] : undefined,
      type: 'video.other',
    },
  }
}

export default async function ClipPage({ params }: ClipPageProps) {
  const [clip, session] = await Promise.all([
    getClipBySlug(params.slug),
    getSession(),
  ])

  if (!clip) {
    notFound()
  }

  const [relatedClips, isFavorited] = await Promise.all([
    getRelatedClips(clip.id),
    session?.user ? isClipFavorited(session.user.id, clip.id) : false,
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <VideoPlayer
            src={clip.videoUrl}
            poster={clip.thumbnailUrl || undefined}
            title={clip.title}
          />

          {/* Title & Actions */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{clip.title}</h1>
              <Link
                href={`/clips?anime=${clip.anime.slug}`}
                className="text-foreground-muted hover:text-accent transition-colors"
              >
                {clip.anime.title}
              </Link>
            </div>
            <FavoriteButton clipSlug={clip.slug} initialFavorited={isFavorited} />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-foreground-muted">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {formatNumber(clip.viewCount)} views
            </span>
            <span className="flex items-center gap-1">
              <Film className="w-4 h-4" />
              {formatDuration(clip.duration)}
            </span>
            {clip.episodeNumber && (
              <span>Episode {clip.episodeNumber}</span>
            )}
            {clip.timestampStart && (
              <span>@ {clip.timestampStart}</span>
            )}
          </div>

          {/* Tags */}
          {clip.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {clip.tags.map(({ tag }: { tag: { id: string; name: string; slug: string } }) => (
                <Link key={tag.id} href={`/clips?tagIds=${tag.id}`}>
                  <Badge variant="outline">{tag.name}</Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Technique Description */}
          <div className="card p-4">
            <h3 className="font-semibold text-foreground mb-2">Technique Analysis</h3>
            <p className="text-foreground-muted whitespace-pre-wrap">
              {clip.techniqueDescription}
            </p>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="card p-4">
            <h3 className="font-semibold text-foreground mb-3">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-surface-hover rounded text-xs font-mono">Space</kbd>
                <span className="text-foreground-muted">Play/Pause</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-surface-hover rounded text-xs font-mono">,</kbd>
                <span className="text-foreground-muted">Previous frame</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-surface-hover rounded text-xs font-mono">.</kbd>
                <span className="text-foreground-muted">Next frame</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-surface-hover rounded text-xs font-mono">← →</kbd>
                <span className="text-foreground-muted">Step frames</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Attribution */}
          <AttributionPanel attributions={clip.attributions} />

          {/* Related Clips */}
          {relatedClips.length > 0 && (
            <div>
              <h3 className="font-semibold text-foreground mb-4">Related Clips</h3>
              <div className="space-y-4">
                {relatedClips.map((related: { id: string; slug: string; title: string; thumbnailUrl: string | null; duration: number; anime: { title: string }; attributions: { animator: { name: string } | null; verificationStatus: import('@prisma/client').VerificationStatus }[] }) => (
                  <ClipCard
                    key={related.id}
                    slug={related.slug}
                    title={related.title}
                    thumbnailUrl={related.thumbnailUrl}
                    duration={related.duration}
                    animeTitle={related.anime.title}
                    animatorName={related.attributions[0]?.animator?.name}
                    verificationStatus={related.attributions[0]?.verificationStatus ?? 'SPECULATIVE'}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
