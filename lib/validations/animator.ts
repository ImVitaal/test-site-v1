import { z } from 'zod'
import { slugSchema, urlSchema, yearSchema, paginationSchema, sortSchema, searchSchema } from './common'

export const createAnimatorSchema = z.object({
  name: z.string().min(1).max(200),
  nativeName: z.string().max(200).optional(),
  bio: z.string().max(10000).optional(),
  birthDate: z.coerce.date().optional(),
  deathDate: z.coerce.date().optional(),
  photoUrl: urlSchema,
  twitterHandle: z.string().max(50).optional(),
  pixivId: z.string().max(50).optional(),
  websiteUrl: urlSchema,
})

export const updateAnimatorSchema = createAnimatorSchema.partial()

export const animatorQuerySchema = paginationSchema.merge(sortSchema).merge(searchSchema).extend({
  hasPhoto: z.coerce.boolean().optional(),
  activeYearStart: yearSchema.optional(),
  activeYearEnd: yearSchema.optional(),
})

export const animatorRelationSchema = z.object({
  mentorId: z.string().cuid(),
  studentId: z.string().cuid(),
  relationType: z.enum(['mentor', 'colleague', 'influenced_by']).default('mentor'),
  startYear: yearSchema.optional(),
  endYear: yearSchema.optional(),
})

export const studioHistorySchema = z.object({
  animatorId: z.string().cuid(),
  studioId: z.string().cuid(),
  startYear: yearSchema,
  endYear: yearSchema.optional(),
  position: z.string().max(100).optional(),
})

export type CreateAnimatorInput = z.infer<typeof createAnimatorSchema>
export type UpdateAnimatorInput = z.infer<typeof updateAnimatorSchema>
export type AnimatorQueryInput = z.infer<typeof animatorQuerySchema>
