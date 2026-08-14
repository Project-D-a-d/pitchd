import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Generate Apple OAuth URL (placeholder for iOS/macOS integration)
export async function POST(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // For MVP, Apple Calendar sync requires deep linking on iOS
  // This is a placeholder for future native app integration
  try {
    const deepLink = `https://calendar.app.goog/?cid=${encodeURIComponent(
      'pitchd@calendar.example.com'
    )}`

    return NextResponse.json({
      url: deepLink,
      note: 'Apple Calendar integration available in native iOS/macOS apps',
    })
  } catch (err: any) {
    console.error('Failed to generate Apple OAuth URL:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
