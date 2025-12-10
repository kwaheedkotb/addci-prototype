'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import StatusBadge from '@/components/StatusBadge'

interface Application {
  id: string
  applicantName: string
  organizationName: string
  sector: string
  status: string
  createdAt: string
}

const STATUSES = ['all', 'SUBMITTED', 'UNDER_REVIEW', 'CORRECTIONS_REQUESTED', 'APPROVED', 'REJECTED']

export default function StaffDashboard() {
  const { t } = useI18n()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    fetchApplications()
  }, [statusFilter, sortBy, sortOrder])

  async function fetchApplications() {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        sortBy,
        sortOrder,
      })
      const res = await fetch(`/api/applications?${params}`)
      const data = await res.json()
      if (data.success) {
        setApplications(data.applications)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{t.staff.dashboard.title}</h1>
      </div>

      {/* Filters */}
      <div className="rounded-lg p-4 mb-6 theme-panel">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
              {t.staff.dashboard.filterByStatus}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? t.common.all : t.status[status as keyof typeof t.status]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>
              {t.staff.dashboard.sortBy}
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-')
                setSortBy(newSortBy)
                setSortOrder(newSortOrder)
              }}
              className="px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt-desc">{t.staff.dashboard.createdDateDesc}</option>
              <option value="createdAt-asc">{t.staff.dashboard.createdDateAsc}</option>
              <option value="status-asc">{t.staff.dashboard.statusAsc}</option>
              <option value="status-desc">{t.staff.dashboard.statusDesc}</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-lg p-8 text-center theme-panel">
          <p style={{ color: 'var(--muted)' }}>{t.common.noData}</p>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden theme-panel">
          <table className="min-w-full">
            <thead style={{ background: 'var(--panel-2)' }}>
              <tr>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  {t.customer.dashboard.applicationId}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  {t.customer.form.applicantName}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  {t.customer.dashboard.organization}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  {t.customer.form.sector}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  {t.customer.dashboard.status}
                </th>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  {t.customer.dashboard.createdAt}
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  {t.common.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, idx) => (
                <tr key={app.id} className="hover:opacity-80 transition-opacity" style={{ borderTop: idx > 0 ? '1px solid var(--border)' : 'none' }}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {app.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--muted)' }}>
                    {app.applicantName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--muted)' }}>
                    {app.organizationName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--muted)' }}>
                    {app.sector}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--muted)' }}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                    <Link
                      href={`/staff/${app.id}`}
                      style={{ color: 'var(--primary)' }}
                      className="hover:opacity-80"
                    >
                      {t.common.view}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
