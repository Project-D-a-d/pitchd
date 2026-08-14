import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const axios = require('axios')

// POST: Sync bookings to Google Calendar
export async function POST(req: NextRequest) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    // Get user's calendar connection
    const { data: connection } = await supabase
      .from('calendar_connections')
      .select('*')
      .eq('profile_id', user.id)
      .eq('provider', 'google')
      .single()

    if (!connection) {
      return NextResponse.json({ error: 'No calendar connection found' }, { status: 404 })
    }

    // Get user's bookings (future only)
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, booking_date, slot_number, pitches(name)')
      .eq('booked_by', user.id)
      .gte('booking_date', new Date().toISOString().split('T')[0])
      .limit(50)

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ synced: 0 })
    }

    // Sync each booking to Google Calendar
    let synced = 0

    for (const booking of bookings) {
      try {
        const pitchName = booking.pitches?.name || 'Pitch Booking'
        const [startHour, endHour] = getSlotTimes(booking.slot_number)
        const date = booking.booking_date

        const startTime = new Date(`${date}T${startHour}:00:00`).toISOString()
        const endTime = new Date(`${date}T${endHour}:00:00`).toISOString()

        // Create calendar event
        await axios.post(
          `https://www.googleapis.com/calendar/v3/calendars/${connection.external_calendar_id}/events`,
          {
            summary: `🏆 Pitch'd: ${pitchName}`,
            description: `Pitch booking via Pitch'd`,
            start: { dateTime: startTime, timeZone: 'Europe/Berlin' },
            end: { dateTime: endTime, timeZone: 'Europe/Berlin' },
          },
          {
            headers: {
              Authorization: `Bearer ${connection.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        synced++
      } catch (err: any) {
        console.error('Failed to sync booking:', err.message)
        // Continue syncing other bookings
      }
    }

    return NextResponse.json({ synced })
  } catch (err: any) {
    console.error('Failed to sync calendar:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// Helper function to get time slot from slot number
function getSlotTimes(slotNumber: number): [string, string] {
  const hour = 8 + slotNumber // 08:00 is slot 0, 09:00 is slot 1, etc.
  return [
    hour.toString().padStart(2, '0'),
    (hour + 1).toString().padStart(2, '0'),
  ]
}
