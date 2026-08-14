import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('club_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'club_admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    // Get total coaches (unique users with role coach in this club)
    const { data: coaches } = await supabase
      .from('profiles')
      .select('id')
      .eq('club_id', profile.club_id)
      .eq('role', 'coach')

    // Get subscriptions
    const { data: subscriptions } = await supabase
      .from('club_subscriptions')
      .select('id, status, seat_packs(price_eur)')
      .eq('club_id', profile.club_id)

    // Get bookings for this month
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, booking_date')
      .in('pitch_id',
        (await supabase.from('pitches').select('id').eq('club_id', profile.club_id)).data?.map(p => p.id) || []
      )
      .gte('booking_date', monthStart)
      .lte('booking_date', monthEnd)

    // Calculate stats
    const totalCoaches = coaches?.length || 0
    const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0
    const expiredSubscriptions = (subscriptions?.length || 0) - activeSubscriptions
    const monthlyRevenue = subscriptions
      ?.filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.seat_packs?.price_eur || 0), 0) || 0
    const bookingsThisMonth = bookings?.length || 0

    // Calculate bookings per day (last 7 days)
    const bookingsPerDay = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const count = bookings?.filter(b => b.booking_date === dateStr).length || 0
      bookingsPerDay.push({ date: dateStr, count })
    }

    const stats = {
      totalCoaches,
      totalSubscriptions: subscriptions?.length || 0,
      activeSubscriptions,
      expiredSubscriptions,
      monthlyRevenue,
      bookingsThisMonth,
      bookingsPerDay,
    }

    return NextResponse.json({ stats })
  } catch (err: any) {
    console.error('Failed to generate reports:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
