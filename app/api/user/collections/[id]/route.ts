import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { updateCollection, deleteCollection } from '@/lib/db/queries/collections'
import { z } from 'zod'

const updateCollectionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
})

export async function PATCH(
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
    const data = updateCollectionSchema.parse(body)

    const collection = await updateCollection(params.id, session.user.id, data)

    return NextResponse.json({ success: true, data: collection })
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

    console.error('Error updating collection:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update collection' } },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await deleteCollection(params.id, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Collection not found' } },
        { status: 404 }
      )
    }

    console.error('Error deleting collection:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete collection' } },
      { status: 500 }
    )
  }
}
