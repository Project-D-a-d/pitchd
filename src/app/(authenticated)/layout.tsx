'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from '@/lib/auth'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  async function handleSignOut() {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
                Pitch'd
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
              <Link href="/booking" className="text-gray-700 hover:text-blue-600 font-medium">
                Book Pitch
              </Link>
              <Link href="/my-bookings" className="text-gray-700 hover:text-blue-600 font-medium">
                My Bookings
              </Link>
              <Link href="/settings/calendars" className="text-gray-700 hover:text-green-600 font-medium">
                Settings
              </Link>
              <Link href="/admin" className="text-gray-700 hover:text-purple-600 font-medium">
                Admin
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Sign Out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-700 hover:text-blue-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden pb-4 space-y-2">
              <Link
                href="/dashboard"
                className="block text-gray-700 hover:text-blue-600 font-medium py-2"
              >
                Dashboard
              </Link>
              <Link href="/booking" className="block text-gray-700 hover:text-blue-600 font-medium py-2">
                Book Pitch
              </Link>
              <Link
                href="/my-bookings"
                className="block text-gray-700 hover:text-blue-600 font-medium py-2"
              >
                My Bookings
              </Link>
              <Link
                href="/settings/calendars"
                className="block text-gray-700 hover:text-green-600 font-medium py-2"
              >
                Settings
              </Link>
              <Link
                href="/admin"
                className="block text-gray-700 hover:text-purple-600 font-medium py-2"
              >
                Admin
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
