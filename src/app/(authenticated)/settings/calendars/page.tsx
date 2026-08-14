'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface CalendarConnection {
  id: string
  provider: 'google' | 'apple'
  external_calendar_id?: string
  created_at: string
}

export default function CalendarSettingsPage() {
  const [connections, setConnections] = useState<CalendarConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    loadConnections()
  }, [])

  async function loadConnections() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/calendars/connections')
      if (!response.ok) throw new Error('Failed to load calendar connections')

      const data = await response.json()
      setConnections(data.connections || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleConnect() {
    try {
      const response = await fetch('/api/calendars/google/auth-url', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to get auth URL')

      const { url } = await response.json()
      window.location.href = url // Redirect to Google OAuth
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Google Calendar')
    }
  }

  async function handleDisconnect(id: string) {
    if (!confirm('Are you sure you want to disconnect this calendar?')) return

    try {
      const response = await fetch(`/api/calendars/connections?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to disconnect')

      await loadConnections()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect')
    }
  }

  async function handleSync() {
    setSyncing(true)
    setError('')

    try {
      const response = await fetch('/api/calendars/sync', {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to sync bookings')

      alert('✓ Bookings synced to calendar!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading calendar settings...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Calendar Sync</h1>
        <p className="text-gray-600 mt-2">Connect your calendars to sync pitch bookings</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {/* Google Calendar */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Google Calendar</h2>
            <p className="text-gray-600 text-sm mt-1">
              Sync your pitch bookings to your Google Calendar automatically
            </p>
          </div>
          <div className="text-2xl">📅</div>
        </div>

        {connections.find((c) => c.provider === 'google') ? (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              ✓ Connected
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded"
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
              <button
                onClick={() => {
                  const conn = connections.find((c) => c.provider === 'google')
                  if (conn) handleDisconnect(conn.id)
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded"
              >
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleGoogleConnect}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            🔗 Connect Google Calendar
          </button>
        )}
      </div>

      {/* Apple Calendar */}
      <div className="bg-white rounded-lg shadow-sm p-6 opacity-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Apple Calendar</h2>
            <p className="text-gray-600 text-sm mt-1">Coming soon for iOS and macOS users</p>
          </div>
          <div className="text-2xl">🍎</div>
        </div>
        <button
          disabled
          className="w-full px-4 py-3 bg-gray-300 text-gray-600 font-semibold rounded-lg cursor-not-allowed"
        >
          Coming Soon
        </button>
      </div>

      {/* How It Works */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">How It Works</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>✓ Connect your Google Calendar</li>
          <li>✓ Your pitch bookings sync automatically</li>
          <li>✓ See all your team's schedules in one place</li>
          <li>✓ Disconnect anytime from this page</li>
        </ul>
      </div>

      {/* Back Link */}
      <div className="text-center">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-semibold">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
