import { MeiliSearch } from 'meilisearch'

// Index names
export const SEARCH_INDEXES = {
  ANIMATORS: 'animators',
  CLIPS: 'clips',
  ANIME: 'anime',
  TAGS: 'tags',
} as const

export type SearchIndex = keyof typeof SEARCH_INDEXES

// Server-side client (has admin key access)
export function getSearchClient() {
  const host = process.env.MEILISEARCH_HOST
  const apiKey = process.env.MEILISEARCH_ADMIN_KEY

  if (!host) {
    throw new Error('MEILISEARCH_HOST is not configured')
  }

  return new MeiliSearch({
    host,
    apiKey,
  })
}

// Client-side configuration (read-only, safe to expose)
export function getPublicSearchConfig() {
  return {
    host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || '',
    apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY || '',
  }
}

// Create a client-side search client
export function createClientSearchClient() {
  const { host, apiKey } = getPublicSearchConfig()

  if (!host || !apiKey) {
    return null
  }

  return new MeiliSearch({ host, apiKey })
}
