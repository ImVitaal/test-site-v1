import Link from 'next/link'
import Image from 'next/image'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AnimatorCardProps {
  slug: string
  name: string
  nativeName?: string | null
  photoUrl?: string | null
  clipCount: number
  className?: string
}

export function AnimatorCard({
  slug,
  name,
  nativeName,
  photoUrl,
  clipCount,
  className,
}: AnimatorCardProps) {
  return (
    <Link
      href={`/animators/${slug}`}
      className={cn('group card card-hover block overflow-hidden', className)}
    >
      {/* Photo */}
      <div className="aspect-square relative bg-surface-hover">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="h-16 w-16 text-foreground-muted" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
          {name}
        </h3>
        {nativeName && (
          <p className="text-sm text-foreground-muted truncate">{nativeName}</p>
        )}
        <p className="mt-2 text-sm text-foreground-muted">
          {clipCount} {clipCount === 1 ? 'clip' : 'clips'}
        </p>
      </div>
    </Link>
  )
}
