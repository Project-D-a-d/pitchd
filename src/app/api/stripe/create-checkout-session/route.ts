import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const bodySchema = z.object({
  seat_pack_id: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('club_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const json = await req.json()
  const parsed = bodySchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { seat_pack_id } = parsed.data

  // Fetch the seat pack
  const { data: seatPack } = await supabase
    .from('seat_packs')
    .select('*')
    .eq('id', seat_pack_id)
    .eq('club_id', profile.club_id)
    .single()

  if (!seatPack) {
    return NextResponse.json({ error: 'Seat pack not found' }, { status: 404 })
  }

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      client_reference_id: `${profile.club_id}:${user.id}:${seat_pack_id}`,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: seatPack.name,
              description: seatPack.description || `${seatPack.coach_limit} coaches per ${seatPack.billing_period}`,
            },
            unit_amount: seatPack.price_eur,
            recurring: {
              interval: seatPack.billing_period === 'year' ? 'year' : 'month',
              interval_count: 1,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${req.nextUrl.origin}/subscribe?success=true`,
      cancel_url: `${req.nextUrl.origin}/subscribe?canceled=true`,
      metadata: {
        club_id: profile.club_id,
        coach_id: user.id,
        seat_pack_id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
