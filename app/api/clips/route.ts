import { NextRequest, NextResponse } from 'next/server'
import { listClips, createClip } from '@/lib/db/queries/clips'
import { clipQuerySchema, createClipSchema } from '@/lib/validations/clip'
import { auth } from '@/lib/auth/config'
import { ZodError, z } from 'zod'

// Extended schema for the API that includes video URL
const submitClipSchema = createClipSchema.extend({
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const params = clipQuerySchema.parse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      q: searchParams.get('q') ?? undefined,
      sortBy: searchParams.get('sortBy') ?? undefined,
      sortOrder: searchParams.get('sortOrder') ?? undefined,
      animatorId: searchParams.get('animatorId') ?? undefined,
      animeId: searchParams.get('animeId') ?? undefined,
      studioId: searchParams.get('studioId') ?? undefined,
      tagIds: searchParams.get('tagIds') ?? undefined,
      verificationStatus: searchParams.get('verificationStatus') ?? undefined,
      yearStart: searchParams.get('yearStart') ?? undefined,
      yearEnd: searchParams.get('yearEnd') ?? undefined,
    })

    const result = await listClips(params)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid query parameters',
            details: error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    console.error('Error listing clips:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to submit clips',
          },
        },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const data = submitClipSchema.parse(body)

    // Create the clip with PENDING status
    const clip = await createClip(data, session.user.id)

    return NextResponse.json({
      success: true,
      data: clip,
    })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: error.flatten(),
          },
        },
        { status: 400 }
      )
    }

    console.error('Error creating clip:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create clip',
        },
      },
      { status: 500 }
    )
  }
}
