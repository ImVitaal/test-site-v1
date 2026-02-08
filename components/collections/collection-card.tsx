'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Film, Lock, Globe, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'

export interface CollectionCardData {
  id: string
  slug: string
  name: string
  description: string | null
  isPublic: boolean
  clipCount: number
  thumbnails: (string | null)[]
  createdAt: Date
}

interface CollectionCardProps {
  collection: CollectionCardData
  isOwner?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export function CollectionCard({ collection, isOwner, onEdit, onDelete }: CollectionCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <div className="group relative rounded-card border border-border bg-surface transition-colors hover:bg-surface-hover">
      {/* Thumbnail Grid */}
      <Link href={ROUTES.collections.detail(collection.slug)}>
        <div className="aspect-video overflow-hidden rounded-t-card bg-surface-hover">
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-0.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="relative bg-background">
                {collection.thumbnails[i] ? (
                  <Image
                    src={collection.thumbnails[i]!}
                    alt=""
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Film className="h-4 w-4 text-foreground-muted" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <Link href={ROUTES.collections.detail(collection.slug)} className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">
              {collection.name}
            </h3>
          </Link>

          {/* Visibility + Menu */}
          <div className="flex items-center gap-1 ml-2">
            {collection.isPublic ? (
              <Globe className="h-4 w-4 text-foreground-muted" />
            ) : (
              <Lock className="h-4 w-4 text-foreground-muted" />
            )}

            {isOwner && (
              <div ref={menuRef} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>

                {menuOpen && (
                  <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-button border border-border bg-surface py-1 shadow-lg">
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        onEdit?.()
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-surface-hover"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        onDelete?.()
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-surface-hover"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {collection.description && (
          <p className="mt-1 text-sm text-foreground-muted line-clamp-2">{collection.description}</p>
        )}

        <p className="mt-2 text-xs text-foreground-muted">
          {collection.clipCount} clip{collection.clipCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
