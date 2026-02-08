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

// Utility types
export type Awaited<T> = T extends Promise<infer U> ? U : T

export type InferData<T> = T extends { data: infer D } ? D : never

export type InferPaginatedData<T> = T extends { data: Array<infer D> } ? D : never

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Re-export Prisma enums for convenience
export type {
  VerificationStatus,
  UserRole,
  SubmissionStatus,
  Role,
} from '@prisma/client'
