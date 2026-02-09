import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'

// Import functions to test
import { getGlossaryTerms, getGlossaryTermBySlug } from '@/lib/db/queries/glossary'

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  default: mockDeep<PrismaClient>(),
}))

import prisma from '@/lib/db/prisma'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Glossary Queries', () => {
  beforeEach(() => {
    mockReset(prismaMock)
  })

  describe('getGlossaryTerms', () => {
    it('should return all glossary terms', async () => {
      const mockTerms = [
        {
          id: 'term-1',
          slug: 'sakuga',
          term: 'Sakuga',
          definition: 'Exceptionally well-animated sequences',
          exampleClipId: null,
          relatedTerms: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'term-2',
          slug: 'key-animation',
          term: 'Key Animation',
          definition: 'The main drawings that define motion',
          exampleClipId: null,
          relatedTerms: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      prismaMock.glossaryTerm.findMany.mockResolvedValue(mockTerms)
      prismaMock.glossaryTerm.count.mockResolvedValue(2)

      const result = await getGlossaryTerms()

      expect(result.data).toEqual(mockTerms)
      expect(result.total).toBe(2)
    })

    it('should filter by search query', async () => {
      prismaMock.glossaryTerm.findMany.mockResolvedValue([])
      prismaMock.glossaryTerm.count.mockResolvedValue(0)

      await getGlossaryTerms({ q: 'animation' })

      expect(prismaMock.glossaryTerm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { term: { contains: 'animation', mode: 'insensitive' } },
              { definition: { contains: 'animation', mode: 'insensitive' } },
            ]),
          }),
        })
      )
    })

    it('should filter by letter', async () => {
      prismaMock.glossaryTerm.findMany.mockResolvedValue([])
      prismaMock.glossaryTerm.count.mockResolvedValue(0)

      await getGlossaryTerms({ letter: 'S' })

      expect(prismaMock.glossaryTerm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            term: { startsWith: 'S', mode: 'insensitive' },
          }),
        })
      )
    })

    it('should handle pagination', async () => {
      prismaMock.glossaryTerm.findMany.mockResolvedValue([])
      prismaMock.glossaryTerm.count.mockResolvedValue(100)

      await getGlossaryTerms({ limit: 20, offset: 40 })

      expect(prismaMock.glossaryTerm.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 40,
          take: 20,
        })
      )
    })
  })

  describe('getGlossaryTermBySlug', () => {
    it('should return term by slug', async () => {
      const mockTerm = {
        id: 'term-1',
        slug: 'sakuga',
        term: 'Sakuga',
        definition: 'Exceptionally well-animated sequences',
        exampleClipId: 'clip-1',
        relatedTerms: ['key-animation', 'in-between'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockClip = {
        id: 'clip-1',
        slug: 'example-clip',
        title: 'Example Clip',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        duration: 30,
      }

      prismaMock.glossaryTerm.findUnique.mockResolvedValue(mockTerm)
      prismaMock.clip.findUnique.mockResolvedValue(mockClip as any)

      const result = await getGlossaryTermBySlug('sakuga')

      expect(result).toBeDefined()
      expect(result?.term).toBe('Sakuga')
      expect(result?.exampleClip).toMatchObject({
        id: 'clip-1',
        title: 'Example Clip',
      })
    })

    it('should return null if term not found', async () => {
      prismaMock.glossaryTerm.findUnique.mockResolvedValue(null)

      const result = await getGlossaryTermBySlug('non-existent')

      expect(result).toBeNull()
    })

    it('should handle terms without example clips', async () => {
      const mockTerm = {
        id: 'term-1',
        slug: 'sakuga',
        term: 'Sakuga',
        definition: 'Exceptionally well-animated sequences',
        exampleClipId: null,
        relatedTerms: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prismaMock.glossaryTerm.findUnique.mockResolvedValue(mockTerm)

      const result = await getGlossaryTermBySlug('sakuga')

      expect(result).toBeDefined()
      expect(result?.exampleClip).toBeNull()
    })
  })
})
