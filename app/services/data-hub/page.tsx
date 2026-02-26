'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { useTheme } from 'next-themes'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  datasets as allDatasets,
  keyMetrics,
  categories,
  categoriesAr,
  dataSources,
  dataSourcesAr,
  frequencies,
  frequenciesAr,
  chartTypes,
  categoryColors,
  dataSourceColors,
  CHART_COLORS,
  type Dataset,
  type ChartDataPoint,
} from '@/lib/data-hub-data'

// ─── CSV Download Utility ───────────────────────────────────────────────────
function downloadCSV(dataset: Dataset) {
  const hasMultiSeries = dataset.chartData.some(d => d.value2 !== undefined)
  const headers = hasMultiSeries ? ['Label', 'Value', 'Value 2'] : ['Label', 'Value']
  const rows = dataset.chartData.map(d =>
    hasMultiSeries ? [d.label, String(d.value), String(d.value2 ?? '')] : [d.label, String(d.value)]
  )
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${dataset.id}-${dataset.title.replace(/\s+/g, '-').toLowerCase()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ─── Member Access Guard ────────────────────────────────────────────────────
function MemberAccessGuard({ locale }: { locale: string }) {
  const isRtl = locale === 'ar'
  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-[#000C14] dark:via-[#001520] dark:to-[#001B30] ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {isRtl ? 'محتوى حصري للأعضاء' : 'Members-Only Content'}
          </h2>
          <p className="text-gray-600 dark:text-white/60 mb-8">
            {isRtl
              ? 'مركز البيانات متاح حصرياً لأعضاء غرفة أبوظبي. سجّل الدخول أو انضم للوصول إلى البيانات والتحليلات.'
              : 'The Data Hub is exclusively available to Abu Dhabi Chamber members. Log in or become a member to access data insights and analytics.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
              {isRtl ? 'تسجيل الدخول' : 'Login to Access'}
            </button>
            <button className="px-6 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 font-medium rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors">
              {isRtl ? 'انضم كعضو' : 'Become a Member'}
            </button>
          </div>
          <Link href="/services" className="inline-flex items-center mt-6 text-sm text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60 transition-colors">
            <svg className="w-4 h-4 me-1 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {isRtl ? 'العودة لدليل الخدمات' : 'Back to Service Directory'}
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Category Badge ─────────────────────────────────────────────────────────
function CategoryBadge({ category }: { category: string }) {
  const c = categoryColors[category] || { bg: 'bg-gray-100 dark:bg-white/10', text: 'text-gray-800 dark:text-gray-300', border: 'border-gray-200 dark:border-white/10' }
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>{category}</span>
}

// ─── Data Source Badge ──────────────────────────────────────────────────────
function SourceBadge({ source }: { source: string }) {
  const c = dataSourceColors[source] || { bg: 'bg-gray-100 dark:bg-white/10', text: 'text-gray-800 dark:text-gray-300', border: 'border-gray-200 dark:border-white/10' }
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>{source}</span>
}

// ─── Mini Chart (no axes/tooltips) ──────────────────────────────────────────
function MiniChart({ dataset }: { dataset: Dataset }) {
  const colors = dataset.chartColors || CHART_COLORS
  const data = dataset.chartData

  if (dataset.chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={80}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={35} innerRadius={18} strokeWidth={0}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (dataset.chartType === 'area' || dataset.chartType === 'mixed') {
    return (
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id={`mg-${dataset.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={colors[0]} fill={`url(#mg-${dataset.id})`} strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  if (dataset.chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <Line type="monotone" dataKey="value" stroke={colors[0] || CHART_COLORS[0]} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  // Default: bar
  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
        <Bar dataKey="value" fill={colors[0] || CHART_COLORS[0]} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Full Interactive Chart ─────────────────────────────────────────────────
function FullChart({ dataset, chartTypeOverride, isDark }: {
  dataset: Dataset
  chartTypeOverride: string
  isDark: boolean
}) {
  const colors = dataset.chartColors || CHART_COLORS
  const data = dataset.chartData
  const hasMulti = data.some(d => d.value2 !== undefined)
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'
  const textColor = isDark ? '#9fb0bd' : '#6b7280'
  const tooltipBg = isDark ? '#0a2236' : '#ffffff'
  const tooltipBorder = isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'

  const tooltipStyle = {
    contentStyle: { backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '12px', fontSize: '13px' },
    labelStyle: { color: textColor },
  }

  const type = chartTypeOverride || dataset.chartType

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={360}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={130} innerRadius={60} strokeWidth={2} stroke={isDark ? '#071824' : '#ffffff'} label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''}: ${((percent ?? 0) * 100).toFixed(0)}%`}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '12px', color: textColor }} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="label" tick={{ fill: textColor, fontSize: 12 }} />
          <YAxis tick={{ fill: textColor, fontSize: 12 }} />
          <Tooltip {...tooltipStyle} />
          {hasMulti && <Legend wrapperStyle={{ fontSize: '12px', color: textColor }} />}
          <defs>
            <linearGradient id={`fc-area-${dataset.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors[0]} stopOpacity={0.02} />
            </linearGradient>
            {hasMulti && (
              <linearGradient id={`fc-area2-${dataset.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[1]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors[1]} stopOpacity={0.02} />
              </linearGradient>
            )}
          </defs>
          <Area type="monotone" dataKey="value" name={hasMulti ? 'Series 1' : dataset.unit} stroke={colors[0]} fill={`url(#fc-area-${dataset.id})`} strokeWidth={2} />
          {hasMulti && <Area type="monotone" dataKey="value2" name="Series 2" stroke={colors[1]} fill={`url(#fc-area2-${dataset.id})`} strokeWidth={2} />}
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="label" tick={{ fill: textColor, fontSize: 12 }} />
          <YAxis tick={{ fill: textColor, fontSize: 12 }} />
          <Tooltip {...tooltipStyle} />
          {hasMulti && <Legend wrapperStyle={{ fontSize: '12px', color: textColor }} />}
          <Line type="monotone" dataKey="value" name={hasMulti ? 'Series 1' : dataset.unit} stroke={colors[0]} strokeWidth={2} dot={{ r: 3, fill: colors[0] }} activeDot={{ r: 5 }} />
          {hasMulti && <Line type="monotone" dataKey="value2" name="Series 2" stroke={colors[1] || CHART_COLORS[1]} strokeWidth={2} dot={{ r: 3, fill: colors[1] || CHART_COLORS[1] }} activeDot={{ r: 5 }} />}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'mixed') {
    return (
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="label" tick={{ fill: textColor, fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fill: textColor, fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: textColor, fontSize: 12 }} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: '12px', color: textColor }} />
          <Bar yAxisId="left" dataKey="value" name="Volume" fill={colors[0]} radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="value2" name="Rate (%)" stroke={colors[1] || CHART_COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // Default: bar
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="label" tick={{ fill: textColor, fontSize: 12 }} />
        <YAxis tick={{ fill: textColor, fontSize: 12 }} />
        <Tooltip {...tooltipStyle} />
        {hasMulti && <Legend wrapperStyle={{ fontSize: '12px', color: textColor }} />}
        <Bar dataKey="value" name={hasMulti ? 'Series 1' : dataset.unit} fill={colors[0]} radius={[4, 4, 0, 0]} />
        {hasMulti && <Bar dataKey="value2" name="Series 2" fill={colors[1] || CHART_COLORS[1]} radius={[4, 4, 0, 0]} />}
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────
function DatasetCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 theme-panel animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-24" />
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-20" />
      </div>
      <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4 mb-4" />
      <div className="h-[80px] bg-gray-200 dark:bg-white/10 rounded-lg mb-4" />
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-28" />
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-lg w-24" />
      </div>
    </div>
  )
}

// ─── Dataset Card ───────────────────────────────────────────────────────────
function DatasetCard({ dataset, locale, onView }: {
  dataset: Dataset
  locale: string
  onView: (d: Dataset) => void
}) {
  const isRtl = locale === 'ar'
  const title = isRtl ? dataset.titleAr : dataset.title
  const desc = isRtl ? dataset.descriptionAr : dataset.description
  const category = isRtl ? dataset.categoryAr : dataset.category
  const source = isRtl ? dataset.dataSourceAr : dataset.dataSource
  const freq = isRtl ? dataset.frequencyAr : dataset.frequency
  const tags = isRtl ? dataset.tagsAr : dataset.tags
  const visibleTags = tags.slice(0, 2)
  const extraTags = tags.length - 2

  return (
    <div className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all group">
      {/* Badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <CategoryBadge category={category} />
        <SourceBadge source={source} />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--muted)' }}>{desc}</p>

      {/* Mini Chart */}
      <div className="mb-3 rounded-lg overflow-hidden bg-gray-50/50 dark:bg-white/[0.02]">
        <MiniChart dataset={dataset} />
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {visibleTags.map(tag => (
          <span key={tag} className="px-2 py-0.5 text-xs rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/50 border border-gray-200 dark:border-white/10">{tag}</span>
        ))}
        {extraTags > 0 && <span className="text-xs" style={{ color: 'var(--muted)' }}>+{extraTags}</span>}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
          <span>{new Date(dataset.lastUpdated).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'short', year: 'numeric' })}</span>
          <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">{freq}</span>
          <span>{dataset.recordCount}</span>
        </div>
        <button
          onClick={() => onView(dataset)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          {isRtl ? 'استكشاف' : 'Explore'}
        </button>
      </div>
    </div>
  )
}

// ─── Dataset Detail Modal ───────────────────────────────────────────────────
function DatasetDetailModal({ dataset, locale, isDark, onClose, relatedDatasets, onViewRelated }: {
  dataset: Dataset
  locale: string
  isDark: boolean
  onClose: () => void
  relatedDatasets: Dataset[]
  onViewRelated: (d: Dataset) => void
}) {
  const isRtl = locale === 'ar'
  const title = isRtl ? dataset.titleAr : dataset.title
  const desc = isRtl ? dataset.descriptionAr : dataset.description
  const category = isRtl ? dataset.categoryAr : dataset.category
  const source = isRtl ? dataset.dataSourceAr : dataset.dataSource
  const freq = isRtl ? dataset.frequencyAr : dataset.frequency
  const unit = isRtl ? dataset.unitAr : dataset.unit
  const tags = isRtl ? dataset.tagsAr : dataset.tags
  const [copied, setCopied] = useState(false)
  const [tablePage, setTablePage] = useState(0)
  const rowsPerPage = 8

  // Chart type toggle - determine allowed types
  const allowedTypes = useMemo(() => {
    if (dataset.chartType === 'pie') return ['pie'] // pie stays pie
    if (dataset.chartType === 'mixed') return ['mixed', 'bar', 'line']
    return ['bar', 'line', 'area']
  }, [dataset.chartType])
  const [activeChartType, setActiveChartType] = useState(dataset.chartType)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleEsc) }
  }, [onClose])

  const handleShare = () => {
    const url = `${window.location.origin}/services/data-hub?dataset=${dataset.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalPages = Math.ceil(dataset.chartData.length / rowsPerPage)
  const pageData = dataset.chartData.slice(tablePage * rowsPerPage, (tablePage + 1) * rowsPerPage)
  const hasMulti = dataset.chartData.some(d => d.value2 !== undefined)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[3vh] pb-[3vh]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl mx-4 max-h-[94vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#071824] border border-gray-200 dark:border-white/10 shadow-2xl">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 end-4 z-10 p-2 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <CategoryBadge category={category} />
              <SourceBadge source={source} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-white/60">{desc}</p>
          </div>

          {/* Metadata row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
              <p className="text-xs text-gray-500 dark:text-white/40 mb-1">{isRtl ? 'آخر تحديث' : 'Last Updated'}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(dataset.lastUpdated).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
              <p className="text-xs text-gray-500 dark:text-white/40 mb-1">{isRtl ? 'التكرار' : 'Frequency'}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{freq}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
              <p className="text-xs text-gray-500 dark:text-white/40 mb-1">{isRtl ? 'السجلات' : 'Records'}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{dataset.recordCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
              <p className="text-xs text-gray-500 dark:text-white/40 mb-1">{isRtl ? 'الوحدة' : 'Unit'}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{unit}</p>
            </div>
          </div>

          {/* Chart Type Toggle */}
          {allowedTypes.length > 1 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{isRtl ? 'نوع الرسم:' : 'Chart type:'}</span>
              {allowedTypes.map(ct => (
                <button
                  key={ct}
                  onClick={() => setActiveChartType(ct as Dataset['chartType'])}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    activeChartType === ct
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'
                  }`}
                >
                  {ct.charAt(0).toUpperCase() + ct.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Full Chart */}
          <div className="mb-6 p-4 rounded-xl bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
            <FullChart dataset={dataset} chartTypeOverride={activeChartType} isDark={isDark} />
          </div>

          {/* Data Table */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{isRtl ? 'البيانات' : 'Data Table'}</h3>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/[0.03]">
                    <th className="text-start px-4 py-2.5 font-medium text-gray-500 dark:text-white/50">{isRtl ? 'التسمية' : 'Label'}</th>
                    <th className="text-start px-4 py-2.5 font-medium text-gray-500 dark:text-white/50">{isRtl ? 'القيمة' : 'Value'}</th>
                    {hasMulti && <th className="text-start px-4 py-2.5 font-medium text-gray-500 dark:text-white/50">{isRtl ? 'القيمة 2' : 'Value 2'}</th>}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((row, i) => (
                    <tr key={i} className="border-t border-gray-100 dark:border-white/5">
                      <td className="px-4 py-2.5 text-gray-700 dark:text-white/70">{row.label}</td>
                      <td className="px-4 py-2.5 font-mono text-gray-900 dark:text-white">{row.value.toLocaleString()}</td>
                      {hasMulti && <td className="px-4 py-2.5 font-mono text-gray-900 dark:text-white">{row.value2?.toLocaleString() ?? '—'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {isRtl ? `صفحة ${tablePage + 1} من ${totalPages}` : `Page ${tablePage + 1} of ${totalPages}`}
                </span>
                <div className="flex gap-2">
                  <button disabled={tablePage === 0} onClick={() => setTablePage(p => p - 1)} className="px-3 py-1 text-xs rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" style={{ color: 'var(--text)' }}>
                    {isRtl ? 'السابق' : 'Prev'}
                  </button>
                  <button disabled={tablePage >= totalPages - 1} onClick={() => setTablePage(p => p + 1)} className="px-3 py-1 text-xs rounded-lg border border-gray-200 dark:border-white/10 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" style={{ color: 'var(--text)' }}>
                    {isRtl ? 'التالي' : 'Next'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button onClick={() => downloadCSV(dataset)} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              {isRtl ? 'تحميل CSV' : 'Download CSV'}
            </button>
            <button onClick={handleShare} className="flex items-center justify-center gap-2 px-6 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 font-medium rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              {copied ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'مشاركة' : 'Share Link')}
            </button>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/50 border border-gray-200 dark:border-white/10">{tag}</span>
              ))}
            </div>
          </div>

          {/* Related Datasets */}
          {relatedDatasets.length > 0 && (
            <div className="pt-6 border-t border-gray-200 dark:border-white/10">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">{isRtl ? 'مجموعات بيانات ذات صلة' : 'Related Datasets'}</h3>
              <div className="space-y-3">
                {relatedDatasets.map(related => (
                  <button key={related.id} onClick={() => onViewRelated(related)} className="w-full text-start flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{isRtl ? related.titleAr : related.title}</p>
                      <p className="text-xs text-gray-500 dark:text-white/40">{isRtl ? related.categoryAr : related.category} &middot; {related.recordCount}</p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 dark:text-white/30 rtl:rotate-180 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Multi-select Dropdown ──────────────────────────────────────────────────
function MultiSelect({ label, options, selected, onChange, locale }: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  locale: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isRtl = locale === 'ar'

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val])
  }

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
      >
        <span className="truncate">
          {selected.length === 0
            ? (isRtl ? 'الكل' : 'All')
            : selected.length === 1
              ? selected[0]
              : `${selected.length} ${isRtl ? 'محدد' : 'selected'}`}
        </span>
        <svg className={`w-4 h-4 ms-2 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-xl bg-white dark:bg-[#0a2236] border border-gray-200 dark:border-white/10 shadow-lg max-h-60 overflow-y-auto">
          {options.map(opt => (
            <button key={opt} onClick={() => toggle(opt)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-start">
              <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${selected.includes(opt) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-white/20'}`}>
                {selected.includes(opt) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page Component ────────────────────────────────────────────────────
export default function DataHubPage() {
  const { locale, t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const isRtl = locale === 'ar'
  const datasetSectionRef = useRef<HTMLDivElement>(null)

  const isMember = true

  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categories')?.split(',').filter(Boolean) || []
  )
  const [selectedSources, setSelectedSources] = useState<string[]>(
    searchParams.get('sources')?.split(',').filter(Boolean) || []
  )
  const [selectedFrequencies, setSelectedFrequencies] = useState<string[]>(
    searchParams.get('frequencies')?.split(',').filter(Boolean) || []
  )
  const [selectedChartTypes, setSelectedChartTypes] = useState<string[]>(
    searchParams.get('chartTypes')?.split(',').filter(Boolean) || []
  )
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recent')
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null)
  const [loading, setLoading] = useState(true)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // Open dataset from URL param
  useEffect(() => {
    const dsId = searchParams.get('dataset')
    if (dsId && !loading) {
      const found = allDatasets.find(d => d.id === dsId)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (found) setSelectedDataset(found)
    }
    // Handle metric click from URL
    const catFilter = searchParams.get('metricCategory')
    if (catFilter && !loading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCategories([catFilter])
      // scroll to dataset section
      setTimeout(() => datasetSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [searchParams, loading])

  // Sync filters to URL
  useEffect(() => {
    if (loading) return
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('q', debouncedSearch)
    if (selectedCategories.length) params.set('categories', selectedCategories.join(','))
    if (selectedSources.length) params.set('sources', selectedSources.join(','))
    if (selectedFrequencies.length) params.set('frequencies', selectedFrequencies.join(','))
    if (selectedChartTypes.length) params.set('chartTypes', selectedChartTypes.join(','))
    if (sortBy && sortBy !== 'recent') params.set('sort', sortBy)
    if (selectedDataset) params.set('dataset', selectedDataset.id)

    const paramString = params.toString()
    const newUrl = paramString ? `?${paramString}` : '/services/data-hub'
    router.replace(newUrl, { scroll: false })
  }, [debouncedSearch, selectedCategories, selectedSources, selectedFrequencies, selectedChartTypes, sortBy, selectedDataset, loading, router])

  // Filter & sort
  const filteredDatasets = useMemo(() => {
    let results = [...allDatasets]

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      results = results.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.titleAr.includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.descriptionAr.includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q)) ||
        d.tagsAr.some(t => t.includes(q))
      )
    }

    if (selectedCategories.length > 0) results = results.filter(d => selectedCategories.includes(d.category))
    if (selectedSources.length > 0) results = results.filter(d => selectedSources.includes(d.dataSource))
    if (selectedFrequencies.length > 0) results = results.filter(d => selectedFrequencies.includes(d.frequency))
    if (selectedChartTypes.length > 0) results = results.filter(d => selectedChartTypes.includes(d.chartType))

    switch (sortBy) {
      case 'records':
        results.sort((a, b) => {
          const extract = (s: string) => parseInt(s.replace(/[^0-9]/g, '')) || 0
          return extract(b.recordCount) - extract(a.recordCount)
        })
        break
      case 'alpha':
        results.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'recent':
      default:
        results.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
        break
    }

    return results
  }, [debouncedSearch, selectedCategories, selectedSources, selectedFrequencies, selectedChartTypes, sortBy])

  const featuredDatasets = useMemo(() => allDatasets.filter(d => d.isFeatured), [])

  const hasActiveFilters = debouncedSearch || selectedCategories.length > 0 || selectedSources.length > 0 || selectedFrequencies.length > 0 || selectedChartTypes.length > 0

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setDebouncedSearch('')
    setSelectedCategories([])
    setSelectedSources([])
    setSelectedFrequencies([])
    setSelectedChartTypes([])
    setSortBy('recent')
  }, [])

  const handleMetricClick = (category: string) => {
    setSelectedCategories([category])
    setTimeout(() => datasetSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const relatedDatasets = useMemo(() => {
    if (!selectedDataset) return []
    return allDatasets.filter(d => d.id !== selectedDataset.id && d.category === selectedDataset.category).slice(0, 3)
  }, [selectedDataset])

  if (!isMember) return <MemberAccessGuard locale={locale} />

  const el = t.dataHub

  // Find latest update date
  const latestUpdate = allDatasets.reduce((latest, d) => d.lastUpdated > latest ? d.lastUpdated : latest, allDatasets[0].lastUpdated)

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-[#000C14] dark:via-[#001520] dark:to-[#001B30] ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 relative">
          <Link href="/services" className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white/80 mb-8 transition-colors text-sm">
            <svg className="w-4 h-4 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            {t.services.backToDirectory}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">{el.title}</h1>
              <p className="text-gray-600 dark:text-white/60 max-w-2xl">{el.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/50 border border-gray-200 dark:border-white/10">
                {el.lastUpdated}: {new Date(latestUpdate).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {keyMetrics.map(metric => (
            <button
              key={metric.id}
              onClick={() => handleMetricClick(metric.category)}
              className="p-4 rounded-2xl theme-panel hover:shadow-lg transition-all text-start group"
            >
              <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{metric.value}</p>
              <p className="text-xs mt-1 mb-2" style={{ color: 'var(--muted)' }}>{isRtl ? metric.labelAr : metric.label}</p>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-medium ${
                  metric.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
                  metric.trend === 'down' ? 'text-red-500 dark:text-red-400' :
                  'text-gray-500 dark:text-white/50'
                }`}>
                  {metric.trend === 'up' && (
                    <svg className="w-3 h-3 inline me-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                  )}
                  {metric.trend === 'down' && (
                    <svg className="w-3 h-3 inline me-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                  )}
                  {metric.change}
                </span>
                <span className="text-xs text-gray-400 dark:text-white/30">{isRtl ? metric.periodAr : metric.period}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Featured Insights */}
        {!hasActiveFilters && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{el.featuredInsights}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredDatasets.map(ds => (
                <div key={ds.id} className="rounded-2xl p-5 theme-panel hover:shadow-lg transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <CategoryBadge category={isRtl ? ds.categoryAr : ds.category} />
                    <span className="ms-auto text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-medium">
                      {el.featuredBadge}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{isRtl ? ds.titleAr : ds.title}</h3>
                  <div className="rounded-lg overflow-hidden bg-gray-50/50 dark:bg-white/[0.02] mb-3">
                    <div className="h-[180px]">
                      <FullChart dataset={ds} chartTypeOverride={ds.chartType} isDark={isDark} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>{isRtl ? ds.unitAr : ds.unit}</span>
                    <button onClick={() => setSelectedDataset(ds)} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      {isRtl ? 'استكشاف البيانات' : 'Explore data'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Dataset Library */}
        <div ref={datasetSectionRef}>
          {/* Filters */}
          <div className="rounded-2xl p-5 theme-panel mb-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t.common.search}</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={el.searchPlaceholder}
                    className="w-full px-3 py-2 ps-9 rounded-xl text-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ color: 'var(--text)' }}
                    dir={isRtl ? 'rtl' : 'ltr'}
                  />
                  <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>

              <MultiSelect label={el.categoryLabel} options={categories} selected={selectedCategories} onChange={setSelectedCategories} locale={locale} />
              <MultiSelect label={el.sourceLabel} options={dataSources} selected={selectedSources} onChange={setSelectedSources} locale={locale} />
              <MultiSelect label={el.frequencyLabel} options={frequencies} selected={selectedFrequencies} onChange={setSelectedFrequencies} locale={locale} />

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{el.sortLabel}</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  style={{ color: 'var(--text)' }}
                >
                  <option value="recent">{el.sortRecent}</option>
                  <option value="records">{el.sortRecords}</option>
                  <option value="alpha">{el.sortAlpha}</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button onClick={clearFilters} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{el.clearFilters}</button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {el.showing.replace('{count}', String(filteredDatasets.length)).replace('{total}', String(allDatasets.length))}
            </p>
          </div>

          {/* Dataset Grid / Loading / Empty */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <DatasetCardSkeleton key={i} />)}
            </div>
          ) : filteredDatasets.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDatasets.map(ds => (
                <DatasetCard key={ds.id} dataset={ds} locale={locale} onView={setSelectedDataset} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl theme-panel">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400 dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <p className="text-gray-600 dark:text-white/60 mb-2">{el.noResults}</p>
              <p className="text-sm text-gray-400 dark:text-white/30 mb-4">{el.noResultsHint}</p>
              <button onClick={clearFilters} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>{el.clearFilters}</button>
            </div>
          )}
        </div>
      </div>

      {/* Dataset Detail Modal */}
      {selectedDataset && (
        <DatasetDetailModal
          dataset={selectedDataset}
          locale={locale}
          isDark={isDark}
          onClose={() => setSelectedDataset(null)}
          relatedDatasets={relatedDatasets}
          onViewRelated={setSelectedDataset}
        />
      )}
    </div>
  )
}
