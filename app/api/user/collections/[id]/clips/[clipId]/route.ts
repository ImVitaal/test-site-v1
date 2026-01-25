import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { removeClipFromCollection } from '@/lib/db/queries/collections'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; clipId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } },
        { status: 401 }
      )
    }

    await removeClipFromCollection(params.id, params.clipId, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Not found' } },
        { status: 404 }
      )
    }

    console.error('Error removing clip from collection:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to remove clip' } },
      { status: 500 }
    )
  }
}
