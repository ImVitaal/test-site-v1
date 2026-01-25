import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getUserFavoriteAnimators } from '@/lib/db/queries/favorites'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'You must be logged in' } },
        { status: 401 }
      )
    }

    const animators = await getUserFavoriteAnimators(session.user.id)

    return NextResponse.json(animators)
  } catch (error) {
    console.error('Error fetching favorite animators:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } },
      { status: 500 }
    )
  }
}
