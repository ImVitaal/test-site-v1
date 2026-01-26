'use client'

import Link from 'next/link'
import { ArrowLeft, BookOpen, Play } from 'lucide-react'
import { useGlossaryTerm } from '@/lib/hooks/use-glossary'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { VideoPlayer } from '@/components/clips/video-player'
import { formatDuration } from '@/lib/utils/format'

interface GlossaryTermPageProps {
  params: { slug: string }
}

export default function GlossaryTermPage({ params }: GlossaryTermPageProps) {
  const { data: term, isLoading, error } = useGlossaryTerm(params.slug)

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Term Not Found
          </h1>
          <p className="text-foreground-muted mb-4">
            The glossary term you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/glossary">
            <Button variant="secondary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Glossary
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link
        href="/glossary"
        className="inline-flex items-center text-foreground-muted hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Glossary
      </Link>

      {isLoading ? (
        <GlossaryTermSkeleton />
      ) : term ? (
        <div className="max-w-4xl">
          {/* Term Header */}
          <div className="mb-8">
            <h1 className="font-display text-display-sm text-foreground mb-4">
              {term.term}
            </h1>

            {/* Definition */}
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-foreground-muted leading-relaxed">
                {term.definition}
              </p>
            </div>
          </div>

          {/* Example Video */}
          {term.exampleClip && (
            <section className="mb-8">
              <h2 className="font-semibold text-lg text-foreground mb-4">
                Video Example
              </h2>
              <div className="card overflow-hidden">
                <div className="aspect-video bg-black">
                  {/* Note: In production, we'd need the full video URL */}
                  <div className="relative w-full h-full flex items-center justify-center bg-surface">
                    {term.exampleClip.thumbnailUrl ? (
                      <>
                        <img
                          src={term.exampleClip.thumbnailUrl}
                          alt={term.exampleClip.title}
                          className="w-full h-full object-contain"
                        />
                        <Link
                          href={`/clips/${term.exampleClip.slug}`}
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                        </Link>
                      </>
                    ) : (
                      <Play className="h-12 w-12 text-foreground-muted" />
                    )}
                  </div>
                </div>
                <div className="p-4 border-t border-border">
                  <Link
                    href={`/clips/${term.exampleClip.slug}`}
                    className="text-foreground hover:text-accent transition-colors"
                  >
                    {term.exampleClip.title}
                  </Link>
                  <p className="text-sm text-foreground-muted mt-1">
                    Duration: {formatDuration(term.exampleClip.duration)}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Related Terms */}
          {term.relatedTermsData && term.relatedTermsData.length > 0 && (
            <section>
              <h2 className="font-semibold text-lg text-foreground mb-4">
                Related Terms
              </h2>
              <div className="flex flex-wrap gap-2">
                {term.relatedTermsData.map((related) => (
                  <Link key={related.id} href={`/glossary/${related.slug}`}>
                    <Badge
                      variant="outline"
                      className="hover:bg-accent hover:text-white transition-colors cursor-pointer"
                    >
                      {related.term}
                    </Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : null}
    </div>
  )
}

function GlossaryTermSkeleton() {
  return (
    <div className="max-w-4xl">
      <Skeleton className="h-10 w-1/2 mb-4" />
      <div className="space-y-2 mb-8">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="aspect-video w-full rounded-card" />
    </div>
  )
}
