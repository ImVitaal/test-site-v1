import type { Clip, Anime, Attribution, Tag, Animator, VerificationStatus } from '@prisma/client'

export interface ClipWithRelations extends Clip {
  anime: Anime
  attributions: (Attribution & {
    animator: Pick<Animator, 'id' | 'slug' | 'name' | 'nativeName' | 'photoUrl'>
  })[]
  tags: {
    tag: Tag
  }[]
}

export interface ClipCard {
  id: string
  slug: string
  title: string
  thumbnailUrl: string | null
  duration: number
  viewCount: number
  favoriteCount: number
  anime: {
    title: string
    slug: string
  }
  primaryAnimator: {
    name: string
    slug: string
  } | null
  verificationStatus: VerificationStatus
}

export interface ClipDetail extends ClipWithRelations {
  relatedClips: ClipCard[]
}

export interface ClipPlayer {
  videoUrl: string
  duration: number
  title: string
  animeTitle: string
}

export interface ClipAttribution {
  animator: {
    id: string
    slug: string
    name: string
    nativeName: string | null
    photoUrl: string | null
  }
  role: string
  verificationStatus: VerificationStatus
  sourceUrl: string | null
  sourceNote: string | null
}

export interface ClipUploadData {
  title: string
  animeId: string
  episodeNumber?: number
  timestampStart?: string
  techniqueDescription: string
  attributions: {
    animatorId: string
    role: string
  }[]
  tagIds: string[]
}
