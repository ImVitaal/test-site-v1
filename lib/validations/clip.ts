import { z } from 'zod'
import { urlSchema, yearSchema, paginationSchema, sortSchema, searchSchema } from './common'
import { VIDEO_MAX_DURATION_SECONDS } from '@/config/constants'

export const createClipSchema = z.object({
  title: z.string().min(1).max(300),
  animeId: z.string().cuid(),
  episodeNumber: z.coerce.number().int().positive().optional(),
  timestampStart: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/, 'Format: MM:SS')
    .optional(),
  duration: z.coerce.number().int().positive().max(VIDEO_MAX_DURATION_SECONDS),
  techniqueDescription: z
    .string()
    .min(50, 'Technique description must be at least 50 characters for Fair Use compliance')
    .max(5000),
  attributions: z
    .array(
      z.object({
        animatorId: z.string().cuid(),
        role: z.enum([
          'KEY_ANIMATION',
          'SECOND_KEY_ANIMATION',
          'ANIMATION_DIRECTOR',
          'CHIEF_ANIMATION_DIRECTOR',
          'CHARACTER_DESIGN',
          'MECHANICAL_ANIMATION',
          'EFFECTS_ANIMATION',
        ]),
        sourceUrl: urlSchema,
        sourceNote: z.string().max(500).optional(),
      })
    )
    .min(1, 'At least one attribution is required'),
  tagIds: z.array(z.string().cuid()).optional(),
})

export const updateClipSchema = createClipSchema.partial().omit({ duration: true })

export const clipQuerySchema = paginationSchema.merge(sortSchema).merge(searchSchema).extend({
  animatorId: z.string().cuid().optional(),
  animeId: z.string().cuid().optional(),
  studioId: z.string().cuid().optional(),
  tagIds: z
    .string()
    .transform((val) => val.split(',').filter(Boolean))
    .optional(),
  verificationStatus: z.enum(['VERIFIED', 'SPECULATIVE', 'DISPUTED']).optional(),
  yearStart: yearSchema.optional(),
  yearEnd: yearSchema.optional(),
  submissionStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
})

export const moderateClipSchema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().max(1000).optional(),
})

export type CreateClipInput = z.infer<typeof createClipSchema>
export type UpdateClipInput = z.infer<typeof updateClipSchema>
export type ClipQueryInput = z.infer<typeof clipQuerySchema>
export type ModerateClipInput = z.infer<typeof moderateClipSchema>
