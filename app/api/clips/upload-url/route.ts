import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { z } from 'zod'
import {
  VIDEO_MAX_SIZE_BYTES,
  VIDEO_ALLOWED_TYPES,
} from '@/config/constants'

const uploadRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.enum(['video/mp4', 'video/webm']),
  size: z.number().max(VIDEO_MAX_SIZE_BYTES),
})

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
            message: 'You must be logged in to upload clips',
          },
        },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const { filename, contentType, size } = uploadRequestSchema.parse(body)

    // Validate content type
    if (!VIDEO_ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid content type. Allowed: ${VIDEO_ALLOWED_TYPES.join(', ')}`,
          },
        },
        { status: 400 }
      )
    }

    // Generate a unique video ID
    const videoId = generateVideoId()

    // In production, this would call Cloudflare Stream API or similar
    // to get a presigned upload URL
    // For now, we'll return a mock response
    const uploadUrl = await getPresignedUploadUrl(videoId, contentType, size)

    return NextResponse.json({
      success: true,
      uploadUrl,
      videoId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
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

    console.error('Error generating upload URL:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate upload URL',
        },
      },
      { status: 500 }
    )
  }
}

function generateVideoId(): string {
  // Generate a unique ID for the video
  // In production, this might come from Cloudflare Stream
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 15)
  return `${timestamp}${randomPart}`
}

async function getPresignedUploadUrl(
  videoId: string,
  contentType: string,
  size: number
): Promise<string> {
  // In production, this would call Cloudflare Stream API:
  //
  // const response = await fetch(
  //   `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream?direct_user=true`,
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${API_TOKEN}`,
  //       'Tus-Resumable': '1.0.0',
  //       'Upload-Length': String(size),
  //       'Upload-Metadata': `name ${btoa(videoId)},requireSignedURLs`
  //     }
  //   }
  // )
  //
  // Return the 'Location' header from the response

  // For development/demo, return a mock URL
  // In a real implementation, this would be replaced with actual cloud storage integration
  return `https://upload.sakugalegends.com/${videoId}?contentType=${encodeURIComponent(contentType)}&size=${size}`
}
