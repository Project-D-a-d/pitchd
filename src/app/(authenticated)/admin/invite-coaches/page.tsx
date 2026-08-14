'use client'

import { useState } from 'react'
import AdminGuard from '@/components/AdminGuard'

interface InviteResult {
  email: string
  status: 'success' | 'error'
  message: string
}

export default function InviteCoachesPage() {
  const [emails, setEmails] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<InviteResult[]>([])
  const [showResults, setShowResults] = useState(false)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResults([])
    setShowResults(false)
    setLoading(true)

    const emailList = emails
      .split('\n')
      .map((e) => e.trim())
      .filter((e) => e.length > 0)

    if (emailList.length === 0) {
      setError('Please enter at least one email address')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/invite-coaches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailList }),
      })

      if (!response.ok) throw new Error('Failed to send invitations')

      const data = await response.json()
      setResults(data.results || [])
      setShowResults(true)
      setEmails('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitations')
    } finally {
      setLoading(false)
    }
  }

  const successCount = results.filter((r) => r.status === 'success').length
  const errorCount = results.filter((r) => r.status === 'error').length

  return (
    <AdminGuard>
      <div className="max-w-2xl mx-auto space-y-8 py-8 px-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invite Coaches</h1>
          <p className="text-gray-600 mt-2">Send invitations to coaches to join your club</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coach Email Addresses
              </label>
              <textarea
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="coach1@example.com&#10;coach2@example.com&#10;coach3@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={8}
              />
              <p className="text-gray-500 text-xs mt-2">
                Enter one email per line. Invitations will be sent to all addresses.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || emails.trim().length === 0}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg"
            >
              {loading ? 'Sending Invitations...' : '📧 Send Invitations'}
            </button>
          </form>
        </div>

        {/* Results */}
        {showResults && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invitation Results</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{successCount}</p>
                <p className="text-green-700 text-sm mt-1">Sent Successfully</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{errorCount}</p>
                <p className="text-red-700 text-sm mt-1">Failed</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((result, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border flex items-start justify-between ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900">{result.email}</p>
                    <p
                      className={`text-sm ${
                        result.status === 'success' ? 'text-green-700' : 'text-red-700'
                      }`}
                    >
                      {result.message}
                    </p>
                  </div>
                  <span className="text-lg">
                    {result.status === 'success' ? '✓' : '✗'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How It Works</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>✓ Coaches receive an invitation email with a signup link</li>
            <li>✓ They create an account and are automatically added to your club</li>
            <li>✓ Coach approval workflow applies to their first request</li>
            <li>✓ You can track who accepted and who is pending</li>
          </ul>
        </div>
      </div>
    </AdminGuard>
  )
}
