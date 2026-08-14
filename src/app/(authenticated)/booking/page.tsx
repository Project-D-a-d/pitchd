'use client'

import { useState, useEffect } from 'react'
import BookingGrid from '@/components/BookingGrid'

export default function BookingPage() {
  const [date, setDate] = useState('')
  const [pitchId, setPitchId] = useState('00000000-0000-0000-0000-000000000010')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Set default to today
    const today = new Date().toISOString().split('T')[0]
    setDate(today)
  }, [])

  function goToPreviousDay() {
    const currentDate = new Date(date)
    currentDate.setDate(currentDate.getDate() - 1)
    setDate(currentDate.toISOString().split('T')[0])
    setSuccess(false)
  }

  function goToNextDay() {
    const currentDate = new Date(date)
    currentDate.setDate(currentDate.getDate() + 1)
    setDate(currentDate.toISOString().split('T')[0])
    setSuccess(false)
  }

  function handleBookingSuccess() {
    setSuccess(true)
    setTimeout(() => setSuccess(false), 5000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Book a Pitch</h1>
        <p className="text-gray-600 mt-2">Reserve your preferred time slot</p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 font-semibold">
          ✓ Booking confirmed! Your reservation is complete.
        </div>
      )}

      {/* Pitch Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Pitch</label>
        <select
          value={pitchId}
          onChange={(e) => setPitchId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="00000000-0000-0000-0000-000000000010">Pitch A</option>
          <option value="00000000-0000-0000-0000-000000000011">Pitch B</option>
          <option value="00000000-0000-0000-0000-000000000012">Pitch C</option>
        </select>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousDay}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg"
          >
            ← Previous Day
          </button>

          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              setSuccess(false)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-semibold"
          />

          <button
            onClick={goToNextDay}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg"
          >
            Next Day →
          </button>
        </div>
      </div>

      {/* Booking Grid */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {date && (
          <BookingGrid
            pitchId={pitchId}
            date={date}
            onBookingSuccess={handleBookingSuccess}
          />
        )}
      </div>
    </div>
  )
}
