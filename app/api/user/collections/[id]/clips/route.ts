import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { addClipToCollection } from '@/lib/db/queries/collections'
import { z } from 'zod'

const addClipSchema = z.object({
  clipId: z.string().cuid(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { clipId } = addClipSchema.parse(body)

    await addClipToCollection(params.id, clipId, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Collection not found' } },
        { status: 404 }
      )
    }

    console.error('Error adding clip to collection:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add clip' } },
      { status: 500 }
    )
  }
}
