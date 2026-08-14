'use client'

import AdminGuard from '@/components/AdminGuard'

export default function SettingsPage() {
  return (
    <AdminGuard>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Club Settings</h1>
          <p className="text-gray-600 mt-2">Configure club details and preferences</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-600 text-lg">Club settings coming soon</p>
          <p className="text-gray-500 mt-2">Update club information and preferences here</p>
        </div>
      </div>
    </AdminGuard>
  )
}
