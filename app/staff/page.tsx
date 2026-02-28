'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { StaffAccessGuard, ApplicationStatusBadge } from '@/components/staff'

// ─── Types ──────────────────────────────────────────────────────────────────

interface StaffStats {
  totalOpen: number
  pendingReview: number
  resolvedToday: number
  avgResolutionDays: number
}

interface ServiceCounts {
  [key: string]: { total: number; oldestPendingDays: number }
}

interface ActivityEntry {
  id: string
  applicationId: string
  serviceType: string
  action: string
  performedBy: string
  performedAt: string
  notes?: string | null
  application?: {
    id: string
    serviceType: string
    submittedBy: string
  }
}

// ─── Service Card Data ──────────────────────────────────────────────────────

interface ServiceCardDef {
  id: string
  serviceType: string
  name: string
  nameAr: string
  slug: string
  dept: string
  deptAr: string
  sla: string
  slaAr: string
  category: string
  categoryAr: string
  categoryColor: string
  icon: React.ReactNode
}

const SERVICES: ServiceCardDef[] = [
  {
    id: '01', serviceType: 'KNOWLEDGE_SHARING',
    name: 'Knowledge Sharing & Upskilling', nameAr: 'تبادل المعرفة والتطوير',
    slug: 'knowledge-sharing', dept: 'Business Connect & Services', deptAr: 'ربط الأعمال والخدمات',
    sla: '1 day', slaAr: 'يوم واحد',
    category: 'Training & Capability Development', categoryAr: 'التدريب وتنمية القدرات',
    categoryColor: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>,
  },
  {
    id: '02', serviceType: 'CHAMBER_BOOST',
    name: 'Chamber Boost', nameAr: 'تعزيز الغرفة',
    slug: 'chamber-boost', dept: 'Business Connect & Services', deptAr: 'ربط الأعمال والخدمات',
    sla: '2 working days', slaAr: 'يومان عمل',
    category: 'Commercial', categoryAr: 'تجاري',
    categoryColor: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>,
  },
  {
    id: '03', serviceType: 'BUSINESS_MATCHMAKING',
    name: 'Chamber Business Matchmaking', nameAr: 'مطابقة الأعمال',
    slug: 'business-matchmaking', dept: 'Business Connect & Services', deptAr: 'ربط الأعمال والخدمات',
    sla: '2–10 working days', slaAr: '2-10 أيام عمل',
    category: 'Commercial', categoryAr: 'تجاري',
    categoryColor: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>,
  },
  {
    id: '04', serviceType: 'ESG_LABEL',
    name: 'Chamber ESG Label', nameAr: 'ختم الاستدامة للغرفة',
    slug: 'esg-label', dept: 'Business Connect & Services', deptAr: 'ربط الأعمال والخدمات',
    sla: 'TBD (multi-phase)', slaAr: 'يُحدد لاحقاً (متعدد المراحل)',
    category: 'Certificates', categoryAr: 'الشهادات',
    categoryColor: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></svg>,
  },
  {
    id: '05', serviceType: 'BUSINESS_DEVELOPMENT',
    name: 'Business Development Services', nameAr: 'خدمات تطوير الأعمال',
    slug: 'business-development', dept: 'Business Connect & Services', deptAr: 'ربط الأعمال والخدمات',
    sla: '2 working days', slaAr: 'يومان عمل',
    category: 'Training', categoryAr: 'التدريب',
    categoryColor: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" /></svg>,
  },
  {
    id: '06', serviceType: 'BUSINESS_ENABLEMENT',
    name: 'Business Enablement Advisory', nameAr: 'الاستشارات التمكينية للأعمال',
    slug: 'business-enablement', dept: 'Business Connect & Services', deptAr: 'ربط الأعمال والخدمات',
    sla: 'TBD', slaAr: 'يُحدد لاحقاً',
    category: 'Training', categoryAr: 'التدريب',
    categoryColor: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>,
  },
  {
    id: '07', serviceType: 'POLICY_ADVOCACY',
    name: 'Policy Advocacy', nameAr: 'المناصرة والسياسات',
    slug: 'policy-advocacy', dept: 'Advocacy & Government Affairs', deptAr: 'المناصرة والشؤون الحكومية',
    sla: 'Varies', slaAr: 'متغير',
    category: 'Policy Advocacy', categoryAr: 'المناصرة والسياسات',
    categoryColor: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" /></svg>,
  },
  {
    id: '08', serviceType: 'LOYALTY_PLUS',
    name: 'ADCCI Loyalty Plus', nameAr: 'ولاء غرفة أبوظبي بلس',
    slug: 'loyalty-plus', dept: 'Business Connect & Services', deptAr: 'ربط الأعمال والخدمات',
    sla: 'TBD', slaAr: 'يُحدد لاحقاً',
    category: 'Commercial', categoryAr: 'تجاري',
    categoryColor: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>,
  },
  {
    id: '14', serviceType: 'AD_CONNECT_CONCIERGE',
    name: 'AD Connect & Concierge', nameAr: 'خدمة AD Connect والكونسيرج',
    slug: 'ad-connect', dept: 'Member Affairs', deptAr: 'شؤون الأعضاء',
    sla: 'TBD', slaAr: 'يُحدد لاحقاً',
    category: 'Facility Booking', categoryAr: 'حجز المرافق',
    categoryColor: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
  },
]

