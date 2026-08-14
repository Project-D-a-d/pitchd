'use client'

import { useEffect, useState } from 'react'
import AdminGuard from '@/components/AdminGuard'

interface ReportStats {
  totalCoaches: number
  totalSubscriptions: number
  monthlyRevenue: number
  bookingsThisMonth: number
  activeSubscriptions: number
  expiredSubscriptions: number
  bookingsPerDay: Array<{ date: string; count: number }>
}

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/reports')
      if (!response.ok) throw new Error('Failed to load reports')

      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading reports...</div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Overview of your club's performance</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {stats && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-gray-600 text-sm mb-2">Total Coaches</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalCoaches}</p>
                <p className="text-gray-500 text-xs mt-2">All registered coaches</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-gray-600 text-sm mb-2">Active Subscriptions</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeSubscriptions}</p>
                <p className="text-gray-500 text-xs mt-2">Paid subscriptions</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-gray-600 text-sm mb-2">Monthly Revenue</p>
                <p className="text-3xl font-bold text-purple-600">€{(stats.monthlyRevenue / 100).toFixed(2)}</p>
                <p className="text-gray-500 text-xs mt-2">Recurring billing</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <p className="text-gray-600 text-sm mb-2">Bookings (30d)</p>
                <p className="text-3xl font-bold text-orange-600">{stats.bookingsThisMonth}</p>
                <p className="text-gray-500 text-xs mt-2">Last 30 days</p>
              </div>
            </div>

            {/* Subscription Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{stats.activeSubscriptions}</p>
                  <p className="text-gray-600 text-sm mt-1">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-600">{stats.expiredSubscriptions}</p>
                  <p className="text-gray-600 text-sm mt-1">Expired/Inactive</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{stats.totalSubscriptions}</p>
                  <p className="text-gray-600 text-sm mt-1">Total</p>
                </div>
              </div>
            </div>

            {/* Bookings Trend */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bookings Trend (Last 7 Days)</h2>
              <div className="space-y-2">
                {stats.bookingsPerDay.slice(-7).map((day) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 w-24">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded h-6 mx-4 relative">
                      <div
                        className="bg-blue-500 h-6 rounded transition-all"
                        style={{
                          width: `${Math.max(5, (day.count / 10) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-12 text-right">
                      {day.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Option */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <p className="text-gray-700 mb-4">Need a detailed report? Export your data.</p>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
                📊 Export Report (CSV)
              </button>
            </div>
          </>
        )}
      </div>
    </AdminGuard>
  )
}
