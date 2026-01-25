import { z } from 'zod'

export const slugSchema = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const searchSchema = z.object({
  q: z.string().min(1).max(200).optional(),
})

export const idSchema = z.string().cuid()

export const urlSchema = z.string().url().optional().or(z.literal(''))

export const yearSchema = z.coerce.number().int().min(1900).max(2100)

export type PaginationInput = z.infer<typeof paginationSchema>
export type SortInput = z.infer<typeof sortSchema>
export type SearchInput = z.infer<typeof searchSchema>
