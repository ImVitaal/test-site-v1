import { AnimatorCard } from './animator-card'

interface Animator {
  id: string
  slug: string
  name: string
  nativeName: string | null
  photoUrl: string | null
  _count: {
    attributions: number
  }
}

interface AnimatorGridProps {
  animators: Animator[]
}

export function AnimatorGrid({ animators }: AnimatorGridProps) {
  if (animators.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-foreground-muted">No animators found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {animators.map((animator) => (
        <AnimatorCard
          key={animator.id}
          slug={animator.slug}
          name={animator.name}
          nativeName={animator.nativeName}
          photoUrl={animator.photoUrl}
          clipCount={animator._count.attributions}
        />
      ))}
    </div>
  )
}
