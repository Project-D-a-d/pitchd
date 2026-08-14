'use client'

import { useEffect, useState } from 'react'
import AdminGuard from '@/components/AdminGuard'

interface CoachApproval {
  id: string
  coach_id: string
  coach_name?: string
  coach_email?: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  requested_at: string
  expires_at: string
  decided_at?: string
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<CoachApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadApprovals()
  }, [])

  async function loadApprovals() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/approvals')
      if (!response.ok) throw new Error('Failed to load approvals')

      const data = await response.json()
      setApprovals(data.approvals || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load approvals')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(approvalId: string) {
    setActionLoading(approvalId)
    try {
      const response = await fetch('/api/admin/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approval_id: approvalId,
          action: 'approve',
        }),
      })

      if (!response.ok) throw new Error('Failed to approve')

      setApprovals((prev) =>
        prev.map((a) => (a.id === approvalId ? { ...a, status: 'approved' } : a))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(approvalId: string) {
    setActionLoading(approvalId)
    try {
      const response = await fetch('/api/admin/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approval_id: approvalId,
          action: 'reject',
        }),
      })

      if (!response.ok) throw new Error('Failed to reject')

      setApprovals((prev) =>
        prev.map((a) => (a.id === approvalId ? { ...a, status: 'rejected' } : a))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  const pendingApprovals = approvals.filter((a) => a.status === 'pending')
  const decidedApprovals = approvals.filter((a) => a.status !== 'pending')

  if (loading) {
    return (
      <AdminGuard>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading approvals...</div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coach Approval Requests</h1>
          <p className="text-gray-600 mt-2">Review and manage coach onboarding requests</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Pending Requests ({pendingApprovals.length})
          </h2>

          {pendingApprovals.length === 0 ? (
            <p className="text-gray-600">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {approval.coach_name || 'Unknown Coach'}
                    </h3>
                    <p className="text-sm text-gray-600">{approval.coach_email}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      <span>
                        Requested:{' '}
                        {new Date(approval.requested_at).toLocaleDateString()} at{' '}
                        {new Date(approval.requested_at).toLocaleTimeString()}
                      </span>
                      <span>
                        Expires:{' '}
                        {new Date(approval.expires_at).toLocaleDateString()} at{' '}
                        {new Date(approval.expires_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(approval.id)}
                      disabled={actionLoading === approval.id}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded"
                    >
                      {actionLoading === approval.id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(approval.id)}
                      disabled={actionLoading === approval.id}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded"
                    >
                      {actionLoading === approval.id ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Decided Approvals */}
        {decidedApprovals.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Decision History ({decidedApprovals.length})
            </h2>
            <div className="space-y-2">
              {decidedApprovals.map((approval) => (
                <div key={approval.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div>
                    <p className="font-medium text-gray-900">
                      {approval.coach_name || 'Unknown Coach'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {approval.coach_email} · Decided on{' '}
                      {approval.decided_at
                        ? new Date(approval.decided_at).toLocaleDateString()
                        : 'Unknown'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      approval.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : approval.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}
