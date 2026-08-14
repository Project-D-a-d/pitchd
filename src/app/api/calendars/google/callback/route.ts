import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const axios = require('axios')

// Handle Google OAuth callback
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state') // user ID
  const error = req.nextUrl.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `${req.nextUrl.origin}/settings/calendars?error=${encodeURIComponent(error)}`
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${req.nextUrl.origin}/settings/calendars?error=Missing code or state`
    )
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${req.nextUrl.origin}/api/calendars/google/callback`,
    })

    const { access_token, refresh_token } = tokenResponse.data

    // Store calendar connection in database
    const supabase = createClient()

    const { error: dbError } = await supabase.from('calendar_connections').insert({
      profile_id: state,
      provider: 'google',
      access_token,
      refresh_token,
      external_calendar_id: 'primary', // Default to primary calendar
    })

    if (dbError) {
      console.error('Failed to store calendar connection:', dbError)
      return NextResponse.redirect(
        `${req.nextUrl.origin}/settings/calendars?error=${encodeURIComponent(dbError.message)}`
      )
    }

    return NextResponse.redirect(`${req.nextUrl.origin}/settings/calendars?success=true`)
  } catch (err: any) {
    console.error('Failed to handle OAuth callback:', err.message)
    return NextResponse.redirect(
      `${req.nextUrl.origin}/settings/calendars?error=${encodeURIComponent(
        err.message || 'Failed to connect calendar'
      )}`
    )
  }
}
