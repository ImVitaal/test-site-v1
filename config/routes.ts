// Type-safe route definitions

export const ROUTES = {
  home: '/',

  // Animators
  animators: {
    list: '/animators',
    detail: (slug: string) => `/animators/${slug}` as const,
  },

  // Clips
  clips: {
    list: '/clips',
    detail: (slug: string) => `/clips/${slug}` as const,
  },

  // Search
  search: '/search',

  // Upload
  upload: '/upload',

  // User
  profile: '/profile',
  favorites: '/favorites',
  collections: {
    list: '/collections',
    detail: (slug: string) => `/collections/${slug}` as const,
  },

  // Auth
  login: '/login',

  // Static pages
  glossary: '/glossary',
  contribute: '/contribute',

  // Legal
  privacy: '/privacy',
  terms: '/terms',
  dmca: '/dmca',

  // Moderation (admin)
  moderation: {
    dashboard: '/moderation',
    clips: '/moderation/clips',
    animators: '/moderation/animators',
  },
} as const

// Route parameter types
export type AnimatorRouteParams = { slug: string }
export type ClipRouteParams = { slug: string }

// Helper to build routes with params
export function route<T extends string>(
  path: T,
  params?: Record<string, string>
): string {
  if (!params) return path

  let result: string = path
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value)
  })
  return result
}
