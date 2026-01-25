'use client'

import { useState, useEffect, useMemo } from 'react'
import type { MeiliSearch } from 'meilisearch'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { createClientSearchClient, SEARCH_INDEXES, type SearchIndex } from './client'

interface SearchResult<T> {
  hits: T[]
  query: string
  processingTimeMs: number
  estimatedTotalHits: number
}

interface UseSearchOptions {
  limit?: number
  filters?: string
  enabled?: boolean
}

export function useSearch<T>(
  index: SearchIndex,
  query: string,
  options: UseSearchOptions = {}
) {
  const { limit = 10, filters, enabled = true } = options

  const [results, setResults] = useState<SearchResult<T> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const debouncedQuery = useDebounce(query, 200)

  const client = useMemo(() => createClientSearchClient(), [])

  useEffect(() => {
    if (!client || !enabled || !debouncedQuery.trim()) {
      setResults(null)
      setIsLoading(false)
      return
    }

    const searchIndex = SEARCH_INDEXES[index]
    let cancelled = false

    setIsLoading(true)
    setError(null)

    client
      .index(searchIndex)
      .search<T>(debouncedQuery, {
        limit,
        filter: filters,
      })
      .then((res) => {
        if (!cancelled) {
          setResults({
            hits: res.hits,
            query: res.query,
            processingTimeMs: res.processingTimeMs,
            estimatedTotalHits: res.estimatedTotalHits || 0,
          })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [client, debouncedQuery, index, limit, filters, enabled])

  return { results, isLoading, error, isReady: !!client }
}

// Animator search result type
export interface AnimatorSearchHit {
  id: string
  name: string
  nativeName: string | null
  slug: string
  photoUrl: string | null
}

// Clip search result type
export interface ClipSearchHit {
  id: string
  title: string
  slug: string
  thumbnailUrl: string | null
  animeName: string
}

// Specialized hooks
export function useAnimatorSearch(query: string, options?: UseSearchOptions) {
  return useSearch<AnimatorSearchHit>('ANIMATORS', query, options)
}

export function useClipSearch(query: string, options?: UseSearchOptions) {
  return useSearch<ClipSearchHit>('CLIPS', query, options)
}

// Combined global search hook
export function useGlobalSearch(query: string, options?: UseSearchOptions) {
  const animators = useAnimatorSearch(query, { ...options, limit: 5 })
  const clips = useClipSearch(query, { ...options, limit: 5 })

  return {
    animators,
    clips,
    isLoading: animators.isLoading || clips.isLoading,
    hasResults:
      (animators.results?.hits.length || 0) > 0 ||
      (clips.results?.hits.length || 0) > 0,
  }
}
