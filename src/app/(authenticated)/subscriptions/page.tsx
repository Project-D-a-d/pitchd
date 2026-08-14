'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ActiveSubscription {
  id: string
  seat_pack_id: string
  seat_pack_name: string
  price_eur: number
  status: string
  current_period_start: string
  current_period_end: string
  stripe_subscription_id: string
}

export default function SubscriptionsPage() {
  const [subscription, setSubscription] = useState<ActiveSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => {
    loadSubscription()
  }, [])

  async function loadSubscription() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/subscriptions/current')
      if (response.status === 404) {
        setSubscription(null)
        setLoading(false)
        return
      }

      if (!response.ok) throw new Error('Failed to load subscription')

      const data = await response.json()
      setSubscription(data.subscription)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel your subscription? You\'ll lose access at the end of your current billing period.')) {
      return
    }

    setCancelLoading(true)
    setError('')

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_id: subscription?.id }),
      })

      if (!response.ok) throw new Error('Failed to cancel subscription')

      alert('✓ Subscription will be canceled at the end of your billing period')
      await loadSubscription()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription')
    } finally {
      setCancelLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading subscription...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Subscription</h1>
        <p className="text-gray-600 mt-2">Manage your Pitch'd subscription</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {!subscription ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center space-y-4">
          <p className="text-gray-600 text-lg">No active subscription</p>
          <p className="text-gray-500">Subscribe to unlock pitch booking features</p>
          <Link
            href="/subscribe"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            Choose a Plan
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Current Plan */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan:</span>
                <span className="font-bold text-gray-900">{subscription.seat_pack_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Price:</span>
                <span className="font-bold text-gray-900">€{(subscription.price_eur / 100).toFixed(2)}/month</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    subscription.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Billing Period:</span>
                <span className="font-bold text-gray-900">
                  {new Date(subscription.current_period_start).toLocaleDateString()} —{' '}
                  {new Date(subscription.current_period_end).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/subscribe"
              className="block text-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            >
              Upgrade or Change Plan
            </Link>
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg"
            >
              {cancelLoading ? 'Canceling...' : 'Cancel Subscription'}
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p>💡 Canceling will end your subscription at the end of your billing period. You'll keep access until then.</p>
          </div>
        </div>
      )}
    </div>
  )
}
