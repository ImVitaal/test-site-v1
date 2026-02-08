import { createPersistedStore } from './create-store'
import type { AnimatorSearchParams, ClipSearchParams } from '@/types/api'

interface SearchState {
  // Animator filters
  animatorFilters: AnimatorSearchParams
  setAnimatorFilters: (filters: Partial<AnimatorSearchParams>) => void
  resetAnimatorFilters: () => void

  // Clip filters
  clipFilters: ClipSearchParams
  setClipFilters: (filters: Partial<ClipSearchParams>) => void
  resetClipFilters: () => void

  // Global search query
  globalQuery: string
  setGlobalQuery: (query: string) => void
  clearGlobalQuery: () => void

  // Search type filter
  searchType: 'all' | 'animators' | 'clips'
  setSearchType: (type: 'all' | 'animators' | 'clips') => void

  // Recent searches
  recentSearches: string[]
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
}

const defaultAnimatorFilters: AnimatorSearchParams = {
  page: 1,
  limit: 20,
  sortOrder: 'asc',
}

const defaultClipFilters: ClipSearchParams = {
  page: 1,
  limit: 20,
  sortOrder: 'desc',
}

export const useSearchStore = createPersistedStore<SearchState>(
  'search-store',
  (set) => ({
    // Animator filters
    animatorFilters: defaultAnimatorFilters,
    setAnimatorFilters: (filters) =>
      set((state) => ({
        animatorFilters: { ...state.animatorFilters, ...filters, page: 1 },
      })),
    resetAnimatorFilters: () => set({ animatorFilters: defaultAnimatorFilters }),

    // Clip filters
    clipFilters: defaultClipFilters,
    setClipFilters: (filters) =>
      set((state) => ({
        clipFilters: { ...state.clipFilters, ...filters, page: 1 },
      })),
    resetClipFilters: () => set({ clipFilters: defaultClipFilters }),

    // Global search
    globalQuery: '',
    setGlobalQuery: (query) => set({ globalQuery: query }),
    clearGlobalQuery: () => set({ globalQuery: '' }),

    // Search type
    searchType: 'all',
    setSearchType: (type) => set({ searchType: type }),

    // Recent searches
    recentSearches: [],
    addRecentSearch: (query) =>
      set((state) => {
        const filtered = state.recentSearches.filter((q) => q !== query)
        return {
          recentSearches: [query, ...filtered].slice(0, 10),
        }
      }),
    clearRecentSearches: () => set({ recentSearches: [] }),
  })
)
