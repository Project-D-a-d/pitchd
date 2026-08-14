'use client'

import { useState, useEffect } from 'react'
import BookingCard from './BookingCard'

interface BookingSlot {
  slot_number: number
  is_available: boolean
  booked_by?: string
  status?: 'available' | 'booked' | 'pending'
}

interface BookingGridProps {
  pitchId: string
  date: string
  onBookingSuccess?: () => void
}

export default function BookingGrid({ pitchId, date, onBookingSuccess }: BookingGridProps) {
  const [slots, setSlots] = useState<BookingSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const BOOKING_HOURS = [
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
    '18:00-19:00',
    '19:00-20:00',
  ]

  useEffect(() => {
    fetchAvailability()
  }, [pitchId, date])

  async function fetchAvailability() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/availability?pitch_id=${pitchId}&date=${date}`)
      if (!response.ok) throw new Error('Failed to fetch availability')

      const data = await response.json()
      setSlots(data.slots || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading availability...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
        {error}
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Available Slots for {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BOOKING_HOURS.map((time, index) => {
          const slot = slots[index]
          return (
            <BookingCard
              key={index}
              time={time}
              slotNumber={index + 1}
              isAvailable={slot?.is_available !== false}
              pitchId={pitchId}
              date={date}
              onBookingSuccess={onBookingSuccess}
            />
          )
        })}
      </div>
    </div>
  )
}
