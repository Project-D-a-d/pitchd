import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Fetch calendar connections for current user
export async function GET(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: connections, error } = await supabase
    .from('calendar_connections')
    .select('id, provider, external_calendar_id, created_at')
    .eq('profile_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ connections: connections || [] })
}

// DELETE: Disconnect a calendar
export async function DELETE(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing connection ID' }, { status: 400 })
  }

  // Verify connection belongs to user
  const { data: connection } = await supabase
    .from('calendar_connections')
    .select('profile_id')
    .eq('id', id)
    .single()

  if (!connection || connection.profile_id !== user.id) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  }

  const { error } = await supabase.from('calendar_connections').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
