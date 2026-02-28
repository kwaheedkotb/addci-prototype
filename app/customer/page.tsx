'use client'

import ApplicationsFilterBar from '@/components/member/ApplicationsFilterBar'
import ApplicationsTable from '@/components/member/ApplicationsTable'
import type { ApplicationRow } from '@/components/member/ApplicationsTable'
import { useI18n } from '@/lib/i18n'
import Link from 'next/link'
import { useEffect, useState, useRef, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

// ─── Types ───────────────────────────────────────────────────────────────────

interface FilterCounts {
  byService: Record<string, number>
  byStatus: Record<string, number>
  byDepartment: Record<string, number>
}

interface APIResponse {
  success: boolean
  applications: ApplicationRow[]
  total: number
  page: number
  totalPages: number
  filterCounts: FilterCounts
}

// ─── Stat tile icon SVGs ─────────────────────────────────────────────────────

function TotalIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  )
}

function PendingIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function ApprovedIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function ActionRequiredIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  )
}

// ─── Inner dashboard content (uses useSearchParams) ──────────────────────────

function CustomerDashboardContent() {
  const { locale, t } = useI18n()
  const isRtl = locale === 'ar'
  const searchParams = useSearchParams()
  const router = useRouter()

  // ── Read filters from URL search params ──────────────────────────────────
  const urlServiceTypes = searchParams.get('serviceType')?.split(',').filter(Boolean) || []
  const urlStatuses = searchParams.get('status')?.split(',').filter(Boolean) || []
  const urlDepartments = searchParams.get('department')?.split(',').filter(Boolean) || []
  const urlDateFrom = searchParams.get('dateFrom') || ''
  const urlDateTo = searchParams.get('dateTo') || ''
  const urlSort = searchParams.get('sort') || 'newest'
  const urlSearch = searchParams.get('search') || ''
  const urlPage = parseInt(searchParams.get('page') || '1', 10)

  // ── Local state ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState(urlSearch)
  const [serviceTypes, setServiceTypes] = useState<string[]>(urlServiceTypes)
  const [statuses, setStatuses] = useState<string[]>(urlStatuses)
  const [departments, setDepartments] = useState<string[]>(urlDepartments)
  const [dateFrom, setDateFrom] = useState(urlDateFrom)
  const [dateTo, setDateTo] = useState(urlDateTo)
  const [sort, setSort] = useState(urlSort)
  const [page, setPage] = useState(urlPage)

  const [applications, setApplications] = useState<ApplicationRow[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [filterCounts, setFilterCounts] = useState<FilterCounts>({
    byService: {},
    byStatus: {},
    byDepartment: {},
  })
  const [loading, setLoading] = useState(true)

  // ── Debounce ref for search ──────────────────────────────────────────────
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Sync filters to URL search params ────────────────────────────────────
  const syncToUrl = useCallback(
    (overrides?: {
      serviceTypes?: string[]
      statuses?: string[]
      departments?: string[]
      dateFrom?: string
      dateTo?: string
      sort?: string
      search?: string
      page?: number
    }) => {
      const params = new URLSearchParams()
      const st = overrides?.serviceTypes ?? serviceTypes
      const s = overrides?.statuses ?? statuses
      const d = overrides?.departments ?? departments
      const df = overrides?.dateFrom ?? dateFrom
      const dt = overrides?.dateTo ?? dateTo
      const so = overrides?.sort ?? sort
      const sq = overrides?.search ?? searchQuery
      const p = overrides?.page ?? page

      if (st.length > 0) params.set('serviceType', st.join(','))
      if (s.length > 0) params.set('status', s.join(','))
      if (d.length > 0) params.set('department', d.join(','))
      if (df) params.set('dateFrom', df)
      if (dt) params.set('dateTo', dt)
      if (so && so !== 'newest') params.set('sort', so)
      if (sq) params.set('search', sq)
      if (p > 1) params.set('page', String(p))

      const qs = params.toString()
      router.replace(qs ? `/customer?${qs}` : '/customer', { scroll: false })
    },
    [serviceTypes, statuses, departments, dateFrom, dateTo, sort, searchQuery, page, router],
  )

  // ── Fetch applications ───────────────────────────────────────────────────
  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (serviceTypes.length > 0) params.set('serviceType', serviceTypes.join(','))
      if (statuses.length > 0) params.set('status', statuses.join(','))
      if (departments.length > 0) params.set('department', departments.join(','))
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      if (sort) params.set('sort', sort)
      if (searchQuery) params.set('search', searchQuery)
      params.set('page', String(page))
      params.set('limit', '10')

      const res = await fetch(`/api/member/applications?${params.toString()}`)
      const data: APIResponse = await res.json()

      if (data.success) {
        setApplications(data.applications)
        setTotal(data.total)
        setTotalPages(data.totalPages)
        setFilterCounts(data.filterCounts)
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err)
    } finally {
      setLoading(false)
    }
  }, [serviceTypes, statuses, departments, dateFrom, dateTo, sort, searchQuery, page])

  // ── Fetch on filter/page change ──────────────────────────────────────────
  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  // ── Filter change handlers ───────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setPage(1)
      syncToUrl({ search: value, page: 1 })
    }, 300)
  }

  const handleServiceTypesChange = (values: string[]) => {
    setServiceTypes(values)
    setPage(1)
    syncToUrl({ serviceTypes: values, page: 1 })
  }

  const handleStatusesChange = (values: string[]) => {
    setStatuses(values)
    setPage(1)
    syncToUrl({ statuses: values, page: 1 })
  }

  const handleDepartmentsChange = (values: string[]) => {
    setDepartments(values)
    setPage(1)
    syncToUrl({ departments: values, page: 1 })
  }

  const handleDateFromChange = (value: string) => {
    setDateFrom(value)
    setPage(1)
    syncToUrl({ dateFrom: value, page: 1 })
  }

  const handleDateToChange = (value: string) => {
    setDateTo(value)
    setPage(1)
    syncToUrl({ dateTo: value, page: 1 })
  }

  const handleSortChange = (value: string) => {
    setSort(value)
    setPage(1)
    syncToUrl({ sort: value, page: 1 })
  }

  const handlePageChange = (p: number) => {
    setPage(p)
    syncToUrl({ page: p })
  }

  const handleClearAll = () => {
    setSearchQuery('')
    setServiceTypes([])
    setStatuses([])
    setDepartments([])
    setDateFrom('')
    setDateTo('')
    setSort('newest')
    setPage(1)
    router.replace('/customer', { scroll: false })
  }

  // ── Derived stats ────────────────────────────────────────────────────────
  const statPendingReview =
    (filterCounts.byStatus['SUBMITTED'] || 0) +
    (filterCounts.byStatus['UNDER_REVIEW'] || 0)
  const statApproved = filterCounts.byStatus['APPROVED'] || 0
  const statRequiresAction = filterCounts.byStatus['PENDING_INFO'] || 0
  const statTotal = Object.values(filterCounts.byStatus).reduce((sum, n) => sum + n, 0)

  const hasFilters =
    searchQuery.length > 0 ||
    serviceTypes.length > 0 ||
    statuses.length > 0 ||
    departments.length > 0 ||
    dateFrom !== '' ||
    dateTo !== ''

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ─── Header section ───────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          {t.customer.dashboard.title}
        </h1>
        <p className="text-sm sm:text-base" style={{ color: 'var(--muted)' }}>
          {isRtl
            ? 'تتبع جميع طلبات الخدمة المقدمة عبر غرفة أبوظبي'
            : 'Track all your submitted service requests across Abu Dhabi Chamber'}
        </p>
      </div>

      {/* ─── Stats strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {/* Total Applications */}
        <div className="rounded-2xl p-4 theme-panel" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}
            >
              <TotalIcon />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
                {loading ? '-' : statTotal}
              </p>
              <p className="text-sm truncate" style={{ color: 'var(--muted)' }}>
                {isRtl ? 'إجمالي الطلبات' : 'Total Applications'}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="rounded-2xl p-4 theme-panel" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'color-mix(in srgb, var(--accent-amber) 15%, transparent)', color: 'var(--accent-amber)' }}
            >
              <PendingIcon />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
                {loading ? '-' : statPendingReview}
              </p>
              <p className="text-sm truncate" style={{ color: 'var(--muted)' }}>
                {isRtl ? 'قيد المراجعة' : 'Pending Review'}
              </p>
            </div>
          </div>
        </div>

        {/* Approved */}
        <div className="rounded-2xl p-4 theme-panel" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'color-mix(in srgb, var(--accent-green) 15%, transparent)', color: 'var(--accent-green)' }}
            >
              <ApprovedIcon />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
                {loading ? '-' : statApproved}
              </p>
              <p className="text-sm truncate" style={{ color: 'var(--muted)' }}>
                {isRtl ? 'تمت الموافقة' : 'Approved'}
              </p>
            </div>
          </div>
        </div>

        {/* Requires Action */}
        <div className="rounded-2xl p-4 theme-panel" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'color-mix(in srgb, var(--accent-red) 15%, transparent)', color: 'var(--accent-red)' }}
            >
              <ActionRequiredIcon />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
                {loading ? '-' : statRequiresAction}
              </p>
              <p className="text-sm truncate" style={{ color: 'var(--muted)' }}>
                {isRtl ? 'يتطلب إجراء' : 'Requires Action'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CTA banner (only when no applications exist) ─────────────────── */}
      {!loading && statTotal === 0 && (
        <div
          className="mb-8 rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, var(--accent-green)))',
          }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
            <div>
              <h2 className="text-lg font-semibold mb-1 text-white">
                {isRtl
                  ? 'ابدأ أول طلب لك من خلال دليل الخدمات'
                  : 'Start your first application through the Service Directory'}
              </h2>
              <p className="text-sm text-white/80">
                {isRtl
                  ? 'تصفح خدمات غرفة أبوظبي وقدّم طلبك إلكترونياً'
                  : 'Browse Abu Dhabi Chamber services and submit your request online'}
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors whitespace-nowrap"
              style={{
                background: 'rgba(255,255,255,0.95)',
                color: 'var(--primary)',
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isRtl ? 'M11 17l-5-5m0 0l5-5m-5 5h12' : 'M13 7l5 5m0 0l-5 5m5-5H6'}
                />
              </svg>
              {isRtl ? 'تصفح الخدمات' : 'Browse Services'}
            </Link>
          </div>
          {/* Decorative circles */}
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
            style={{ background: '#fff' }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10"
            style={{ background: '#fff' }}
          />
        </div>
      )}

      {/* ─── Filter bar ───────────────────────────────────────────────────── */}
      <ApplicationsFilterBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        serviceTypes={serviceTypes}
        onServiceTypesChange={handleServiceTypesChange}
        statuses={statuses}
        onStatusesChange={handleStatusesChange}
        departments={departments}
        onDepartmentsChange={handleDepartmentsChange}
        dateFrom={dateFrom}
        onDateFromChange={handleDateFromChange}
        dateTo={dateTo}
        onDateToChange={handleDateToChange}
        sort={sort}
        onSortChange={handleSortChange}
        onClearAll={handleClearAll}
        resultCount={applications.length}
        totalCount={total}
        filterCounts={filterCounts}
      />

      {/* ─── Applications table ───────────────────────────────────────────── */}
      <ApplicationsTable
        applications={applications}
        loading={loading}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalCount={total}
        hasFilters={hasFilters}
      />
    </div>
  )
}

// ─── Loading fallback for Suspense ─────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 rounded-lg mb-2" style={{ background: 'var(--panel-2)' }} />
        <div className="h-4 w-80 rounded-lg" style={{ background: 'var(--panel-2)' }} />
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl p-4 theme-panel"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl" style={{ background: 'var(--panel-2)' }} />
              <div>
                <div className="h-6 w-12 rounded mb-1" style={{ background: 'var(--panel-2)' }} />
                <div className="h-3 w-20 rounded" style={{ background: 'var(--panel-2)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Table skeleton */}
      <div className="rounded-2xl theme-panel overflow-hidden">
        <div className="h-12" style={{ background: 'var(--panel-2)' }} />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="h-4 w-32 rounded" style={{ background: 'var(--panel-2)' }} />
            <div className="h-4 w-20 rounded" style={{ background: 'var(--panel-2)' }} />
            <div className="h-4 w-40 rounded" style={{ background: 'var(--panel-2)' }} />
            <div className="h-4 w-24 rounded" style={{ background: 'var(--panel-2)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Default export with Suspense boundary ──────────────────────────────────

export default function CustomerDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <CustomerDashboardContent />
    </Suspense>
  )
}
