import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const bodySchema = z.object({
  subscription_id: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const json = await req.json()
  const parsed = bodySchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { subscription_id } = parsed.data

  try {
    // Verify subscription belongs to user
    const { data: subscription } = await supabase
      .from('club_subscriptions')
      .select('stripe_subscription_id')
      .eq('id', subscription_id)
      .eq('coach_id', user.id)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Cancel at end of period (don't immediately cancel)
    if (subscription.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      })
    }

    // Update local database
    await supabase
      .from('club_subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('id', subscription_id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Failed to cancel subscription:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
