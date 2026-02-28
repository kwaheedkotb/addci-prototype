'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { STAFF_SERVICE_MAP } from '@/lib/staff-service-map'
import {
  StaffAccessGuard,
  ApplicationTable,
  StaffFilterBar,
} from '@/components/staff'
import type { ApplicationRow } from '@/components/staff/ApplicationTable'
import type { FilterConfig } from '@/components/staff/StaffFilterBar'

// ─── Types ──────────────────────────────────────────────────────────────────

interface StatusCounts {
  SUBMITTED: number
  UNDER_REVIEW: number
  APPROVED: number
  REJECTED: number
  PENDING_INFO: number
  CLOSED: number
  total: number
}

// ─── Skeleton Loaders ───────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="rounded-2xl p-6 theme-panel animate-pulse">
      <div className="h-3 w-24 rounded mb-3" style={{ background: 'var(--panel-2)' }} />
      <div className="h-8 w-16 rounded mb-2" style={{ background: 'var(--panel-2)' }} />
      <div className="h-3 w-20 rounded" style={{ background: 'var(--panel-2)' }} />
    </div>
  )
}

// ─── Filter configs ─────────────────────────────────────────────────────────

const STATUS_FILTERS: FilterConfig[] = [
  {
    key: 'status',
    label: 'All Statuses',
    labelAr: 'جميع الحالات',
    type: 'select',
    options: [
      { value: 'SUBMITTED', label: 'Submitted', labelAr: 'مُقدَّم' },
      { value: 'UNDER_REVIEW', label: 'Under Review', labelAr: 'قيد المراجعة' },
      { value: 'APPROVED', label: 'Approved', labelAr: 'مُعتمد' },
      { value: 'REJECTED', label: 'Rejected', labelAr: 'مرفوض' },
      { value: 'PENDING_INFO', label: 'Pending Info', labelAr: 'بانتظار معلومات' },
      { value: 'CLOSED', label: 'Closed', labelAr: 'مغلق' },
    ],
  },
  {
    key: 'tier',
    label: 'All Tiers',
    labelAr: 'جميع الفئات',
    type: 'select',
    options: [
      { value: 'Standard', label: 'Standard', labelAr: 'أساسي' },
      { value: 'Premium', label: 'Premium', labelAr: 'مميز' },
      { value: 'Elite Plus', label: 'Elite Plus', labelAr: 'النخبة بلس' },
    ],
  },
]

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function StaffServicePortal() {
  const params = useParams()
  const router = useRouter()
  const { locale, dir } = useI18n()
  const isRtl = locale === 'ar'

  const serviceSlug = params.serviceSlug as string
  const serviceMeta = STAFF_SERVICE_MAP[serviceSlug]

  // Access: hardcoded true for now (to be replaced with real auth)
  const [isAuthorized] = useState(true)

  // Data state
  const [applications, setApplications] = useState<ApplicationRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [statusCounts, setStatusCounts] = useState<StatusCounts | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCounts, setIsLoadingCounts] = useState(true)

  // Filter / pagination state
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortBy, setSortBy] = useState('submittedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    status: '',
    tier: '',
  })

  // ─── Bail if slug not in map ────────────────────────────────────────────
  if (!serviceMeta) {
    notFound()
  }

  // ─── Data fetching ──────────────────────────────────────────────────────

  const fetchApplications = useCallback(async () => {
    setIsLoading(true)
    try {
      const qs = new URLSearchParams({
        serviceType: serviceMeta.serviceType,
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortOrder,
      })
      if (activeFilters.status) qs.set('status', activeFilters.status)
      if (searchQuery) qs.set('search', searchQuery)

      const res = await fetch(`/api/staff/applications?${qs}`)
      const data = await res.json()
      if (data.success) {
        setApplications(data.applications)
        setTotalCount(data.totalCount)
      }
    } catch (err) {
      console.error('Error fetching applications:', err)
    } finally {
      setIsLoading(false)
    }
  }, [serviceMeta.serviceType, page, pageSize, sortBy, sortOrder, activeFilters.status, searchQuery])

  const fetchStatusCounts = useCallback(async () => {
    setIsLoadingCounts(true)
    try {
      const statuses = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PENDING_INFO', 'CLOSED'] as const
      const counts: Record<string, number> = {}
      let total = 0

      await Promise.all(
        statuses.map(async (s) => {
          const qs = new URLSearchParams({
            serviceType: serviceMeta.serviceType,
            status: s,
            pageSize: '1',
          })
          const res = await fetch(`/api/staff/applications?${qs}`)
          const data = await res.json()
          const c = data.success ? data.totalCount : 0
          counts[s] = c
          total += c
        })
      )

      setStatusCounts({ ...counts, total } as StatusCounts)
    } catch (err) {
      console.error('Error fetching status counts:', err)
    } finally {
      setIsLoadingCounts(false)
    }
  }, [serviceMeta.serviceType])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  useEffect(() => {
    fetchStatusCounts()
  }, [fetchStatusCounts])

  // ─── Handlers ───────────────────────────────────────────────────────────

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setActiveFilters({ status: '', tier: '' })
    setPage(1)
  }

  const handleRowClick = (id: string) => {
    router.push(`/staff/application/${id}`)
  }

  const handleBulkUpdate = async (ids: string[], status: string) => {
    try {
      await Promise.all(
        ids.map(id =>
          fetch(`/api/staff/applications/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
          })
        )
      )
      fetchApplications()
      fetchStatusCounts()
    } catch (err) {
      console.error('Bulk update error:', err)
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <StaffAccessGuard isAuthorized={isAuthorized}>
      <div className={`min-h-screen ${isRtl ? 'rtl' : 'ltr'}`} style={{ background: 'var(--bg)' }} dir={dir}>
        {/* ─── Gradient Header ──────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#0f2847]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-start justify-between">
              <div>
                <Link
                  href="/staff"
                  className="inline-flex items-center text-white/60 hover:text-white/90 transition-colors mb-3 text-sm"
                >
                  <svg className={`w-4 h-4 ${isRtl ? 'ms-1.5 rtl:rotate-180' : 'me-1.5'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {isRtl ? 'العودة للبوابة الرئيسية' : 'Back to Staff Portal'}
                </Link>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {isRtl ? serviceMeta.nameAr : serviceMeta.nameEn}
                </h1>
                <p className="text-white/70 text-lg">
                  {isRtl ? serviceMeta.departmentAr : serviceMeta.department}
                  <span className="mx-2 text-white/30">|</span>
                  SLA: {isRtl ? serviceMeta.slaAr : serviceMeta.sla}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* ─── Stats Strip ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {isLoadingCounts ? (
              Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
            ) : statusCounts ? (
              <>
                <div className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'إجمالي الطلبات' : 'Total Applications'}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {statusCounts.total}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'لهذه الخدمة' : 'for this service'}
                  </p>
                </div>
                <div className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'مُقدَّم' : 'Submitted'}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--accent-amber)' }}>
                    {statusCounts.SUBMITTED}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'بانتظار المراجعة' : 'awaiting review'}
                  </p>
                </div>
                <div className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'قيد المراجعة' : 'Under Review'}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                    {statusCounts.UNDER_REVIEW}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'قيد المعالجة' : 'being processed'}
                  </p>
                </div>
                <div className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'مُعتمد' : 'Approved'}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--accent-green)' }}>
                    {statusCounts.APPROVED}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'مكتمل' : 'completed'}
                  </p>
                </div>
              </>
            ) : null}
          </div>

          {/* ─── Filter Bar ────────────────────────────────────────── */}
          <StaffFilterBar
            searchQuery={searchQuery}
            onSearchChange={(v) => { setSearchQuery(v); setPage(1) }}
            filters={STATUS_FILTERS}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearFilters}
            resultCount={totalCount}
          />

          {/* ─── Application Table ─────────────────────────────────── */}
          <ApplicationTable
            applications={applications}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onRowClick={handleRowClick}
            onBulkStatusUpdate={handleBulkUpdate}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            slaDays={serviceMeta.slaDays}
            isLoading={isLoading}
          />

          {/* ─── Empty State ─────────────────────────────────────────── */}
          {!isLoading && applications.length === 0 && (
            <div className="mt-6 rounded-2xl p-6 theme-panel text-center">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {isRtl
                  ? 'لا توجد طلبات لهذه الخدمة حتى الآن.'
                  : 'No applications for this service yet.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </StaffAccessGuard>
  )
}
