'use client'

import { useState, useMemo } from 'react'
import { useI18n } from '@/lib/i18n'
import ApplicationStatusBadge from './ApplicationStatusBadge'
import SLAIndicator from './SLAIndicator'

export interface ApplicationRow {
  id: string
  submittedBy: string
  submittedByEmail: string
  memberTier: string
  serviceType: string
  status: string
  submittedAt: string
  assignedTo?: { name: string; nameAr: string } | null
  assignedToId?: string | null
}

interface ApplicationTableProps {
  applications: ApplicationRow[]
  totalCount: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onRowClick: (applicationId: string) => void
  onBulkStatusUpdate?: (ids: string[], status: string) => void
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (column: string) => void
  slaDays?: number | null
  isLoading?: boolean
}

const tierColors: Record<string, string> = {
  Standard: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10',
  Premium: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  'Elite Plus': 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
}

function TableSkeleton() {
  return (
    <div className="rounded-2xl theme-panel overflow-hidden">
      <div className="animate-pulse">
        <div className="h-12" style={{ background: 'var(--panel-2)' }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="w-4 h-4 rounded" style={{ background: 'var(--panel-2)' }} />
            <div className="h-4 w-20 rounded" style={{ background: 'var(--panel-2)' }} />
            <div className="h-4 w-32 rounded" style={{ background: 'var(--panel-2)' }} />
            <div className="h-4 w-16 rounded" style={{ background: 'var(--panel-2)' }} />
            <div className="h-4 w-24 rounded" style={{ background: 'var(--panel-2)' }} />
            <div className="h-4 w-20 rounded" style={{ background: 'var(--panel-2)' }} />
            <div className="h-4 w-20 rounded" style={{ background: 'var(--panel-2)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ApplicationTable({
  applications,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onRowClick,
  onBulkStatusUpdate,
  sortBy,
  sortOrder,
  onSort,
  slaDays = null,
  isLoading = false,
}: ApplicationTableProps) {
  const { locale } = useI18n()
  const isRtl = locale === 'ar'
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState('')

  const totalPages = Math.ceil(totalCount / pageSize)

  const allSelected = useMemo(
    () => applications.length > 0 && applications.every(a => selectedIds.has(a.id)),
    [applications, selectedIds]
  )

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(applications.map(a => a.id)))
    }
  }

  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulkUpdate = () => {
    if (bulkStatus && selectedIds.size > 0 && onBulkStatusUpdate) {
      onBulkStatusUpdate(Array.from(selectedIds), bulkStatus)
      setSelectedIds(new Set())
      setBulkStatus('')
    }
  }

  const SortHeader = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <th
      className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider cursor-pointer select-none hover:opacity-80 transition-opacity"
      style={{ color: 'var(--muted)' }}
      onClick={() => onSort(column)}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortBy === column && (
          <svg className={`w-3 h-3 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        )}
      </span>
    </th>
  )

  if (isLoading) return <TableSkeleton />

  if (applications.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--panel-2)' }}>
          <svg className="w-8 h-8" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
          {isRtl ? 'لا توجد طلبات' : 'No Applications Found'}
        </h3>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          {isRtl ? 'حاول تعديل فلاتر البحث' : 'Try adjusting your search filters.'}
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Bulk actions bar */}
      {selectedIds.size > 0 && onBulkStatusUpdate && (
        <div className="rounded-xl p-3 mb-4 flex items-center gap-3 flex-wrap" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            {isRtl ? `${selectedIds.size} محدد` : `${selectedIds.size} selected`}
          </span>
          <select
            value={bulkStatus}
            onChange={e => setBulkStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-sm"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            <option value="">{isRtl ? 'تغيير الحالة إلى...' : 'Change status to...'}</option>
            <option value="UNDER_REVIEW">{isRtl ? 'قيد المراجعة' : 'Under Review'}</option>
            <option value="APPROVED">{isRtl ? 'مُعتمد' : 'Approved'}</option>
            <option value="REJECTED">{isRtl ? 'مرفوض' : 'Rejected'}</option>
            <option value="PENDING_INFO">{isRtl ? 'بانتظار معلومات' : 'Pending Info'}</option>
            <option value="CLOSED">{isRtl ? 'مغلق' : 'Closed'}</option>
          </select>
          <button
            onClick={handleBulkUpdate}
            disabled={!bulkStatus}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isRtl ? 'تطبيق' : 'Apply'}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl theme-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead style={{ background: 'var(--panel-2)' }}>
              <tr>
                <th className="px-6 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded"
                  />
                </th>
                <SortHeader column="id">{isRtl ? 'الرقم' : 'ID'}</SortHeader>
                <SortHeader column="submittedBy">{isRtl ? 'مُقدَّم من' : 'Submitted By'}</SortHeader>
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'الفئة' : 'Tier'}
                </th>
                <SortHeader column="submittedAt">{isRtl ? 'التاريخ' : 'Date'}</SortHeader>
                <SortHeader column="status">{isRtl ? 'الحالة' : 'Status'}</SortHeader>
                {slaDays !== null && (
                  <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'اتفاقية الخدمة' : 'SLA'}
                  </th>
                )}
                <th className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'مُسند إلى' : 'Assigned To'}
                </th>
                <th className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, idx) => (
                <tr
                  key={app.id}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ borderTop: idx > 0 ? '1px solid var(--border)' : undefined }}
                  onClick={() => onRowClick(app.id)}
                >
                  <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(app.id)}
                      onChange={() => toggleOne(app.id)}
                      className="w-4 h-4 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-mono" style={{ color: 'var(--muted)' }}>
                    {app.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{app.submittedBy}</div>
                      <div className="text-xs" style={{ color: 'var(--muted)' }}>{app.submittedByEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tierColors[app.memberTier] || tierColors.Standard}`}>
                      {app.memberTier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--muted)' }}>
                    {new Date(app.submittedAt).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <ApplicationStatusBadge status={app.status} />
                  </td>
                  {slaDays !== null && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SLAIndicator submittedAt={app.submittedAt} slaDays={slaDays} />
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--muted)' }}>
                    {app.assignedTo
                      ? (isRtl ? app.assignedTo.nameAr : app.assignedTo.name)
                      : (isRtl ? 'غير مُسند' : 'Unassigned')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-end">
                    <button
                      className="text-sm font-medium transition-opacity hover:opacity-80"
                      style={{ color: 'var(--primary)' }}
                      onClick={e => { e.stopPropagation(); onRowClick(app.id) }}
                    >
                      {isRtl ? 'عرض' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            {isRtl
              ? `صفحة ${page} من ${totalPages}`
              : `Page ${page} of ${totalPages}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
              style={{ color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              {isRtl ? 'السابق' : 'Previous'}
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const startPage = Math.max(1, Math.min(page - 2, totalPages - 4))
              const pageNum = startPage + i
              if (pageNum > totalPages) return null
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    pageNum === page ? 'bg-blue-600 text-white' : ''
                  }`}
                  style={pageNum !== page ? { color: 'var(--text)', border: '1px solid var(--border)' } : undefined}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
              style={{ color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              {isRtl ? 'التالي' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
