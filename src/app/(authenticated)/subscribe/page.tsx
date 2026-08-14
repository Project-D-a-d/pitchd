'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface SeatPack {
  id: string
  name: string
  description?: string
  coach_limit: number
  price_eur: number
  billing_period: string
}

export default function SubscribePage() {
  const searchParams = useSearchParams()
  const clubId = searchParams.get('club_id')

  const [seatPacks, setSeatPacks] = useState<SeatPack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  useEffect(() => {
    loadSeatPacks()
  }, [clubId])

  async function loadSeatPacks() {
    setLoading(true)
    setError('')

    try {
      // Fetch seat packs for the club (or current user's club if not specified)
      const response = await fetch('/api/seat-packs')
      if (!response.ok) throw new Error('Failed to load seat packs')

      const data = await response.json()
      setSeatPacks(data.seat_packs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load seat packs')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubscribe(seatPackId: string) {
    setCheckoutLoading(seatPackId)
    setError('')

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seat_pack_id: seatPackId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url // Redirect to Stripe Checkout
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create checkout session')
    } finally {
      setCheckoutLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading subscription plans...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
          <p className="text-gray-600 mt-2">Subscribe to manage your coaching team</p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-center">
            {error}
          </div>
        )}

        {seatPacks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600 text-lg">No subscription plans available</p>
            <p className="text-gray-500 mt-2">Contact your club admin to set up plans</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {seatPacks.map((pack) => {
              const priceStr = (pack.price_eur / 100).toFixed(2)
              const billingText = pack.billing_period === 'month' ? '/month' : '/year'

              return (
                <div
                  key={pack.id}
                  className="bg-white rounded-lg shadow-sm p-8 flex flex-col border-t-4 border-blue-500 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-2xl font-bold text-gray-900">{pack.name}</h3>
                  {pack.description && (
                    <p className="text-gray-600 text-sm mt-2">{pack.description}</p>
                  )}

                  <div className="mt-6 mb-6">
                    <div className="text-4xl font-bold text-gray-900">
                      €{priceStr}
                      <span className="text-xl text-gray-600 font-normal">{billingText}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="text-gray-700">
                      ✓ Up to <strong>{pack.coach_limit} coaches</strong>
                    </li>
                    <li className="text-gray-700">
                      ✓ Pitch booking system
                    </li>
                    <li className="text-gray-700">
                      ✓ Coach approval workflow
                    </li>
                    <li className="text-gray-700">
                      ✓ Calendar sync support
                    </li>
                  </ul>

                  <button
                    onClick={() => handleSubscribe(pack.id)}
                    disabled={checkoutLoading === pack.id}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                  >
                    {checkoutLoading === pack.id ? 'Processing...' : 'Subscribe Now'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
