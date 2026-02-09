import { describe, it, expect } from 'vitest'
import {
  slugSchema,
  paginationSchema,
  sortSchema,
  searchSchema,
  idSchema,
  urlSchema,
  yearSchema,
} from '@/lib/validations/common'

describe('slugSchema', () => {
  describe('valid inputs', () => {
    it('should accept simple lowercase slug', () => {
      const result = slugSchema.safeParse('hayao-miyazaki')
      expect(result.success).toBe(true)
    })

    it('should accept slug with numbers', () => {
      const result = slugSchema.safeParse('animator-123')
      expect(result.success).toBe(true)
    })

    it('should accept slug with multiple hyphens', () => {
      const result = slugSchema.safeParse('first-middle-last-name')
      expect(result.success).toBe(true)
    })

    it('should accept single character slug', () => {
      const result = slugSchema.safeParse('a')
      expect(result.success).toBe(true)
    })

    it('should accept slug at max length (200 characters)', () => {
      const result = slugSchema.safeParse('a'.repeat(200))
      expect(result.success).toBe(true)
    })

    it('should accept slug with only numbers', () => {
      const result = slugSchema.safeParse('123456')
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject empty string', () => {
      const result = slugSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('should reject uppercase letters', () => {
      const result = slugSchema.safeParse('Hayao-Miyazaki')
      expect(result.success).toBe(false)
    })

    it('should reject spaces', () => {
      const result = slugSchema.safeParse('hayao miyazaki')
      expect(result.success).toBe(false)
    })

    it('should reject underscores', () => {
      const result = slugSchema.safeParse('hayao_miyazaki')
      expect(result.success).toBe(false)
    })

    it('should reject special characters', () => {
      const result = slugSchema.safeParse('hayao@miyazaki')
      expect(result.success).toBe(false)
    })

    it('should reject slug starting with hyphen', () => {
      const result = slugSchema.safeParse('-hayao-miyazaki')
      expect(result.success).toBe(false)
    })

    it('should reject slug ending with hyphen', () => {
      const result = slugSchema.safeParse('hayao-miyazaki-')
      expect(result.success).toBe(false)
    })

    it('should reject consecutive hyphens', () => {
      const result = slugSchema.safeParse('hayao--miyazaki')
      expect(result.success).toBe(false)
    })

    it('should reject slug exceeding 200 characters', () => {
      const result = slugSchema.safeParse('a'.repeat(201))
      expect(result.success).toBe(false)
    })

    it('should reject slug with dots', () => {
      const result = slugSchema.safeParse('hayao.miyazaki')
      expect(result.success).toBe(false)
    })
  })
})

describe('paginationSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid page and limit', () => {
      const result = paginationSchema.safeParse({ page: 1, limit: 20 })
      expect(result.success).toBe(true)
    })

    it('should use default values when not provided', () => {
      const result = paginationSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20)
      }
    })

    it('should coerce page from string to number', () => {
      const result = paginationSchema.safeParse({ page: '5' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(5)
      }
    })

    it('should coerce limit from string to number', () => {
      const result = paginationSchema.safeParse({ limit: '50' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.limit).toBe(50)
      }
    })

    it('should accept limit at max (100)', () => {
      const result = paginationSchema.safeParse({ limit: 100 })
      expect(result.success).toBe(true)
    })

    it('should accept large page numbers', () => {
      const result = paginationSchema.safeParse({ page: 999 })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject negative page', () => {
      const result = paginationSchema.safeParse({ page: -1 })
      expect(result.success).toBe(false)
    })

    it('should reject zero page', () => {
      const result = paginationSchema.safeParse({ page: 0 })
      expect(result.success).toBe(false)
    })

    it('should reject negative limit', () => {
      const result = paginationSchema.safeParse({ limit: -1 })
      expect(result.success).toBe(false)
    })

    it('should reject zero limit', () => {
      const result = paginationSchema.safeParse({ limit: 0 })
      expect(result.success).toBe(false)
    })

    it('should reject limit exceeding max (100)', () => {
      const result = paginationSchema.safeParse({ limit: 101 })
      expect(result.success).toBe(false)
    })

    it('should reject non-integer page', () => {
      const result = paginationSchema.safeParse({ page: 5.5 })
      expect(result.success).toBe(false)
    })

    it('should reject non-integer limit', () => {
      const result = paginationSchema.safeParse({ limit: 25.7 })
      expect(result.success).toBe(false)
    })
  })
})

