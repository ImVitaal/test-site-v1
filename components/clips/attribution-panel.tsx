import Link from 'next/link'
import { User } from 'lucide-react'
import { VerificationBadge } from '@/components/ui/badge'
import { ANIMATION_ROLE_LABELS } from '@/config/constants'
import type { Role, VerificationStatus } from '@prisma/client'

interface Attribution {
  animator: {
    id: string
    slug: string
    name: string
    nativeName: string | null
    photoUrl: string | null
  }
  role: Role
  verificationStatus: VerificationStatus
  sourceUrl: string | null
  sourceNote: string | null
}

interface AttributionPanelProps {
  attributions: Attribution[]
}

export function AttributionPanel({ attributions }: AttributionPanelProps) {
  if (attributions.length === 0) {
    return (
      <div className="card p-4 text-center text-foreground-muted">
        No attributions yet.
      </div>
    )
  }

  return (
    <div className="card p-4">
      <h3 className="font-semibold text-foreground mb-4">Attribution</h3>
      <div className="space-y-4">
        {attributions.map((attr, index) => (
          <div key={`${attr.animator.id}-${attr.role}-${index}`} className="flex items-start gap-3">
            {/* Avatar */}
            <Link href={`/animators/${attr.animator.slug}`} className="shrink-0">
              <div className="w-12 h-12 rounded-full bg-surface-hover overflow-hidden">
                {attr.animator.photoUrl ? (
                  <img
                    src={attr.animator.photoUrl}
                    alt={attr.animator.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-6 h-6 text-foreground-muted" />
                  </div>
                )}
              </div>
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/animators/${attr.animator.slug}`}
                className="font-medium text-foreground hover:text-accent transition-colors"
              >
                {attr.animator.name}
              </Link>
              {attr.animator.nativeName && (
                <p className="text-sm text-foreground-muted">{attr.animator.nativeName}</p>
              )}
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-foreground-muted">
                  {ANIMATION_ROLE_LABELS[attr.role as keyof typeof ANIMATION_ROLE_LABELS]}
                </span>
                <VerificationBadge status={attr.verificationStatus} />
              </div>
              {attr.sourceUrl && (
                <a
                  href={attr.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline mt-1 inline-block"
                >
                  View source
                </a>
              )}
              {attr.sourceNote && (
                <p className="text-xs text-foreground-muted mt-1">{attr.sourceNote}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
