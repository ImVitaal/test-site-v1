import { BookOpen } from 'lucide-react'
import { GlossaryIndex } from '@/components/glossary'

export const metadata = {
  title: 'Animation Glossary',
  description:
    'Learn animation terminology with video examples. From smears to impact frames, understand the techniques that make anime animation special.',
}

export default function GlossaryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-accent" />
          </div>
          <h1 className="font-display text-display-sm text-foreground">
            Animation Glossary
          </h1>
        </div>
        <p className="text-foreground-muted max-w-2xl">
          A comprehensive guide to animation terminology. Each term includes a
          definition and video examples to help you understand the techniques
          that make anime animation special.
        </p>
      </div>

      {/* Glossary Index */}
      <GlossaryIndex />
    </div>
  )
}
