'use client'

import AdminGuard from '@/components/AdminGuard'

export default function SeatPacksPage() {
  return (
    <AdminGuard>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seat Packs</h1>
          <p className="text-gray-600 mt-2">Create and manage subscription tiers for your club</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-600 text-lg">Seat pack management coming soon</p>
          <p className="text-gray-500 mt-2">You'll be able to create and manage subscription tiers here</p>
        </div>
      </div>
    </AdminGuard>
  )
}
