import { describe, it, expect } from 'vitest'
import {
  createClipSchema,
  updateClipSchema,
  clipQuerySchema,
  moderateClipSchema,
} from '@/lib/validations/clip'
import { VIDEO_MAX_DURATION_SECONDS } from '@/config/constants'

describe('createClipSchema', () => {
  const validClipData = {
    title: 'Amazing Sakuga Sequence',
    animeId: 'clh8rl3y00000l708abcd1234',
    episodeNumber: 12,
    timestampStart: '5:30',
    duration: 30,
    techniqueDescription:
      'This sequence demonstrates exceptional use of limited animation principles, where the animator creates the illusion of dynamic motion through strategic pose-to-pose keyframes.',
    attributions: [
      {
        animatorId: 'clh8rl3y00001l708efgh5678',
        role: 'KEY_ANIMATION',
        sourceUrl: 'https://www.sakugabooru.com/post/show/12345',
        sourceNote: 'Confirmed by production credits',
      },
    ],
    tagIds: ['clh8rl3y00002l708ijkl9012'],
  }

  describe('valid inputs', () => {
    it('should accept valid clip data', () => {
      const result = createClipSchema.safeParse(validClipData)
      expect(result.success).toBe(true)
    })

    it('should accept clip without optional episodeNumber', () => {
      const data = { ...validClipData }
      delete data.episodeNumber
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept clip without optional timestampStart', () => {
      const data = { ...validClipData }
      delete data.timestampStart
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept clip without optional tagIds', () => {
      const data = { ...validClipData }
      delete data.tagIds
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept clip without optional sourceNote in attributions', () => {
      const data = {
        ...validClipData,
        attributions: [
          {
            animatorId: 'clh8rl3y00001l708efgh5678',
            role: 'KEY_ANIMATION',
            sourceUrl: 'https://www.sakugabooru.com/post/show/12345',
          },
        ],
      }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept multiple attributions', () => {
      const data = {
        ...validClipData,
        attributions: [
          {
            animatorId: 'clh8rl3y00001l708efgh5678',
            role: 'KEY_ANIMATION',
            sourceUrl: 'https://www.sakugabooru.com/post/show/12345',
          },
          {
            animatorId: 'clh8rl3y00003l708mnop3456',
            role: 'ANIMATION_DIRECTOR',
            sourceUrl: 'https://www.sakugabooru.com/post/show/67890',
          },
        ],
      }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept all valid animation roles', () => {
      const roles = [
        'KEY_ANIMATION',
        'SECOND_KEY_ANIMATION',
        'ANIMATION_DIRECTOR',
        'CHIEF_ANIMATION_DIRECTOR',
        'CHARACTER_DESIGN',
        'MECHANICAL_ANIMATION',
        'EFFECTS_ANIMATION',
      ]

      roles.forEach((role) => {
        const data = {
          ...validClipData,
          attributions: [
            {
              animatorId: 'clh8rl3y00001l708efgh5678',
              role,
              sourceUrl: 'https://www.sakugabooru.com/post/show/12345',
            },
          ],
        }
        const result = createClipSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should coerce duration to number', () => {
      const data = {
        ...validClipData,
        duration: '25',
      }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.duration).toBe(25)
      }
    })

    it('should coerce episodeNumber to number', () => {
      const data = {
        ...validClipData,
        episodeNumber: '5',
      }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.episodeNumber).toBe(5)
      }
    })

    it('should accept valid timestamp formats', () => {
      const validTimestamps = ['0:00', '1:23', '12:34', '99:59']
      validTimestamps.forEach((timestamp) => {
        const data = { ...validClipData, timestampStart: timestamp }
        const result = createClipSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('title validation', () => {
    it('should reject empty title', () => {
      const data = { ...validClipData, title: '' }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject title exceeding 300 characters', () => {
      const data = { ...validClipData, title: 'a'.repeat(301) }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept title at max length (300 characters)', () => {
      const data = { ...validClipData, title: 'a'.repeat(300) }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('CUID validation', () => {
    it('should reject invalid animeId format', () => {
      const data = { ...validClipData, animeId: 'invalid-id' }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid animatorId in attributions', () => {
      const data = {
        ...validClipData,
        attributions: [
          {
            animatorId: 'not-a-cuid',
            role: 'KEY_ANIMATION',
            sourceUrl: 'https://example.com',
          },
        ],
      }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid tagIds', () => {
      const data = { ...validClipData, tagIds: ['invalid-id'] }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('episodeNumber validation', () => {
    it('should reject negative episode number', () => {
      const data = { ...validClipData, episodeNumber: -1 }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject zero episode number', () => {
      const data = { ...validClipData, episodeNumber: 0 }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject non-integer episode number', () => {
      const data = { ...validClipData, episodeNumber: 5.5 }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('timestampStart validation', () => {
    it('should reject invalid timestamp format', () => {
      const invalidTimestamps = ['123', '1:2:3', 'abc', '1-23', '100:00']
      invalidTimestamps.forEach((timestamp) => {
        const data = { ...validClipData, timestampStart: timestamp }
        const result = createClipSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    it('should accept timestamp with 60 seconds (regex allows it)', () => {
      // Note: The regex only validates format (MM:SS), not value ranges
      const data = { ...validClipData, timestampStart: '5:60' }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('duration validation', () => {
    it('should reject negative duration', () => {
      const data = { ...validClipData, duration: -1 }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject zero duration', () => {
      const data = { ...validClipData, duration: 0 }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject non-integer duration', () => {
      const data = { ...validClipData, duration: 25.5 }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject duration exceeding max limit', () => {
      const data = { ...validClipData, duration: VIDEO_MAX_DURATION_SECONDS + 1 }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept duration at max limit', () => {
      const data = { ...validClipData, duration: VIDEO_MAX_DURATION_SECONDS }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('techniqueDescription validation', () => {
    it('should reject description shorter than 50 characters', () => {
      const data = { ...validClipData, techniqueDescription: 'Short description.' }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Fair Use compliance')
      }
    })

    it('should accept description at minimum length (50 characters)', () => {
      const data = { ...validClipData, techniqueDescription: 'a'.repeat(50) }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject description exceeding 5000 characters', () => {
      const data = { ...validClipData, techniqueDescription: 'a'.repeat(5001) }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept description at max length (5000 characters)', () => {
      const data = { ...validClipData, techniqueDescription: 'a'.repeat(5000) }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  describe('attributions validation', () => {
    it('should reject empty attributions array', () => {
      const data = { ...validClipData, attributions: [] }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('At least one attribution is required')
      }
    })

    it('should reject invalid role', () => {
      const data = {
        ...validClipData,
        attributions: [
          {
            animatorId: 'clh8rl3y00001l708efgh5678',
            role: 'INVALID_ROLE',
            sourceUrl: 'https://example.com',
          },
        ],
      }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject invalid sourceUrl', () => {
      const data = {
        ...validClipData,
        attributions: [
          {
            animatorId: 'clh8rl3y00001l708efgh5678',
            role: 'KEY_ANIMATION',
            sourceUrl: 'not-a-url',
          },
        ],
      }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept empty string as sourceUrl', () => {
      const data = {
        ...validClipData,
        attributions: [
          {
            animatorId: 'clh8rl3y00001l708efgh5678',
            role: 'KEY_ANIMATION',
            sourceUrl: '',
          },
        ],
      }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject sourceNote exceeding 500 characters', () => {
      const data = {
        ...validClipData,
        attributions: [
          {
            animatorId: 'clh8rl3y00001l708efgh5678',
            role: 'KEY_ANIMATION',
            sourceUrl: 'https://example.com',
            sourceNote: 'a'.repeat(501),
          },
        ],
      }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept sourceNote at max length (500 characters)', () => {
      const data = {
        ...validClipData,
        attributions: [
          {
            animatorId: 'clh8rl3y00001l708efgh5678',
            role: 'KEY_ANIMATION',
            sourceUrl: 'https://example.com',
            sourceNote: 'a'.repeat(500),
          },
        ],
      }
      const result = createClipSchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })
})

describe('updateClipSchema', () => {
  it('should accept partial updates', () => {
    const data = { title: 'Updated Title' }
    const result = updateClipSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should accept empty object (all fields optional)', () => {
    const data = {}
    const result = updateClipSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should silently ignore duration field (omitted from schema)', () => {
    // Note: Zod omit() removes the field but doesn't make schema strict
    // So extra fields are silently ignored, not rejected
    const data = { duration: 30 }
    const result = updateClipSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).not.toHaveProperty('duration')
    }
  })

  it('should accept updating only title', () => {
    const data = { title: 'New Title' }
    const result = updateClipSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should accept updating only techniqueDescription', () => {
    const data = {
      techniqueDescription:
        'Updated description with at least 50 characters to meet Fair Use compliance requirements.',
    }
    const result = updateClipSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should accept updating only attributions', () => {
    const data = {
      attributions: [
        {
          animatorId: 'clh8rl3y00001l708efgh5678',
          role: 'KEY_ANIMATION',
          sourceUrl: 'https://example.com',
        },
      ],
    }
    const result = updateClipSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should validate partial fields against same rules as create', () => {
    const data = { title: 'a'.repeat(301) }
    const result = updateClipSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('clipQuerySchema', () => {
  describe('pagination', () => {
    it('should accept valid pagination params', () => {
      const data = { page: 1, limit: 20 }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should use default values when not provided', () => {
      const data = {}
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20)
      }
    })

    it('should coerce page to number', () => {
      const data = { page: '5' }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(5)
      }
    })

    it('should coerce limit to number', () => {
      const data = { limit: '50' }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(50)
      }
    })

    it('should reject negative page', () => {
      const data = { page: -1 }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject limit exceeding max (100)', () => {
      const data = { limit: 101 }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('sorting', () => {
    it('should accept valid sortBy and sortOrder', () => {
      const data = { sortBy: 'createdAt', sortOrder: 'asc' }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should default sortOrder to desc', () => {
      const data = {}
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.sortOrder).toBe('desc')
      }
    })

    it('should reject invalid sortOrder', () => {
      const data = { sortOrder: 'invalid' }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('search', () => {
    it('should accept valid search query', () => {
      const data = { q: 'sakuga' }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject search query exceeding 200 characters', () => {
      const data = { q: 'a'.repeat(201) }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject empty search query', () => {
      const data = { q: '' }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('filters', () => {
    it('should accept valid animatorId', () => {
      const data = { animatorId: 'clh8rl3y00001l708efgh5678' }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept valid animeId', () => {
      const data = { animeId: 'clh8rl3y00001l708efgh5678' }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept valid studioId', () => {
      const data = { studioId: 'clh8rl3y00001l708efgh5678' }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid CUID for animatorId', () => {
      const data = { animatorId: 'invalid-id' }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should transform tagIds from comma-separated string to array', () => {
      const data = {
        tagIds: 'clh8rl3y00001l708efgh5678,clh8rl3y00002l708ijkl9012',
      }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.tagIds).toEqual([
          'clh8rl3y00001l708efgh5678',
          'clh8rl3y00002l708ijkl9012',
        ])
      }
    })

    it('should filter out empty strings in tagIds transformation', () => {
      const data = { tagIds: 'clh8rl3y00001l708efgh5678,,clh8rl3y00002l708ijkl9012,' }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.tagIds).toEqual([
          'clh8rl3y00001l708efgh5678',
          'clh8rl3y00002l708ijkl9012',
        ])
      }
    })

    it('should accept valid verificationStatus', () => {
      const statuses = ['VERIFIED', 'SPECULATIVE', 'DISPUTED']
      statuses.forEach((status) => {
        const data = { verificationStatus: status }
        const result = clipQuerySchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid verificationStatus', () => {
      const data = { verificationStatus: 'INVALID' }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept valid yearStart', () => {
      const data = { yearStart: 2020 }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should accept valid yearEnd', () => {
      const data = { yearEnd: 2023 }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should coerce yearStart to number', () => {
      const data = { yearStart: '2020' }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.yearStart).toBe(2020)
      }
    })

    it('should reject yearStart before 1900', () => {
      const data = { yearStart: 1899 }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should reject yearEnd after 2100', () => {
      const data = { yearEnd: 2101 }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('should accept valid submissionStatus', () => {
      const statuses = ['PENDING', 'APPROVED', 'REJECTED']
      statuses.forEach((status) => {
        const data = { submissionStatus: status }
        const result = clipQuerySchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid submissionStatus', () => {
      const data = { submissionStatus: 'INVALID' }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe('combined parameters', () => {
    it('should accept all valid parameters together', () => {
      const data = {
        page: 2,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'asc',
        q: 'sakuga',
        animatorId: 'clh8rl3y00001l708efgh5678',
        animeId: 'clh8rl3y00002l708ijkl9012',
        studioId: 'clh8rl3y00003l708mnop3456',
        tagIds: 'clh8rl3y00004l708qrst7890',
        verificationStatus: 'VERIFIED',
        yearStart: 2020,
        yearEnd: 2023,
        submissionStatus: 'APPROVED',
      }
      const result = clipQuerySchema.safeParse(data)
      expect(result.success).toBe(true)
    })
  })
})

describe('moderateClipSchema', () => {
  it('should accept approve action', () => {
    const data = { action: 'approve' }
    const result = moderateClipSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should accept reject action', () => {
    const data = { action: 'reject' }
    const result = moderateClipSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject invalid action', () => {
    const data = { action: 'invalid' }
    const result = moderateClipSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should accept action with optional reason', () => {
    const data = { action: 'reject', reason: 'Does not meet Fair Use criteria' }
    const result = moderateClipSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should accept action without reason', () => {
    const data = { action: 'approve' }
    const result = moderateClipSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject reason exceeding 1000 characters', () => {
    const data = { action: 'reject', reason: 'a'.repeat(1001) }
    const result = moderateClipSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should accept reason at max length (1000 characters)', () => {
    const data = { action: 'reject', reason: 'a'.repeat(1000) }
    const result = moderateClipSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})
