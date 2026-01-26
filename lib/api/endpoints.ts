// Centralized API endpoint definitions

export const API_ENDPOINTS = {
  // Animators
  animators: {
    list: '/animators',
    detail: (slug: string) => `/animators/${slug}`,
    clips: (slug: string) => `/animators/${slug}/clips`,
    timeline: (slug: string) => `/animators/${slug}/timeline`,
    relations: (slug: string) => `/animators/${slug}/relations`,
  },

  // Clips
  clips: {
    list: '/clips',
    trending: '/clips/trending',
    detail: (slug: string) => `/clips/${slug}`,
    favorite: (slug: string) => `/clips/${slug}/favorite`,
    related: (slug: string) => `/clips/${slug}/related`,
  },

  // Glossary
  glossary: {
    list: '/glossary',
    detail: (slug: string) => `/glossary/${slug}`,
  },

  // Search
  search: {
    global: '/search',
    animators: '/search/animators',
    clips: '/search/clips',
  },

  // User
  user: {
    profile: '/user/profile',
    favorites: '/user/favorites',
    collections: '/user/collections',
  },

  // Auth
  auth: {
    session: '/auth/session',
  },
} as const
