'use client'

import { useState } from 'react'

interface BookingCardProps {
  time: string
  slotNumber: number
  isAvailable: boolean
  pitchId: string
  date: string
  onBookingSuccess?: () => void
}

export default function BookingCard({
  time,
  slotNumber,
  isAvailable,
  pitchId,
  date,
  onBookingSuccess,
}: BookingCardProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  async function handleBook() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitch_id: pitchId,
          slot_number: slotNumber,
          booking_date: date,
        }),
      })

      if (response.status === 409) {
        setError('This slot was just booked. Try another.')
        setShowConfirm(false)
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Booking failed')
      }

      setShowConfirm(false)
      onBookingSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        isAvailable
          ? 'bg-white border-green-200 hover:border-green-400 cursor-pointer'
          : 'bg-gray-100 border-gray-300 cursor-not-allowed'
      }`}
    >
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-900">{time}</p>
        <p className="text-sm text-gray-600 mt-1">
          {isAvailable ? '✓ Available' : '✗ Booked'}
        </p>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
          {error}
        </div>
      )}

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={!isAvailable || loading}
          className={`w-full mt-4 py-2 px-4 rounded font-semibold transition-colors ${
            isAvailable && !loading
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? 'Booking...' : 'Book'}
        </button>
      ) : (
        <div className="mt-4 space-y-2">
          <button
            onClick={handleBook}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded"
          >
            {loading ? 'Confirming...' : 'Confirm'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="w-full bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300 text-gray-700 font-semibold py-2 rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
