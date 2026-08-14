'use client'

import { useEffect, useState } from 'react'
import AdminGuard from '@/components/AdminGuard'

interface SeatPack {
  id: string
  name: string
  description?: string
  coach_limit: number
  price_eur: number
  billing_period: string
}

export default function SeatPacksPage() {
  const [seatPacks, setSeatPacks] = useState<SeatPack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coach_limit: 5,
    price_eur: 3000, // €30.00 in cents
    billing_period: 'month',
  })

  useEffect(() => {
    loadSeatPacks()
  }, [])

  async function loadSeatPacks() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/seat-packs')
      if (!response.ok) throw new Error('Failed to load seat packs')

      const data = await response.json()
      setSeatPacks(data.seat_packs || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load seat packs')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/admin/seat-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Failed to create seat pack')

      setFormData({
        name: '',
        description: '',
        coach_limit: 5,
        price_eur: 3000,
        billing_period: 'month',
      })
      setShowForm(false)
      await loadSeatPacks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create seat pack')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this seat pack?')) return

    try {
      const response = await fetch(`/api/admin/seat-packs?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete seat pack')

      await loadSeatPacks()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete seat pack')
    }
  }

  if (loading) {
    return (
      <AdminGuard>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading seat packs...</div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seat Packs</h1>
            <p className="text-gray-600 mt-2">Create and manage subscription tiers for your club</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            {showForm ? 'Cancel' : '+ New Seat Pack'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Seat Pack</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pack Name (e.g., "Starter", "Professional")
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Starter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Coaches
                  </label>
                  <input
                    type="number"
                    value={formData.coach_limit}
                    onChange={(e) =>
                      setFormData({ ...formData, coach_limit: parseInt(e.target.value) })
                    }
                    required
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (€)
                  </label>
                  <input
                    type="number"
                    value={formData.price_eur / 100}
                    onChange={(e) =>
                      setFormData({ ...formData, price_eur: Math.round(parseFloat(e.target.value) * 100) })
                    }
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Period
                  </label>
                  <select
                    value={formData.billing_period}
                    onChange={(e) =>
                      setFormData({ ...formData, billing_period: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Best for clubs with multiple coaches..."
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
              >
                Create Seat Pack
              </button>
            </form>
          </div>
        )}

        {/* Seat Packs List */}
        {seatPacks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600 text-lg">No seat packs yet</p>
            <p className="text-gray-500 mt-2">Create your first subscription tier to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {seatPacks.map((pack) => (
              <div key={pack.id} className="bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500">
                <h3 className="text-lg font-semibold text-gray-900">{pack.name}</h3>
                {pack.description && (
                  <p className="text-sm text-gray-600 mt-1">{pack.description}</p>
                )}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-gray-900">€{(pack.price_eur / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coaches:</span>
                    <span className="font-bold text-gray-900">{pack.coach_limit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Billing:</span>
                    <span className="font-bold text-gray-900">{pack.billing_period}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(pack.id)}
                  className="w-full mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
