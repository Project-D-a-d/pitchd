import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: Fetch current subscription for user
export async function GET(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: subscription } = await supabase
    .from('club_subscriptions')
    .select(
      `
      id,
      seat_pack_id,
      status,
      current_period_start,
      current_period_end,
      stripe_subscription_id,
      seat_packs(name, price_eur)
    `
    )
    .eq('coach_id', user.id)
    .eq('status', 'active')
    .single()

  if (!subscription) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
  }

  return NextResponse.json({
    subscription: {
      id: subscription.id,
      seat_pack_name: subscription.seat_packs?.name,
      price_eur: subscription.seat_packs?.price_eur,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      stripe_subscription_id: subscription.stripe_subscription_id,
    },
  })
}
