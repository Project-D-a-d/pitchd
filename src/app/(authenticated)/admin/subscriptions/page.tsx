'use client'

import AdminGuard from '@/components/AdminGuard'

export default function SubscriptionsPage() {
  return (
    <AdminGuard>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscriptions</h1>
          <p className="text-gray-600 mt-2">Monitor active subscriptions and billing</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-600 text-lg">Subscription management coming soon</p>
          <p className="text-gray-500 mt-2">View active subscriptions and billing history here</p>
        </div>
      </div>
    </AdminGuard>
  )
}
