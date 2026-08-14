'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getUser, getUserProfile } from '@/lib/auth'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUserData() {
      try {
        const userData = await getUser()
        setUser(userData)

        if (userData) {
          const profileData = await getUserProfile()
          setProfile(profileData)
        }
      } catch (err) {
        console.error('Failed to load user data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.user_metadata?.full_name || user?.email}!</h1>
        <p className="text-gray-600 mt-2">Manage your pitch bookings and account</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/booking"
          className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <h3 className="text-xl font-semibold text-blue-900 mb-2">📅 Book a Pitch</h3>
          <p className="text-blue-700">Reserve your next training session or match</p>
        </Link>

        <Link
          href="/my-bookings"
          className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <h3 className="text-xl font-semibold text-green-900 mb-2">📋 My Bookings</h3>
          <p className="text-green-700">View and manage your reservations</p>
        </Link>

        <Link
          href="/subscribe"
          className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <h3 className="text-xl font-semibold text-purple-900 mb-2">💳 Subscribe</h3>
          <p className="text-purple-700">Upgrade your team subscription</p>
        </Link>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium text-gray-900">{user?.user_metadata?.full_name || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Member Since:</span>
            <span className="font-medium text-gray-900">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">0</p>
          <p className="text-gray-600 mt-2">Upcoming Bookings</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-green-600">0</p>
          <p className="text-gray-600 mt-2">Past Bookings</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">0</p>
          <p className="text-gray-600 mt-2">Total Hours</p>
        </div>
      </div>
    </div>
  )
}