// ─── Service Type to Slug Map ───────────────────────────────────────────────

const SERVICE_TYPE_SLUG: Record<string, string> = {
  KNOWLEDGE_SHARING: 'knowledge-sharing',
  CHAMBER_BOOST: 'chamber-boost',
  BUSINESS_MATCHMAKING: 'business-matchmaking',
  ESG_LABEL: 'esg-label',
  BUSINESS_DEVELOPMENT: 'business-development',
  BUSINESS_ENABLEMENT: 'business-enablement',
  POLICY_ADVOCACY: 'policy-advocacy',
  LOYALTY_PLUS: 'loyalty-plus',
  AD_CONNECT_CONCIERGE: 'ad-connect',
}

// ─── Relative Time Helper ───────────────────────────────────────────────────

function relativeTime(dateStr: string, isRtl: boolean): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return isRtl ? 'الآن' : 'Just now'
  if (diffMin < 60) return isRtl ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`
  if (diffHr < 24) return isRtl ? `منذ ${diffHr} ساعة` : `${diffHr}h ago`
  if (diffDay < 7) return isRtl ? `منذ ${diffDay} يوم` : `${diffDay}d ago`
  return date.toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric' })
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

function ServiceCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 theme-panel animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl" style={{ background: 'var(--panel-2)' }} />
        <div className="flex-1">
          <div className="h-4 w-32 rounded mb-2" style={{ background: 'var(--panel-2)' }} />
          <div className="h-3 w-20 rounded" style={{ background: 'var(--panel-2)' }} />
        </div>
      </div>
      <div className="h-3 w-full rounded mb-4" style={{ background: 'var(--panel-2)' }} />
      <div className="h-8 w-full rounded-xl" style={{ background: 'var(--panel-2)' }} />
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-2 h-2 rounded-full mt-2" style={{ background: 'var(--panel-2)' }} />
          <div className="flex-1">
            <div className="h-4 w-3/4 rounded mb-2" style={{ background: 'var(--panel-2)' }} />
            <div className="h-3 w-1/2 rounded" style={{ background: 'var(--panel-2)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Status Dot (for service cards) ─────────────────────────────────────────

function StatusDot({ oldestPendingDays }: { oldestPendingDays: number }) {
  let color: string
  let title: string

  if (oldestPendingDays > 7) {
    color = 'bg-red-500'
    title = `Oldest pending: ${oldestPendingDays}d (> 7 days)`
  } else if (oldestPendingDays >= 3) {
    color = 'bg-amber-500'
    title = `Oldest pending: ${oldestPendingDays}d (3-7 days)`
  } else {
    color = 'bg-emerald-500'
    title = oldestPendingDays > 0 ? `Oldest pending: ${oldestPendingDays}d` : 'No overdue items'
  }

  return <span className={`w-2.5 h-2.5 rounded-full ${color}`} title={title} />
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function StaffPortalHub() {
  const { locale, dir } = useI18n()
  const isRtl = locale === 'ar'

  // Access: hardcoded true for now (to be replaced with real auth)
  const [isAuthorized] = useState(true)

  // Data state
  const [stats, setStats] = useState<StaffStats | null>(null)
  const [serviceCounts, setServiceCounts] = useState<ServiceCounts>({})
  const [activityEntries, setActivityEntries] = useState<ActivityEntry[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingActivity, setLoadingActivity] = useState(true)
  const [refreshingActivity, setRefreshingActivity] = useState(false)

  // Staff info (demo)
  const staffName = isRtl ? 'أحمد المنصوري' : 'Ahmed Al Mansouri'
  const staffRole = 'ADMIN'
  const staffDept = isRtl ? 'ربط الأعمال والخدمات' : 'Business Connect & Services'

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/staff/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.stats)
        if (data.serviceCounts) {
          setServiceCounts(data.serviceCounts)
        }
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }, [])

  const fetchActivity = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshingActivity(true)
    try {
      const res = await fetch('/api/staff/activity?pageSize=15')
      const data = await res.json()
      if (data.success) setActivityEntries(data.entries)
    } catch (err) {
      console.error('Error fetching activity:', err)
    } finally {
      setLoadingActivity(false)
      setRefreshingActivity(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    fetchActivity()
  }, [fetchStats, fetchActivity])

  const roleLabels: Record<string, { en: string; ar: string }> = {
    ADMIN: { en: 'Admin', ar: 'مدير' },
    REVIEWER: { en: 'Reviewer', ar: 'مراجع' },
    VIEWER: { en: 'Viewer', ar: 'مشاهد' },
  }

  return (
    <StaffAccessGuard isAuthorized={isAuthorized}>
      <div className={`min-h-screen ${isRtl ? 'rtl' : 'ltr'}`} style={{ background: 'var(--bg)' }} dir={dir}>
        {/* ─── Gradient Header Banner ────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#0f2847]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {isRtl ? 'بوابة العمليات الداخلية' : 'Staff Operations Portal'}
                </h1>
                <p className="text-white/70 text-lg">
                  {isRtl ? 'إدارة خدمات غرفة أبوظبي الداخلية' : 'ADCCI Internal Service Management'}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <div className={`text-${isRtl ? 'start' : 'end'}`}>
                  <p className="text-sm font-medium text-white">{staffName}</p>
                  <p className="text-xs text-white/60">{staffDept}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-white/10 text-white border-white/20">
                  {roleLabels[staffRole] ? (isRtl ? roleLabels[staffRole].ar : roleLabels[staffRole].en) : staffRole}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* ─── Stats Strip ───────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {loadingStats ? (
              Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
            ) : stats ? (
              <>
                <div className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'الطلبات المفتوحة' : 'Total Open'}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{stats.totalOpen}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'عبر جميع الخدمات' : 'across all services'}
                  </p>
                </div>
                <div className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'بانتظار المراجعة' : 'Pending Review'}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--accent-amber)' }}>{stats.pendingReview}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'مُقدَّم أو قيد المراجعة' : 'submitted or under review'}
                  </p>
                </div>
                <div className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'تمت معالجتها اليوم' : 'Resolved Today'}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--accent-green)' }}>{stats.resolvedToday}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'مُعتمد أو مرفوض أو مغلق' : 'approved, rejected, or closed'}
                  </p>
                </div>
                <div className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'متوسط وقت المعالجة' : 'Avg. Resolution Time'}
                  </p>
                  <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {stats.avgResolutionDays > 0 ? `${stats.avgResolutionDays}d` : '—'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                    {isRtl ? 'آخر 30 يوم' : 'last 30 days'}
                  </p>
                </div>
              </>
            ) : null}
          </div>

          {/* ─── Service Cards Grid ────────────────────────────────────── */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>
              {isRtl ? 'بوابات الخدمات' : 'Service Portals'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loadingStats ? (
                Array.from({ length: 9 }).map((_, i) => <ServiceCardSkeleton key={i} />)
              ) : (
                SERVICES.map(svc => {
                  const counts = serviceCounts[svc.serviceType] || { total: 0, oldestPendingDays: 0 }
                  return (
                    <div key={svc.id} className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all group flex flex-col">
                      {/* Header: icon + status dot */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--panel-2)', color: 'var(--primary)' }}>
                          {svc.icon}
                        </div>
                        <StatusDot oldestPendingDays={counts.oldestPendingDays} />
                      </div>

                      {/* Name */}
                      <h3 className="text-sm font-semibold mb-1 group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text)' }}>
                        {isRtl ? svc.nameAr : svc.name}
                      </h3>

                      {/* Department */}
                      <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
                        {isRtl ? svc.deptAr : svc.dept}
                      </p>

                      {/* Category badge */}
                      <div className="mb-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${svc.categoryColor}`}>
                          {isRtl ? svc.categoryAr : svc.category}
                        </span>
                      </div>

                      {/* Count + SLA */}
                      <div className="flex items-center justify-between mb-4 flex-1">
                        <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                          {counts.total} {isRtl ? 'طلب' : 'applications'}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>
                          SLA: {isRtl ? svc.slaAr : svc.sla}
                        </span>
                      </div>

                      {/* Open Portal button */}
                      <Link
                        href={`/staff/${svc.slug}`}
                        className="w-full px-4 py-2 text-sm font-medium rounded-xl transition-colors bg-blue-600 text-white hover:bg-blue-700 text-center block"
                      >
                        {isRtl ? 'فتح البوابة' : 'Open Portal'}
                      </Link>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* ─── Recent Activity Feed ──────────────────────────────────── */}
          <div className="rounded-2xl p-6 theme-panel">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>
                {isRtl ? 'آخر النشاطات' : 'Recent Activity'}
              </h2>
              <button
                onClick={() => fetchActivity(true)}
                disabled={refreshingActivity}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--primary)', border: '1px solid var(--border)' }}
              >
                <svg className={`w-4 h-4 ${refreshingActivity ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                {isRtl ? 'تحديث' : 'Refresh'}
              </button>
            </div>

            {loadingActivity ? (
              <ActivitySkeleton />
            ) : activityEntries.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--panel-2)' }}>
                  <svg className="w-6 h-6" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'لا يوجد نشاط حتى الآن. ستظهر الإجراءات هنا عند معالجة الطلبات.' : 'No activity yet. Actions will appear here as applications are processed.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activityEntries.map(entry => {
                  const slug = SERVICE_TYPE_SLUG[entry.serviceType] || ''
                  return (
                    <div key={entry.id} className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ background: 'var(--primary)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm" style={{ color: 'var(--text)' }}>{entry.action}</p>
                          <span className="text-xs whitespace-nowrap" style={{ color: 'var(--muted)' }}>
                            {relativeTime(entry.performedAt, isRtl)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <ApplicationStatusBadge status={entry.serviceType.replace(/_/g, ' ')} />
                          <span className="text-xs" style={{ color: 'var(--muted)' }}>
                            {entry.performedBy}
                          </span>
                          {entry.applicationId && (
                            <Link
                              href={`/staff/${slug}?app=${entry.applicationId}`}
                              className="text-xs font-mono hover:opacity-80 transition-opacity"
                              style={{ color: 'var(--primary)' }}
                            >
                              {entry.applicationId.slice(0, 8)}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffAccessGuard>
  )
}
