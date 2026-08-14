'use client'

import Link from 'next/link'
import AdminGuard from '@/components/AdminGuard'

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your club, coaches, and subscriptions</p>
        </div>

        {/* Admin Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Coach Approvals */}
          <Link
            href="/admin/approvals"
            className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold text-blue-900 mb-2">👥 Coach Approvals</h3>
            <p className="text-blue-700 text-sm">Review and approve pending coach requests</p>
            <div className="mt-4 text-2xl font-bold text-blue-600">0</div>
            <p className="text-blue-600 text-xs mt-1">Pending requests</p>
          </Link>

          {/* Seat Packs */}
          <Link
            href="/admin/seat-packs"
            className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold text-green-900 mb-2">🎫 Seat Packs</h3>
            <p className="text-green-700 text-sm">Create and manage subscription tiers</p>
            <div className="mt-4 text-2xl font-bold text-green-600">3</div>
            <p className="text-green-600 text-xs mt-1">Active packs</p>
          </Link>

          {/* Subscriptions */}
          <Link
            href="/admin/subscriptions"
            className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold text-purple-900 mb-2">💳 Subscriptions</h3>
            <p className="text-purple-700 text-sm">Monitor active subscriptions and billing</p>
            <div className="mt-4 text-2xl font-bold text-purple-600">0</div>
            <p className="text-purple-600 text-xs mt-1">Active subscriptions</p>
          </Link>

          {/* Club Settings */}
          <Link
            href="/admin/settings"
            className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold text-amber-900 mb-2">⚙️ Club Settings</h3>
            <p className="text-amber-700 text-sm">Configure club details and preferences</p>
          </Link>

          {/* Pitches */}
          <Link
            href="/admin/pitches"
            className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold text-orange-900 mb-2">⚽ Manage Pitches</h3>
            <p className="text-orange-700 text-sm">Add, edit, or remove pitches</p>
            <div className="mt-4 text-2xl font-bold text-orange-600">3</div>
            <p className="text-orange-600 text-xs mt-1">Active pitches</p>
          </Link>

          {/* Reports */}
          <Link
            href="/admin/reports"
            className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold text-indigo-900 mb-2">📊 Reports</h3>
            <p className="text-indigo-700 text-sm">View bookings and revenue analytics</p>
          </Link>
        </div>

        {/* Quick Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Club Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">3</p>
              <p className="text-gray-600 text-sm mt-1">Pitches</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-gray-600 text-sm mt-1">Coaches</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">€0</p>
              <p className="text-gray-600 text-sm mt-1">Monthly Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">0</p>
              <p className="text-gray-600 text-sm mt-1">Bookings Today</p>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
