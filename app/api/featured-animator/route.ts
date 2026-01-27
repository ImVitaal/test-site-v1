import { NextResponse } from 'next/server'
import { getFeaturedAnimator } from '@/lib/db/queries/featured'

// ISR: Revalidate every hour (featured animator changes weekly)
export const revalidate = 3600

export async function GET() {
  try {
    const data = await getFeaturedAnimator()

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error fetching featured animator:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch featured animator',
        },
      },
      { status: 500 }
    )
  }
}
