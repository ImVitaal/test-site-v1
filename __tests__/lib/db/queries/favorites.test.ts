import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'

// Import functions to test
import {
  getUserFavoriteClips,
  getUserFavoriteAnimators,
} from '@/lib/db/queries/favorites'

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  default: mockDeep<PrismaClient>(),
}))

import prisma from '@/lib/db/prisma'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Favorites Queries', () => {
  beforeEach(() => {
    mockReset(prismaMock)
  })

  describe('getUserFavoriteClips', () => {
    it('should return user favorite clips', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          userId: 'user-1',
          clipId: 'clip-1',
          animatorId: null,
          createdAt: new Date('2024-01-01'),
          clip: {
            id: 'clip-1',
            slug: 'test-clip-1',
            title: 'Test Clip 1',
            thumbnailUrl: 'https://example.com/thumb1.jpg',
            duration: 30,
            viewCount: 100,
            favoriteCount: 10,
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
                verificationStatus: 'VERIFIED',
              },
            ],
          },
        },
      ]

      prismaMock.favorite.findMany.mockResolvedValue(mockFavorites as any)

      const result = await getUserFavoriteClips('user-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'clip-1',
        slug: 'test-clip-1',
        title: 'Test Clip 1',
        primaryAnimator: {
          name: 'Test Animator',
          slug: 'test-animator',
        },
      })
    })

    it('should filter out null clips', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          userId: 'user-1',
          clipId: 'clip-1',
          animatorId: null,
          createdAt: new Date(),
          clip: null,
        },
      ]

      prismaMock.favorite.findMany.mockResolvedValue(mockFavorites as any)

      const result = await getUserFavoriteClips('user-1')

      expect(result).toHaveLength(0)
    })

    it('should order by createdAt desc', async () => {
      prismaMock.favorite.findMany.mockResolvedValue([])

      await getUserFavoriteClips('user-1')

      expect(prismaMock.favorite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      )
    })
  })

  describe('getUserFavoriteAnimators', () => {
    it('should return user favorite animators', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          userId: 'user-1',
          clipId: null,
          animatorId: 'animator-1',
          createdAt: new Date('2024-01-01'),
          animator: {
            id: 'animator-1',
            slug: 'test-animator',
            name: 'Test Animator',
            nativeName: 'テストアニメーター',
            photoUrl: 'https://example.com/photo.jpg',
            birthDate: new Date('1970-01-01'),
            deathDate: null,
            _count: {
              attributions: 50,
            },
          },
        },
      ]

      prismaMock.favorite.findMany.mockResolvedValue(mockFavorites as any)

      const result = await getUserFavoriteAnimators('user-1')

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'animator-1',
        slug: 'test-animator',
        name: 'Test Animator',
        clipCount: 50,
        activeYears: '1970-present',
      })
    })

    it('should filter out null animators', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          userId: 'user-1',
          clipId: null,
          animatorId: 'animator-1',
          createdAt: new Date(),
          animator: null,
        },
      ]

      prismaMock.favorite.findMany.mockResolvedValue(mockFavorites as any)

      const result = await getUserFavoriteAnimators('user-1')

      expect(result).toHaveLength(0)
    })

    it('should handle animators with death dates', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          userId: 'user-1',
          clipId: null,
          animatorId: 'animator-1',
          createdAt: new Date(),
          animator: {
            id: 'animator-1',
            slug: 'test-animator',
            name: 'Test Animator',
            nativeName: null,
            photoUrl: null,
            birthDate: new Date('1950-01-01'),
            deathDate: new Date('2020-12-31'),
            _count: { attributions: 100 },
          },
        },
      ]

      prismaMock.favorite.findMany.mockResolvedValue(mockFavorites as any)

      const result = await getUserFavoriteAnimators('user-1')

      expect(result[0].activeYears).toBe('1950-2020')
    })

    it('should handle animators without birth dates', async () => {
      const mockFavorites = [
        {
          id: 'fav-1',
          userId: 'user-1',
          clipId: null,
          animatorId: 'animator-1',
          createdAt: new Date(),
          animator: {
            id: 'animator-1',
            slug: 'test-animator',
            name: 'Test Animator',
            nativeName: null,
            photoUrl: null,
            birthDate: null,
            deathDate: null,
            _count: { attributions: 25 },
          },
        },
      ]

      prismaMock.favorite.findMany.mockResolvedValue(mockFavorites as any)

      const result = await getUserFavoriteAnimators('user-1')

      expect(result[0].activeYears).toBe('Unknown')
    })
  })
})
