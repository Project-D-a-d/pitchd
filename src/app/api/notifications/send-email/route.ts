import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { emailTemplates, sendEmail } from '@/lib/email'

const bodySchema = z.object({
  to: z.string().email(),
  type: z.enum(['booking_confirmation', 'payment_confirmation', 'coach_approval']),
  data: z.record(z.any()),
})

export async function POST(req: NextRequest) {
  const json = await req.json()
  const parsed = bodySchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { to, type, data } = parsed.data

  try {
    let template

    switch (type) {
      case 'booking_confirmation':
        template = emailTemplates.bookingConfirmation(
          data.name,
          data.pitchName,
          data.date,
          data.time
        )
        break

      case 'payment_confirmation':
        template = emailTemplates.paymentConfirmation(
          data.name,
          data.seatPackName,
          data.price,
          data.renewalDate
        )
        break

      case 'coach_approval':
        template = emailTemplates.coachApprovalNotification(
          data.coachName,
          data.clubName,
          data.status
        )
        break

      default:
        return NextResponse.json({ error: 'Unknown email type' }, { status: 400 })
    }

    await sendEmail(to, template)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Failed to send email:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
