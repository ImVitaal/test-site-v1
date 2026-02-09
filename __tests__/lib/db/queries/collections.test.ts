import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'

// Import functions to test
import {
  getUserCollections,
  getCollectionBySlug,
} from '@/lib/db/queries/collections'

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  default: mockDeep<PrismaClient>(),
}))

import prisma from '@/lib/db/prisma'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Collections Queries', () => {
  beforeEach(() => {
    mockReset(prismaMock)
  })

  describe('getUserCollections', () => {
    it('should return user collections', async () => {
      const mockCollections = [
        {
          id: 'coll-1',
          slug: 'my-favorites',
          name: 'My Favorites',
          description: 'My favorite clips',
          isPublic: true,
          userId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          clips: [
            {
              clip: {
                thumbnailUrl: 'https://example.com/thumb1.jpg',
              },
            },
            {
              clip: {
                thumbnailUrl: 'https://example.com/thumb2.jpg',
              },
            },
          ],
          _count: {
            clips: 10,
          },
        },
      ]

      prismaMock.collection.findMany.mockResolvedValue(mockCollections as any)

      const result = await getUserCollections('user-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'coll-1',
        name: 'My Favorites',
        clipCount: 10,
      })
      expect(result[0].thumbnails).toHaveLength(2)
    })

    it('should order by updatedAt desc', async () => {
      prismaMock.collection.findMany.mockResolvedValue([])

      await getUserCollections('user-1')

      expect(prismaMock.collection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { updatedAt: 'desc' },
        })
      )
    })

    it('should limit clips preview to 4', async () => {
      prismaMock.collection.findMany.mockResolvedValue([])

      await getUserCollections('user-1')

      expect(prismaMock.collection.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            clips: expect.objectContaining({
              take: 4,
            }),
          }),
        })
      )
    })
  })

  describe('getCollectionBySlug', () => {
    it('should return collection by slug', async () => {
      const mockCollection = {
        id: 'coll-1',
        slug: 'my-collection',
        name: 'My Collection',
        description: 'Test collection',
        isPublic: true,
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-1',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
        },
        clips: [
          {
            order: 0,
            clip: {
              id: 'clip-1',
              slug: 'test-clip',
              title: 'Test Clip',
              thumbnailUrl: 'https://example.com/thumb.jpg',
              duration: 30,
              anime: {
                title: 'Test Anime',
                slug: 'test-anime',
              },
              attributions: [
                {
                  animator: {
                    name: 'Test Animator',
                    slug: 'test-animator',
                  },
                },
              ],
            },
          },
        ],
        _count: {
          clips: 1,
        },
      }

      prismaMock.collection.findUnique.mockResolvedValue(mockCollection as any)

      const result = await getCollectionBySlug('my-collection')

      expect(result).toBeDefined()
      expect(result?.name).toBe('My Collection')
      expect(result?.user.name).toBe('Test User')
    })

    it('should return null if collection not found', async () => {
      prismaMock.collection.findUnique.mockResolvedValue(null)

      const result = await getCollectionBySlug('non-existent')

      expect(result).toBeNull()
    })

    it('should include user and clips', async () => {
      prismaMock.collection.findUnique.mockResolvedValue(null)

      await getCollectionBySlug('test')

      expect(prismaMock.collection.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            user: expect.any(Object),
            clips: expect.any(Object),
            _count: expect.any(Object),
          }),
        })
      )
    })
  })
})
