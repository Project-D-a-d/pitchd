import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event

  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient()

  try {
    // Handle different Stripe events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object

        if (session.payment_status === 'paid') {
          // Parse metadata
          const [clubId, coachId, seatPackId] = session.client_reference_id?.split(':') || []

          if (!clubId || !coachId || !seatPackId) {
            console.error('Invalid metadata in session:', session.client_reference_id)
            break
          }

          // Create subscription record
          const { error } = await supabase.from('club_subscriptions').upsert(
            {
              club_id: clubId,
              seat_pack_id: seatPackId,
              coach_id: coachId,
              stripe_subscription_id: session.subscription,
              status: 'active',
              current_period_start: new Date(session.created * 1000).toISOString().split('T')[0],
              current_period_end: new Date((session.created + 86400 * 30) * 1000).toISOString().split('T')[0], // Approximate
            },
            {
              onConflict: 'club_id,coach_id',
            }
          )

          if (error) {
            console.error('Failed to create subscription:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
          }

          console.log('Subscription created:', clubId, coachId, seatPackId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object

        // Update subscription status in database
        const { error } = await supabase
          .from('club_subscriptions')
          .update({
            status: subscription.status,
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Failed to update subscription:', error)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object

        // Mark subscription as canceled
        const { error } = await supabase
          .from('club_subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Failed to cancel subscription:', error)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
