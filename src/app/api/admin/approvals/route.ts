import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// GET: Fetch all approvals for the admin's club
export async function GET(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Check if user is club_admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('club_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'club_admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // Fetch approvals for this club with coach details
  const { data: approvals, error } = await supabase
    .from('coach_approvals')
    .select(`
      id,
      coach_id,
      status,
      requested_at,
      expires_at,
      decided_at,
      profiles!coach_id(full_name, email: id)
    `)
    .eq('club_id', profile.club_id)
    .order('requested_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform response to include coach info
  const transformedApprovals = approvals?.map((approval: any) => ({
    id: approval.id,
    coach_id: approval.coach_id,
    coach_name: approval.profiles?.full_name || 'Unknown',
    coach_email: approval.profiles?.email || 'Unknown',
    status: approval.status,
    requested_at: approval.requested_at,
    expires_at: approval.expires_at,
    decided_at: approval.decided_at,
  })) || []

  return NextResponse.json({ approvals: transformedApprovals })
}

// PATCH: Approve or reject a coach
const patchSchema = z.object({
  approval_id: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
})

export async function PATCH(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const json = await req.json()
  const parsed = patchSchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { approval_id, action } = parsed.data

  // Check if user is club_admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('club_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'club_admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  // Verify approval belongs to admin's club
  const { data: approval } = await supabase
    .from('coach_approvals')
    .select('club_id')
    .eq('id', approval_id)
    .single()

  if (!approval || approval.club_id !== profile.club_id) {
    return NextResponse.json({ error: 'Approval not found' }, { status: 404 })
  }

  // Update approval status
  const newStatus = action === 'approve' ? 'approved' : 'rejected'

  const { error } = await supabase
    .from('coach_approvals')
    .update({
      status: newStatus,
      decided_at: new Date().toISOString(),
      decided_by: user.id,
    })
    .eq('id', approval_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, status: newStatus })
}
