// Re-export all types
export * from './animator'
export * from './clip'
export * from './api'

// Common types
export type ID = string

export interface Timestamps {
  createdAt: Date
  updatedAt: Date
}

export interface WithSlug {
  slug: string
}