describe('sortSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid sortBy and sortOrder', () => {
      const result = sortSchema.safeParse({ sortBy: 'createdAt', sortOrder: 'asc' })
      expect(result.success).toBe(true)
    })

    it('should accept sortOrder asc', () => {
      const result = sortSchema.safeParse({ sortOrder: 'asc' })
      expect(result.success).toBe(true)
    })

    it('should accept sortOrder desc', () => {
      const result = sortSchema.safeParse({ sortOrder: 'desc' })
      expect(result.success).toBe(true)
    })

    it('should default sortOrder to desc when not provided', () => {
      const result = sortSchema.safeParse({})
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.sortOrder).toBe('desc')
      }
    })

    it('should accept sortBy without sortOrder', () => {
      const result = sortSchema.safeParse({ sortBy: 'title' })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.sortOrder).toBe('desc')
      }
    })

    it('should accept any string for sortBy', () => {
      const result = sortSchema.safeParse({ sortBy: 'customField' })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject invalid sortOrder', () => {
      const result = sortSchema.safeParse({ sortOrder: 'invalid' })
      expect(result.success).toBe(false)
    })

    it('should reject numeric sortOrder', () => {
      const result = sortSchema.safeParse({ sortOrder: 1 })
      expect(result.success).toBe(false)
    })

    it('should reject uppercase sortOrder', () => {
      const result = sortSchema.safeParse({ sortOrder: 'ASC' })
      expect(result.success).toBe(false)
    })
  })
})

describe('searchSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid search query', () => {
      const result = searchSchema.safeParse({ q: 'sakuga' })
      expect(result.success).toBe(true)
    })

    it('should accept search query with spaces', () => {
      const result = searchSchema.safeParse({ q: 'hayao miyazaki' })
      expect(result.success).toBe(true)
    })

    it('should accept search query with special characters', () => {
      const result = searchSchema.safeParse({ q: 'attack on titan!' })
      expect(result.success).toBe(true)
    })

    it('should accept single character search', () => {
      const result = searchSchema.safeParse({ q: 'a' })
      expect(result.success).toBe(true)
    })

    it('should accept search query at max length (200 characters)', () => {
      const result = searchSchema.safeParse({ q: 'a'.repeat(200) })
      expect(result.success).toBe(true)
    })

    it('should accept empty object (q is optional)', () => {
      const result = searchSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept search with numbers', () => {
      const result = searchSchema.safeParse({ q: 'episode 123' })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject empty string', () => {
      const result = searchSchema.safeParse({ q: '' })
      expect(result.success).toBe(false)
    })

    it('should reject search query exceeding 200 characters', () => {
      const result = searchSchema.safeParse({ q: 'a'.repeat(201) })
      expect(result.success).toBe(false)
    })
  })
})

describe('idSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid CUID', () => {
      const result = idSchema.safeParse('clh8rl3y00000l708abcd1234')
      expect(result.success).toBe(true)
    })

    it('should accept another valid CUID format', () => {
      const result = idSchema.safeParse('cljk9m8n00001l80xyz987654')
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject empty string', () => {
      const result = idSchema.safeParse('')
      expect(result.success).toBe(false)
    })

    it('should reject short string', () => {
      const result = idSchema.safeParse('abc123')
      expect(result.success).toBe(false)
    })

    it('should reject UUID format', () => {
      const result = idSchema.safeParse('550e8400-e29b-41d4-a716-446655440000')
      expect(result.success).toBe(false)
    })

    it('should reject invalid CUID with special characters', () => {
      const result = idSchema.safeParse('clh8rl3y-0000-l708-abcd-1234')
      expect(result.success).toBe(false)
    })

    it('should reject plain text', () => {
      const result = idSchema.safeParse('not-a-cuid')
      expect(result.success).toBe(false)
    })

    it('should reject number', () => {
      const result = idSchema.safeParse(123456789)
      expect(result.success).toBe(false)
    })
  })
})

