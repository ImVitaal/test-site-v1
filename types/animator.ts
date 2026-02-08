import type { Animator, Studio, StudioHistory, AnimatorRelation } from '@prisma/client'

export interface AnimatorWithRelations extends Animator {
  attributions?: {
    clip: {
      id: string
      slug: string
      title: string
      thumbnailUrl: string | null
    }
  }[]
  studioHistory?: (StudioHistory & {
    studio: Studio
  })[]
  mentors?: (AnimatorRelation & {
    mentor: Pick<Animator, 'id' | 'slug' | 'name' | 'photoUrl'>
  })[]
  students?: (AnimatorRelation & {
    student: Pick<Animator, 'id' | 'slug' | 'name' | 'photoUrl'>
  })[]
}

export interface AnimatorCard {
  id: string
  slug: string
  name: string
  nativeName: string | null
  photoUrl: string | null
  clipCount: number
  activeYears: string
}

export interface AnimatorStats {
  totalClips: number
  verifiedClips: number
  activeYears: string
  favoriteCount: number
}

export interface AnimatorTimelineEntry {
  year: number
  works: {
    animeTitle: string
    animeSlug: string
    role: string
    clipCount: number
  }[]
}

export interface AnimatorRelationGraph {
  nodes: {
    id: string
    slug: string
    name: string
    photoUrl: string | null
    type: 'center' | 'mentor' | 'student' | 'colleague'
  }[]
  edges: {
    source: string
    target: string
    type: 'mentor' | 'student' | 'colleague'
  }[]
}
