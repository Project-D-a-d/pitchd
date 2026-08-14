'use client'

import AdminGuard from '@/components/AdminGuard'

export default function PitchesPage() {
  return (
    <AdminGuard>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Pitches</h1>
          <p className="text-gray-600 mt-2">Add, edit, or remove pitches from your club</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-600 text-lg">Pitch management coming soon</p>
          <p className="text-gray-500 mt-2">Manage your pitches here</p>
        </div>
      </div>
    </AdminGuard>
  )
}
