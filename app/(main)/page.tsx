import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TrendingSection } from '@/components/clips/trending-section'
import { FeaturedAnimatorHero } from '@/components/home/featured-animator-hero'
import { RecentAdditionsSection } from '@/components/home/recent-additions-section'
import { ArrowRight, Users, Film, BookOpen } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Featured Animator Hero */}
      <FeaturedAnimatorHero />

      {/* Trending Section */}
      <TrendingSection className="border-t border-border" limit={6} />

      {/* Recent Additions Section */}
      <RecentAdditionsSection className="border-t border-border" limit={6} />

      {/* Features Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-heading-lg text-foreground">
              Why Sakuga Legends?
            </h2>
            <p className="mt-4 text-foreground-muted max-w-2xl mx-auto">
              Unlike general anime databases, we focus on the artists behind the animation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-6 card-hover">
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Animator Profiles</h3>
              <p className="mt-2 text-foreground-muted">
                Comprehensive profiles with career timelines, mentor/student relationships,
                and signature works for every featured animator.
              </p>
            </div>

            <div className="card p-6 card-hover">
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <Film className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Frame-by-Frame Analysis</h3>
              <p className="mt-2 text-foreground-muted">
                Study animation techniques with our custom video player featuring
                frame stepping, speed control, and A-B looping.
              </p>
            </div>

            <div className="card p-6 card-hover">
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">Verified Attribution</h3>
              <p className="mt-2 text-foreground-muted">
                Every clip attribution is verified through credits, interviews,
                and official sources. No more guessing who animated that scene.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border bg-surface">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-heading-lg text-foreground">
            Ready to dive in?
          </h2>
          <p className="mt-4 text-foreground-muted max-w-xl mx-auto">
            Join thousands of animation enthusiasts exploring the craft of anime&apos;s
            greatest key animators.
          </p>
          <div className="mt-8">
            <Link href="/animators">
              <Button size="lg">
                Start Exploring
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
