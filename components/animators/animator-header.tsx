import Image from 'next/image'
import { User, Twitter, ExternalLink } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'

interface AnimatorHeaderProps {
  name: string
  nativeName?: string | null
  photoUrl?: string | null
  bio?: string | null
  twitterHandle?: string | null
  pixivId?: string | null
  websiteUrl?: string | null
  stats: {
    clipCount: number
    favoriteCount: number
  }
}

export function AnimatorHeader({
  name,
  nativeName,
  photoUrl,
  bio,
  twitterHandle,
  pixivId,
  websiteUrl,
  stats,
}: AnimatorHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Photo */}
      <div className="shrink-0">
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-card overflow-hidden bg-surface-hover relative">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-20 w-20 text-foreground-muted" />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="font-display text-display-sm text-foreground">{name}</h1>
            {nativeName && (
              <p className="text-lg text-foreground-muted">{nativeName}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {formatNumber(stats.clipCount)}
              </p>
              <p className="text-sm text-foreground-muted">Clips</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {formatNumber(stats.favoriteCount)}
              </p>
              <p className="text-sm text-foreground-muted">Favorites</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <p className="mt-4 text-foreground-muted max-w-2xl">{bio}</p>
        )}

        {/* Social Links */}
        <div className="mt-4 flex gap-4">
          {twitterHandle && (
            <a
              href={`https://twitter.com/${twitterHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-foreground-muted hover:text-accent transition-colors"
            >
              <Twitter className="h-4 w-4" />
              @{twitterHandle}
            </a>
          )}
          {pixivId && (
            <a
              href={`https://www.pixiv.net/users/${pixivId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-foreground-muted hover:text-accent transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Pixiv
            </a>
          )}
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-foreground-muted hover:text-accent transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
