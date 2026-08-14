import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// GET: Fetch all seat packs for the admin's club
export async function GET(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Get user's club_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('club_id, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Fetch seat packs for this club
  const { data: seatPacks, error } = await supabase
    .from('seat_packs')
    .select('*')
    .eq('club_id', profile.club_id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ seat_packs: seatPacks || [] })
}

// POST: Create a new seat pack (admin only)
const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  coach_limit: z.number().int().min(1),
  price_eur: z.number().int().min(0),
  billing_period: z.enum(['month', 'year']),
})

export async function POST(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('club_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'club_admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const json = await req.json()
  const parsed = createSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('seat_packs')
    .insert({
      ...parsed.data,
      club_id: profile.club_id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ seat_pack: data }, { status: 201 })
}

// DELETE: Delete a seat pack (admin only)
export async function DELETE(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('club_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'club_admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing seat pack ID' }, { status: 400 })
  }

  // Verify seat pack belongs to admin's club
  const { data: seatPack } = await supabase
    .from('seat_packs')
    .select('club_id')
    .eq('id', id)
    .single()

  if (!seatPack || seatPack.club_id !== profile.club_id) {
    return NextResponse.json({ error: 'Seat pack not found' }, { status: 404 })
  }

  const { error } = await supabase.from('seat_packs').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
