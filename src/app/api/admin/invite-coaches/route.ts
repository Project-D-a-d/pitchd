import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { emailTemplates, sendEmail } from '@/lib/email'

const bodySchema = z.object({
  emails: z.array(z.string().email()),
})

export async function POST(req: NextRequest) {
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

  const json = await req.json()
  const parsed = bodySchema.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { emails } = parsed.data
  const results = []

  for (const email of emails) {
    try {
      // Check if email is already registered
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('club_id', profile.club_id)

      const emailExists = existingUser?.some((p) => p.id === email)

      if (emailExists) {
        results.push({
          email,
          status: 'error',
          message: 'Coach already in your club',
        })
        continue
      }

      // Send invitation email
      const template = {
        subject: '✓ You\'re Invited to Pitch\'d!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">You're Invited! ⚽</h1>
            <p>A club admin has invited you to join Pitch'd.</p>
            <p>
              <a href="${req.nextUrl.origin}/auth/signup?email=${encodeURIComponent(email)}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">
                Accept Invitation & Sign Up
              </a>
            </p>
            <p>If you don't have a Pitch'd account yet, you'll create one using this email.</p>
            <p>— Pitch'd Team</p>
          </div>
        `,
      }

      await sendEmail(email, template)

      results.push({
        email,
        status: 'success',
        message: 'Invitation sent successfully',
      })
    } catch (err: any) {
      results.push({
        email,
        status: 'error',
        message: err.message || 'Failed to send invitation',
      })
    }
  }

  return NextResponse.json({ results })
}
