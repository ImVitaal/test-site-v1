import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'

// Import functions to test
import {
  getAnimatorBySlug,
  getAnimatorById,
  listAnimators,
} from '@/lib/db/queries/animators'

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  default: mockDeep<PrismaClient>(),
}))

import prisma from '@/lib/db/prisma'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Animator Queries', () => {
  beforeEach(() => {
    mockReset(prismaMock)
  })

  describe('getAnimatorBySlug', () => {
    it('should return animator with slug', async () => {
      const mockAnimator = {
        id: 'test-id',
        slug: 'yutaka-nakamura',
        name: 'Yutaka Nakamura',
        nativeName: '中村豊',
        photoUrl: 'https://example.com/photo.jpg',
        bio: 'Legendary animator',
        birthYear: 1967,
        activeYearStart: 1985,
        activeYearEnd: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        studioHistory: [],
        incomingRelations: [],
        outgoingRelations: [],
        _count: {
          attributions: 150,
          favorites: 50,
        },
      }

      prismaMock.animator.findUnique.mockResolvedValue(mockAnimator)

      const result = await getAnimatorBySlug('yutaka-nakamura')

      expect(result).toEqual(mockAnimator)
      expect(prismaMock.animator.findUnique).toHaveBeenCalledWith({
        where: { slug: 'yutaka-nakamura' },
        include: expect.objectContaining({
          studioHistory: expect.any(Object),
          incomingRelations: expect.any(Object),
          outgoingRelations: expect.any(Object),
          _count: expect.any(Object),
        }),
      })
    })

    it('should return null if animator not found', async () => {
      prismaMock.animator.findUnique.mockResolvedValue(null)

      const result = await getAnimatorBySlug('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('getAnimatorById', () => {
    it('should return animator by id', async () => {
      const mockAnimator = {
        id: 'test-id',
        slug: 'test-animator',
        name: 'Test Animator',
        nativeName: null,
        photoUrl: null,
        bio: null,
        birthYear: null,
        activeYearStart: null,
        activeYearEnd: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prismaMock.animator.findUnique.mockResolvedValue(mockAnimator)

      const result = await getAnimatorById('test-id')

      expect(result).toEqual(mockAnimator)
      expect(prismaMock.animator.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      })
    })

    it('should return null if animator not found', async () => {
      prismaMock.animator.findUnique.mockResolvedValue(null)

      const result = await getAnimatorById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('listAnimators', () => {
    it('should return paginated animators', async () => {
      const mockAnimators = [
        {
          id: '1',
          slug: 'animator-1',
          name: 'Animator 1',
          nativeName: null,
          photoUrl: null,
          bio: null,
          birthYear: null,
          activeYearStart: null,
          activeYearEnd: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { attributions: 10 },
        },
        {
          id: '2',
          slug: 'animator-2',
          name: 'Animator 2',
          nativeName: null,
          photoUrl: null,
          bio: null,
          birthYear: null,
          activeYearStart: null,
          activeYearEnd: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { attributions: 20 },
        },
      ]

      prismaMock.animator.findMany.mockResolvedValue(mockAnimators)
      prismaMock.animator.count.mockResolvedValue(50)

      const result = await listAnimators({ page: 1, limit: 20 })

      expect(result.data).toEqual(mockAnimators)
      expect(result.pagination.total).toBe(50)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(20)
      expect(result.pagination.totalPages).toBe(3)
    })

    it('should filter by search query', async () => {
      prismaMock.animator.findMany.mockResolvedValue([])
      prismaMock.animator.count.mockResolvedValue(0)

      await listAnimators({ page: 1, limit: 20, q: 'Nakamura' })

      expect(prismaMock.animator.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'Nakamura', mode: 'insensitive' } },
              { nativeName: { contains: 'Nakamura', mode: 'insensitive' } },
            ]),
          }),
        })
      )
    })

    it('should filter by hasPhoto', async () => {
      prismaMock.animator.findMany.mockResolvedValue([])
      prismaMock.animator.count.mockResolvedValue(0)

      await listAnimators({ page: 1, limit: 20, hasPhoto: true })

      expect(prismaMock.animator.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            photoUrl: { not: null },
          }),
        })
      )
    })

    it('should apply sorting', async () => {
      prismaMock.animator.findMany.mockResolvedValue([])
      prismaMock.animator.count.mockResolvedValue(0)

      await listAnimators({
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'desc',
      })

      expect(prismaMock.animator.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'desc' },
        })
      )
    })

    it('should handle pagination correctly', async () => {
      prismaMock.animator.findMany.mockResolvedValue([])
      prismaMock.animator.count.mockResolvedValue(100)

      await listAnimators({ page: 3, limit: 20 })

      expect(prismaMock.animator.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 40, // (page 3 - 1) * 20
          take: 20,
        })
      )
    })
  })
})
