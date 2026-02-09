import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'

// Import functions to test
import { createClip, getClipBySlug, listClips } from '@/lib/db/queries/clips'

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  default: mockDeep<PrismaClient>(),
}))

import prisma from '@/lib/db/prisma'

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

describe('Clip Queries', () => {
  beforeEach(() => {
    mockReset(prismaMock)
  })

  describe('createClip', () => {
    it('should create a clip with attributions', async () => {
      const mockClip = {
        id: 'clip-id',
        slug: 'test-clip-abc123',
        title: 'Test Clip',
        videoUrl: 'https://example.com/video.mp4',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        duration: 30,
        animeId: 'anime-id',
        episodeNumber: 1,
        timestampStart: '00:10:30',
        techniqueDescription: 'Amazing animation',
        submittedBy: 'user-id',
        submissionStatus: 'PENDING',
        studioId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        anime: {
          id: 'anime-id',
          title: 'Test Anime',
          slug: 'test-anime',
        },
        attributions: [
          {
            id: 'attr-id',
            animatorId: 'animator-id',
            role: 'KEY_ANIMATION',
            verificationStatus: 'SPECULATIVE',
            animator: {
              id: 'animator-id',
              name: 'Test Animator',
              slug: 'test-animator',
            },
          },
        ],
        tags: [],
      }

      prismaMock.clip.create.mockResolvedValue(mockClip as any)

      const input = {
        title: 'Test Clip',
        videoUrl: 'https://example.com/video.mp4',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        duration: 30,
        animeId: 'anime-id',
        episodeNumber: 1,
        timestampStart: '00:10:30',
        techniqueDescription: 'Amazing animation',
        attributions: [
          {
            animatorId: 'animator-id',
            role: 'KEY_ANIMATION' as const,
            sourceUrl: 'https://source.com',
          },
        ],
      }

      const result = await createClip(input, 'user-id')

      expect(result).toEqual(mockClip)
      expect(prismaMock.clip.create).toHaveBeenCalled()
    })
  })

  describe('getClipBySlug', () => {
    it('should return clip with slug', async () => {
      const mockClip = {
        id: 'clip-id',
        slug: 'test-clip',
        title: 'Test Clip',
        videoUrl: 'https://example.com/video.mp4',
        thumbnailUrl: null,
        duration: 30,
        animeId: 'anime-id',
        episodeNumber: null,
        timestampStart: null,
        techniqueDescription: 'Test description',
        submittedBy: 'user-id',
        submissionStatus: 'APPROVED',
        studioId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        anime: {
          id: 'anime-id',
          title: 'Test Anime',
          slug: 'test-anime',
        },
        studio: null,
        attributions: [],
        tags: [],
        _count: {
          favorites: 10,
        },
      }

      prismaMock.clip.findUnique.mockResolvedValue(mockClip as any)

      const result = await getClipBySlug('test-clip')

      expect(result).toEqual(mockClip)
      expect(prismaMock.clip.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-clip', submissionStatus: 'APPROVED' },
        include: expect.any(Object),
      })
    })

    it('should return null if clip not found', async () => {
      prismaMock.clip.findUnique.mockResolvedValue(null)

      const result = await getClipBySlug('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('listClips', () => {
    it('should return paginated clips', async () => {
      const mockClips = [
        {
          id: '1',
          slug: 'clip-1',
          title: 'Clip 1',
          videoUrl: 'https://example.com/1.mp4',
          thumbnailUrl: null,
          duration: 30,
          viewCount: 100,
          favoriteCount: 5,
          animeId: 'anime-1',
          episodeNumber: null,
          timestampStart: null,
          techniqueDescription: 'Description 1',
          submittedBy: 'user-1',
          submissionStatus: 'APPROVED',
          studioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          anime: { title: 'Anime 1', slug: 'anime-1' },
          attributions: [
            {
              animator: { name: 'Animator 1', slug: 'animator-1' },
              verificationStatus: 'VERIFIED',
            },
          ],
        },
        {
          id: '2',
          slug: 'clip-2',
          title: 'Clip 2',
          videoUrl: 'https://example.com/2.mp4',
          thumbnailUrl: null,
          duration: 45,
          viewCount: 200,
          favoriteCount: 10,
          animeId: 'anime-2',
          episodeNumber: null,
          timestampStart: null,
          techniqueDescription: 'Description 2',
          submittedBy: 'user-2',
          submissionStatus: 'APPROVED',
          studioId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          anime: { title: 'Anime 2', slug: 'anime-2' },
          attributions: [],
        },
      ]

      prismaMock.clip.findMany.mockResolvedValue(mockClips as any)
      prismaMock.clip.count.mockResolvedValue(50)

      const result = await listClips({ page: 1, limit: 20 })

      // listClips transforms data to ClipCard format
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toMatchObject({
        id: '1',
        slug: 'clip-1',
        title: 'Clip 1',
        duration: 30,
        viewCount: 100,
        favoriteCount: 5,
      })
      expect(result.pagination.total).toBe(50)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(20)
    })

    it('should filter by search query', async () => {
      prismaMock.clip.findMany.mockResolvedValue([])
      prismaMock.clip.count.mockResolvedValue(0)

      await listClips({ page: 1, limit: 20, q: 'animation' })

      expect(prismaMock.clip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      )
    })

    it('should filter by verification status', async () => {
      prismaMock.clip.findMany.mockResolvedValue([])
      prismaMock.clip.count.mockResolvedValue(0)

      await listClips({ page: 1, limit: 20, verificationStatus: 'VERIFIED' })

      expect(prismaMock.clip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            attributions: {
              some: {
                verificationStatus: 'VERIFIED',
              },
            },
          }),
        })
      )
    })

    it('should handle pagination correctly', async () => {
      prismaMock.clip.findMany.mockResolvedValue([])
      prismaMock.clip.count.mockResolvedValue(100)

      await listClips({ page: 2, limit: 25 })

      expect(prismaMock.clip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 25, // (page 2 - 1) * 25
          take: 25,
        })
      )
    })
  })
})
