'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import SLAIndicator from '@/components/staff/SLAIndicator'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ApplicationRow {
  id: string
  applicationId: string
  serviceType: string
  serviceNameEn: string
  serviceNameAr: string
  department: string
  departmentAr: string
  category: string
  categoryAr: string
  status: string
  statusLabelEn: string
  statusLabelAr: string
  statusColor: string
  submittedAt: string
  updatedAt: string
  sla: string
  slaAr: string
  slaDays: number | null
  requestSummary: string
  requestSummaryAr: string
  isLegacy: boolean
}

interface ApplicationsTableProps {
  applications: ApplicationRow[]
  loading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  totalCount: number
  hasFilters: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getRelativeTime(date: string, isRtl: boolean): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffMs = now - then

  const minutes = Math.floor(diffMs / 60_000)
  const hours = Math.floor(diffMs / 3_600_000)
  const days = Math.floor(diffMs / 86_400_000)

  if (minutes < 1) {
    return isRtl ? 'الآن' : 'just now'
  }
  if (minutes < 60) {
    return isRtl
      ? `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`
      : `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  }
  if (hours < 24) {
    return isRtl
      ? `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`
      : `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }
  if (days < 30) {
    return isRtl
      ? `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`
      : `${days} ${days === 1 ? 'day' : 'days'} ago`
  }
  const months = Math.floor(days / 30)
  return isRtl
    ? `منذ ${months} ${months === 1 ? 'شهر' : 'أشهر'}`
    : `${months} ${months === 1 ? 'month' : 'months'} ago`
}

function formatDate(iso: string, isRtl: boolean): string {
  const d = new Date(iso)
  return d.toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <div className="rounded-2xl theme-panel overflow-hidden">
      <div className="animate-pulse">
        {/* Header row */}
        <div className="h-12" style={{ background: 'var(--panel-2)' }} />
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-4 w-20 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  )
}

function CardsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-4 theme-panel animate-pulse"
          style={{ border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-white/10" />
          </div>
          <div className="h-3 w-24 rounded bg-gray-200 dark:bg-white/10 mb-3" />
          <div className="h-3 w-full rounded bg-gray-200 dark:bg-white/10 mb-3" />
          <div className="flex items-center justify-between">
            <div className="h-3 w-28 rounded bg-gray-200 dark:bg-white/10" />
            <div className="h-8 w-16 rounded-lg bg-gray-200 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty states
// ---------------------------------------------------------------------------

function EmptyFiltered({ isRtl }: { isRtl: boolean }) {
  return (
    <div className="text-center py-16">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: 'var(--panel-2)' }}
      >
        <svg
          className="w-8 h-8"
          style={{ color: 'var(--muted)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
        {isRtl ? 'لا توجد طلبات تطابق فلاترك' : 'No applications match your filters'}
      </h3>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>
        {isRtl ? 'حاول مسح جميع الفلاتر وإعادة المحاولة' : 'Try clearing all filters and try again.'}
      </p>
    </div>
  )
}

function EmptyNoApplications({ isRtl }: { isRtl: boolean }) {
  return (
    <div className="text-center py-16">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: 'var(--panel-2)' }}
      >
        <svg
          className="w-8 h-8"
          style={{ color: 'var(--muted)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
        {isRtl ? 'لم تقم بتقديم أي طلبات بعد' : "You haven't submitted any applications yet"}
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
        {isRtl ? 'تصفح خدماتنا وابدأ طلبك الأول' : 'Browse our services and start your first application.'}
      </p>
      <Link
        href="/services"
        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
        style={{ background: 'var(--primary)' }}
      >
        {isRtl ? 'تصفح الخدمات' : 'Browse Services'}
      </Link>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Copy button (clipboard)
// ---------------------------------------------------------------------------

function CopyIdButton({ fullId, isRtl }: { fullId: string; isRtl: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(fullId).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      onClick={handleCopy}
      title={isRtl ? 'نسخ المعرّف' : 'Copy ID'}
      className="inline-flex items-center justify-center w-6 h-6 rounded transition-colors hover:opacity-80"
      style={{ color: 'var(--muted)' }}
    >
      {copied ? (
        <svg className="w-3.5 h-3.5" style={{ color: 'var(--accent-green)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

function Pagination({
  page,
  totalPages,
  onPageChange,
  isRtl,
}: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  isRtl: boolean
}) {
  if (totalPages <= 1) return null

  // Sliding window of max 5 page numbers
  const maxVisible = 5
  const startPage = Math.max(1, Math.min(page - Math.floor(maxVisible / 2), totalPages - maxVisible + 1))
  const pageNumbers: number[] = []
  for (let i = startPage; i <= Math.min(startPage + maxVisible - 1, totalPages); i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
      <span className="text-sm" style={{ color: 'var(--muted)' }}>
        {isRtl ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
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
        {pageNumbers.map((pn) => (
          <button
            key={pn}
            onClick={() => onPageChange(pn)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
              pn === page ? 'text-white' : ''
            }`}
            style={
              pn === page
                ? { background: 'var(--primary)', color: '#fff' }
                : { color: 'var(--text)', border: '1px solid var(--border)' }
            }
          >
            {pn}
          </button>
        ))}
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
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ApplicationsTable({
  applications,
  loading,
  page,
  totalPages,
  onPageChange,
  totalCount,
  hasFilters,
}: ApplicationsTableProps) {
  const { locale } = useI18n()
  const isRtl = locale === 'ar'
  const router = useRouter()

  // ---- Loading state ----
  if (loading) {
    return (
      <>
        {/* Desktop skeleton */}
        <div className="hidden lg:block">
          <TableSkeleton />
        </div>
        {/* Mobile skeleton */}
        <div className="lg:hidden">
          <CardsSkeleton />
        </div>
      </>
    )
  }

  // ---- Empty states ----
  if (applications.length === 0) {
    if (hasFilters) return <EmptyFiltered isRtl={isRtl} />
    return <EmptyNoApplications isRtl={isRtl} />
  }

  // ---- Data views ----
  return (
    <div>
      {/* Count summary */}
      <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
        {isRtl
          ? `${totalCount} طلب`
          : `${totalCount} application${totalCount !== 1 ? 's' : ''}`}
      </p>

      {/* ================================================================= */}
      {/* Desktop table                                                      */}
      {/* ================================================================= */}
      <div className="hidden lg:block rounded-2xl theme-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead style={{ background: 'var(--panel-2)' }}>
              <tr>
                <th
                  className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--muted)' }}
                >
                  {isRtl ? 'الخدمة' : 'Service'}
                </th>
                <th
                  className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--muted)' }}
                >
                  {isRtl ? 'رقم الطلب' : 'Application ID'}
                </th>
                <th
                  className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--muted)' }}
                >
                  {isRtl ? 'ملخص الطلب' : 'Request Summary'}
                </th>
                <th
                  className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--muted)' }}
                >
                  {isRtl ? 'تاريخ التقديم' : 'Submitted'}
                </th>
                <th
                  className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--muted)' }}
                >
                  {isRtl ? 'الحالة' : 'Status'}
                </th>
                <th
                  className="px-6 py-3 text-start text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--muted)' }}
                >
                  {isRtl ? 'اتفاقية الخدمة' : 'SLA'}
                </th>
                <th
                  className="px-6 py-3 text-end text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--muted)' }}
                >
                  {isRtl ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app, idx) => {
                const serviceName = isRtl ? app.serviceNameAr : app.serviceNameEn
                const department = isRtl ? app.departmentAr : app.department
                const category = isRtl ? app.categoryAr : app.category
                const statusLabel = isRtl ? app.statusLabelAr : app.statusLabelEn
                const summary = isRtl ? app.requestSummaryAr : app.requestSummary

                return (
                  <tr
                    key={app.id}
                    className="cursor-pointer transition-colors"
                    style={{
                      borderTop: idx > 0 ? '1px solid var(--border)' : undefined,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--panel-2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = ''
                    }}
                    onClick={() => router.push(`/member/applications/${app.id}`)}
                  >
                    {/* Service */}
                    <td className="px-6 py-4 max-w-[220px]">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                        {serviceName}
                      </div>
                      <div className="text-xs truncate mt-0.5" style={{ color: 'var(--muted)' }}>
                        {department}
                      </div>
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1"
                        style={{
                          background: 'var(--panel-2)',
                          color: 'var(--text-secondary)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        {category}
                      </span>
                    </td>

                    {/* Application ID */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-xs font-mono"
                          style={{ color: 'var(--muted)' }}
                          title={app.id}
                        >
                          {app.applicationId}
                        </span>
                        <CopyIdButton fullId={app.id} isRtl={isRtl} />
                      </div>
                    </td>

                    {/* Request Summary */}
                    <td className="px-6 py-4 max-w-[240px]">
                      <p
                        className="text-sm truncate"
                        style={{ color: 'var(--text-secondary)' }}
                        title={summary}
                      >
                        {summary || (isRtl ? '-' : '-')}
                      </p>
                    </td>

                    {/* Submitted Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--text)' }}>
                        {formatDate(app.submittedAt, isRtl)}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                        {getRelativeTime(app.submittedAt, isRtl)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${app.statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </td>

                    {/* SLA */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SLAIndicator submittedAt={app.submittedAt} slaDays={app.slaDays} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-end">
                      <button
                        className="text-sm font-medium transition-opacity hover:opacity-80"
                        style={{ color: 'var(--primary)' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/member/applications/${app.id}`)
                        }}
                      >
                        {isRtl ? 'عرض التفاصيل' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Mobile cards                                                       */}
      {/* ================================================================= */}
      <div className="lg:hidden space-y-4">
        {applications.map((app) => {
          const serviceName = isRtl ? app.serviceNameAr : app.serviceNameEn
          const category = isRtl ? app.categoryAr : app.category
          const statusLabel = isRtl ? app.statusLabelAr : app.statusLabelEn
          const summary = isRtl ? app.requestSummaryAr : app.requestSummary

          return (
            <div
              key={app.id}
              className="rounded-2xl p-4 theme-panel"
              style={{ border: '1px solid var(--border)' }}
            >
              {/* Top row: service name + category */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                    {serviceName}
                  </p>
                </div>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0"
                  style={{
                    background: 'var(--panel-2)',
                    color: 'var(--text-secondary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  {category}
                </span>
              </div>

              {/* Status + date */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${app.statusColor}`}
                >
                  {statusLabel}
                </span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {formatDate(app.submittedAt, isRtl)} &middot; {getRelativeTime(app.submittedAt, isRtl)}
                </span>
              </div>

              {/* Request summary */}
              {summary && (
                <p
                  className="text-xs truncate mb-3"
                  style={{ color: 'var(--text-secondary)' }}
                  title={summary}
                >
                  {summary}
                </p>
              )}

              {/* View button */}
              <div className="flex items-center justify-end">
                <button
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ color: 'var(--primary)', border: '1px solid var(--border)' }}
                  onClick={() => router.push(`/member/applications/${app.id}`)}
                >
                  {isRtl ? 'عرض' : 'View'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* ================================================================= */}
      {/* Pagination                                                         */}
      {/* ================================================================= */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        isRtl={isRtl}
      />
    </div>
  )
}
