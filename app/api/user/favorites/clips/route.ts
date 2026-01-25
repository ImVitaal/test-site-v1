import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getUserFavoriteClips } from '@/lib/db/queries/favorites'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } },
        { status: 401 }
      )
    }

    const clips = await getUserFavoriteClips(session.user.id)

    return NextResponse.json(clips)
  } catch (error) {
    console.error('Error fetching favorite clips:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } },
      { status: 500 }
    )
  }
}