describe('urlSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid HTTP URL', () => {
      const result = urlSchema.safeParse('http://example.com')
      expect(result.success).toBe(true)
    })

    it('should accept valid HTTPS URL', () => {
      const result = urlSchema.safeParse('https://example.com')
      expect(result.success).toBe(true)
    })

    it('should accept URL with path', () => {
      const result = urlSchema.safeParse('https://example.com/path/to/page')
      expect(result.success).toBe(true)
    })

    it('should accept URL with query parameters', () => {
      const result = urlSchema.safeParse('https://example.com?foo=bar&baz=qux')
      expect(result.success).toBe(true)
    })

    it('should accept URL with hash', () => {
      const result = urlSchema.safeParse('https://example.com/page#section')
      expect(result.success).toBe(true)
    })

    it('should accept URL with port', () => {
      const result = urlSchema.safeParse('https://example.com:8080/path')
      expect(result.success).toBe(true)
    })

    it('should accept empty string (literal)', () => {
      const result = urlSchema.safeParse('')
      expect(result.success).toBe(true)
    })

    it('should accept undefined (optional)', () => {
      const result = urlSchema.safeParse(undefined)
      expect(result.success).toBe(true)
    })

    it('should accept URL with subdomain', () => {
      const result = urlSchema.safeParse('https://www.sakugabooru.com/post/show/12345')
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject invalid URL', () => {
      const result = urlSchema.safeParse('not-a-url')
      expect(result.success).toBe(false)
    })

    it('should reject URL without protocol', () => {
      const result = urlSchema.safeParse('example.com')
      expect(result.success).toBe(false)
    })

    it('should reject URL with spaces', () => {
      const result = urlSchema.safeParse('https://example .com')
      expect(result.success).toBe(false)
    })

    it('should reject malformed URL', () => {
      const result = urlSchema.safeParse('ht!tp://example.com')
      expect(result.success).toBe(false)
    })

    it('should reject plain text that is not empty', () => {
      const result = urlSchema.safeParse('some text')
      expect(result.success).toBe(false)
    })
  })
})

describe('yearSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid year', () => {
      const result = yearSchema.safeParse(2023)
      expect(result.success).toBe(true)
    })

    it('should accept year at min (1900)', () => {
      const result = yearSchema.safeParse(1900)
      expect(result.success).toBe(true)
    })

    it('should accept year at max (2100)', () => {
      const result = yearSchema.safeParse(2100)
      expect(result.success).toBe(true)
    })

    it('should coerce year from string to number', () => {
      const result = yearSchema.safeParse('2023')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(2023)
      }
    })

    it('should accept year in early 1900s', () => {
      const result = yearSchema.safeParse(1917)
      expect(result.success).toBe(true)
    })

    it('should accept current year', () => {
      const result = yearSchema.safeParse(2024)
      expect(result.success).toBe(true)
    })

    it('should accept future year within range', () => {
      const result = yearSchema.safeParse(2050)
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject year before min (1900)', () => {
      const result = yearSchema.safeParse(1899)
      expect(result.success).toBe(false)
    })

    it('should reject year after max (2100)', () => {
      const result = yearSchema.safeParse(2101)
      expect(result.success).toBe(false)
    })

    it('should reject non-integer year', () => {
      const result = yearSchema.safeParse(2023.5)
      expect(result.success).toBe(false)
    })

    it('should reject negative year', () => {
      const result = yearSchema.safeParse(-2023)
      expect(result.success).toBe(false)
    })

    it('should reject zero', () => {
      const result = yearSchema.safeParse(0)
      expect(result.success).toBe(false)
    })

    it('should reject very old year', () => {
      const result = yearSchema.safeParse(1000)
      expect(result.success).toBe(false)
    })

    it('should reject far future year', () => {
      const result = yearSchema.safeParse(3000)
      expect(result.success).toBe(false)
    })
  })
})
