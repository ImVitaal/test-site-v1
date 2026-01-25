// Centralized API endpoint definitions

export const API_ENDPOINTS = {
  // Animators
  animators: {
    list: '/animators',
    detail: (slug: string) => `/animators/${slug}`,
    clips: (slug: string) => `/animators/${slug}/clips`,
    timeline: (slug: string) => `/animators/${slug}/timeline`,
  },

  // Clips
  clips: {
    list: '/clips',
    detail: (slug: string) => `/clips/${slug}`,
    favorite: (slug: string) => `/clips/${slug}/favorite`,
    related: (slug: string) => `/clips/${slug}/related`,
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
