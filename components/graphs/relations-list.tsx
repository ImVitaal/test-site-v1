'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import type { RelationsGrouped } from '@/lib/hooks/use-influence-graph'

interface RelationsListProps {
  data: RelationsGrouped
  currentAnimatorSlug: string
  className?: string
}

interface RelationSectionProps {
  title: string
  items: RelationsGrouped['mentors']
  emptyMessage: string
}

function RelationSection({ title, items, emptyMessage }: RelationSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-foreground-muted italic">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/animators/${item.slug}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-secondary transition-colors"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-surface-secondary flex-shrink-0">
                {item.photoUrl ? (
                  <Image
                    src={item.photoUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.name}</p>
                {item.nativeName && (
                  <p className="text-sm text-foreground-muted truncate">
                    {item.nativeName}
                  </p>
                )}
              </div>
              {item.sharedWorksCount > 0 && (
                <span className="text-xs text-foreground-muted bg-surface-secondary px-2 py-1 rounded">
                  {item.sharedWorksCount} shared
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function RelationsList({
  data,
  currentAnimatorSlug,
  className,
}: RelationsListProps) {
  const totalConnections =
    data.mentors.length + data.students.length + data.colleagues.length

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Connections</h2>
        <span className="text-sm text-foreground-muted">
          {totalConnections} total
        </span>
      </div>

      <div className="space-y-8">
        <RelationSection
          title="Mentors & Influences"
          items={data.mentors}
          emptyMessage="No known mentors"
        />
        <RelationSection
          title="Students & Proteges"
          items={data.students}
          emptyMessage="No known students"
        />
        <RelationSection
          title="Colleagues"
          items={data.colleagues}
          emptyMessage="No known colleagues"
        />
      </div>
    </div>
  )
}
