import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

interface TermCardProps {
  slug: string
  term: string
  definition: string
  className?: string
}

export function TermCard({ slug, term, definition, className }: TermCardProps) {
  // Truncate definition to ~100 characters
  const truncatedDef =
    definition.length > 100 ? `${definition.slice(0, 100)}...` : definition

  return (
    <Link
      href={`/glossary/${slug}`}
      className={cn(
        'card card-hover block p-4 group',
        className
      )}
    >
      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
        {term}
      </h3>
      <p className="mt-2 text-sm text-foreground-muted line-clamp-2">
        {truncatedDef}
      </p>
    </Link>
  )
}
