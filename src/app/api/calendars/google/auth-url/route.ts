import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Generate Google OAuth URL for calendar access
export async function POST(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    // Generate OAuth URL
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: `${req.nextUrl.origin}/api/calendars/google/callback`,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar',
      access_type: 'offline',
      prompt: 'consent',
      state: user.id, // Use user ID as state for security
    })

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

    return NextResponse.json({ url })
  } catch (err: any) {
    console.error('Failed to generate OAuth URL:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
