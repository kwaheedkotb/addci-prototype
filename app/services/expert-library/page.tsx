'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import {
  reports as allReports,
  categories,
  categoriesAr,
  institutions,
  institutionColors,
  type Report,
} from '@/lib/expert-library-data'

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
              ? 'مكتبة الخبراء متاحة حصرياً لأعضاء غرفة أبوظبي. سجّل الدخول أو انضم للوصول إلى تقارير استخبارات السوق.'
              : 'The Expert Library is exclusively available to Abu Dhabi Chamber members. Log in or become a member to access market intelligence reports.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
              {isRtl ? 'تسجيل الدخول' : 'Login to Access'}
            </button>
            <button className="px-6 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 font-medium rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors">
              {isRtl ? 'انضم كعضو' : 'Become a Member'}
            </button>
          </div>
          <Link
            href="/services"
            className="inline-flex items-center mt-6 text-sm text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60 transition-colors"
          >
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

// ─── Institution Avatar ─────────────────────────────────────────────────────
function InstitutionAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const colors = institutionColors[name] || { bg: 'bg-gray-500', text: 'text-white' }
  const initials = name.split(/[\s&]+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sizeClasses} ${colors.bg} ${colors.text} rounded-lg flex items-center justify-center font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ─── Category Badge ─────────────────────────────────────────────────────────
const categoryColorMap: Record<string, string> = {
  Macroeconomics: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  'Real Estate': 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
  Energy: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  Technology: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
  'Trade & Investment': 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  'SME & Entrepreneurship': 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
}

function CategoryBadge({ category }: { category: string }) {
  const color = categoryColorMap[category] || 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-white/10'
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {category}
    </span>
  )
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────
function ReportCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 theme-panel animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-full mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-2/3 mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-16" />
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-12" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-24" />
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-lg w-20" />
      </div>
    </div>
  )
}

// ─── Report Card ────────────────────────────────────────────────────────────
function ReportCard({ report, locale, onView, onDownload }: {
  report: Report
  locale: string
  onView: (r: Report) => void
  onDownload: (r: Report) => void
}) {
  const isRtl = locale === 'ar'
  const title = isRtl ? report.titleAr : report.title
  const desc = isRtl ? report.descriptionAr : report.description
  const institution = isRtl ? report.institutionAr : report.institution
  const category = isRtl ? report.categoryAr : report.category
  const tags = isRtl ? report.tagsAr : report.tags
  const visibleTags = tags.slice(0, 2)
  const extraTags = tags.length - 2

  return (
    <div className="rounded-2xl p-6 theme-panel hover:shadow-lg transition-all group">
      {/* Header: Institution + Category */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <InstitutionAvatar name={report.institution} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{institution}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {new Date(report.publishedDate).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
        <CategoryBadge category={category} />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--muted)' }}>
        {desc}
      </p>

      {/* Tags */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {visibleTags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 text-xs rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/50 border border-gray-200 dark:border-white/10">
            {tag}
          </span>
        ))}
        {extraTags > 0 && (
          <span className="text-xs" style={{ color: 'var(--muted)' }}>+{extraTags}</span>
        )}
      </div>

      {/* Footer: Meta + Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {report.pageCount} {isRtl ? 'صفحة' : 'pages'}
          </span>
          <span>{report.fileSize}</span>
          {report.language !== 'English' && (
            <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 border border-gray-200 dark:border-white/10">
              {report.language === 'Arabic' ? (isRtl ? 'عربي' : 'AR') : (isRtl ? 'ثنائي اللغة' : 'Bilingual')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onDownload(report)}
            className="p-2 rounded-lg text-gray-400 dark:text-white/30 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
            title={isRtl ? 'تحميل' : 'Download'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button
            onClick={() => onView(report)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            {isRtl ? 'عرض' : 'View'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Report Detail Modal ────────────────────────────────────────────────────
function ReportDetailModal({ report, locale, onClose, onDownload, relatedReports, onViewRelated }: {
  report: Report
  locale: string
  onClose: () => void
  onDownload: (r: Report) => void
  relatedReports: Report[]
  onViewRelated: (r: Report) => void
}) {
  const isRtl = locale === 'ar'
  const title = isRtl ? report.titleAr : report.title
  const desc = isRtl ? report.descriptionAr : report.description
  const institution = isRtl ? report.institutionAr : report.institution
  const category = isRtl ? report.categoryAr : report.category
  const tags = isRtl ? report.tagsAr : report.tags
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])

  const handleShare = () => {
    const url = `${window.location.origin}/services/expert-library?report=${report.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] pb-[5vh]" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#071824] border border-gray-200 dark:border-white/10 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-10 p-2 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <InstitutionAvatar name={report.institution} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 dark:text-white/50 mb-1">{institution}</p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            </div>
          </div>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <CategoryBadge category={category} />
            <span className="text-sm text-gray-500 dark:text-white/40">
              {new Date(report.publishedDate).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="text-sm text-gray-500 dark:text-white/40">
              {report.pageCount} {isRtl ? 'صفحة' : 'pages'} &middot; {report.fileSize}
            </span>
            {report.language !== 'English' && (
              <span className="text-sm px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 border border-gray-200 dark:border-white/10">
                {report.language === 'Arabic' ? (isRtl ? 'عربي' : 'Arabic') : (isRtl ? 'ثنائي اللغة' : 'Bilingual')}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{isRtl ? 'الوصف' : 'Description'}</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-white/60">{desc}</p>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{isRtl ? 'الكلمات المفتاحية' : 'Tags'}</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/50 border border-gray-200 dark:border-white/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={() => onDownload(report)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isRtl ? 'تحميل التقرير' : 'Download Report'}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 font-medium rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {copied ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'مشاركة الرابط' : 'Share Link')}
            </button>
          </div>

          {/* Related Reports */}
          {relatedReports.length > 0 && (
            <div className="pt-6 border-t border-gray-200 dark:border-white/10">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                {isRtl ? 'تقارير ذات صلة' : 'Related Reports'}
              </h3>
              <div className="space-y-3">
                {relatedReports.map((related) => (
                  <button
                    key={related.id}
                    onClick={() => onViewRelated(related)}
                    className="w-full text-start flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <InstitutionAvatar name={related.institution} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {isRtl ? related.titleAr : related.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-white/40">
                        {isRtl ? related.institutionAr : related.institution} &middot; {new Date(related.publishedDate).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { year: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-400 dark:text-white/30 rtl:rotate-180 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
        <svg className={`w-4 h-4 ms-2 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-xl bg-white dark:bg-[#0a2236] border border-gray-200 dark:border-white/10 shadow-lg max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-start"
            >
              <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                selected.includes(opt)
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-300 dark:border-white/20'
              }`}>
                {selected.includes(opt) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
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
export default function ExpertLibraryPage() {
  const { locale, t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRtl = locale === 'ar'

  // Simulated member state — always true for prototype
  const isMember = true

  // State from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('categories')?.split(',').filter(Boolean) || []
  )
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>(
    searchParams.get('institutions')?.split(',').filter(Boolean) || []
  )
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
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

  // Open report from URL param
  useEffect(() => {
    const reportId = searchParams.get('report')
    if (reportId && !loading) {
      const found = allReports.find(r => r.id === reportId)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (found) setSelectedReport(found)
    }
  }, [searchParams, loading])

  // Sync filters to URL
  useEffect(() => {
    if (loading) return
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('q', debouncedSearch)
    if (selectedCategories.length) params.set('categories', selectedCategories.join(','))
    if (selectedInstitutions.length) params.set('institutions', selectedInstitutions.join(','))
    if (selectedLanguage) params.set('language', selectedLanguage)
    if (sortBy && sortBy !== 'newest') params.set('sort', sortBy)
    if (selectedReport) params.set('report', selectedReport.id)

    const paramString = params.toString()
    const newUrl = paramString ? `?${paramString}` : '/services/expert-library'
    router.replace(newUrl, { scroll: false })
  }, [debouncedSearch, selectedCategories, selectedInstitutions, selectedLanguage, sortBy, selectedReport, loading, router])

  // Filter & sort
  const filteredReports = useMemo(() => {
    let results = [...allReports]

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      results = results.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.titleAr.includes(q) ||
        r.institution.toLowerCase().includes(q) ||
        r.institutionAr.includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.descriptionAr.includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q)) ||
        r.tagsAr.some(t => t.includes(q))
      )
    }

    // Category filter
    if (selectedCategories.length > 0) {
      results = results.filter(r => selectedCategories.includes(r.category))
    }

    // Institution filter
    if (selectedInstitutions.length > 0) {
      results = results.filter(r => selectedInstitutions.includes(r.institution))
    }

    // Language filter
    if (selectedLanguage) {
      results = results.filter(r => r.language === selectedLanguage)
    }

    // Sort
    switch (sortBy) {
      case 'oldest':
        results.sort((a, b) => new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime())
        break
      case 'newest':
      default:
        results.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
        break
    }

    return results
  }, [debouncedSearch, selectedCategories, selectedInstitutions, selectedLanguage, sortBy])

  const featuredReports = useMemo(() => allReports.filter(r => r.isFeatured), [])

  const hasActiveFilters = debouncedSearch || selectedCategories.length > 0 || selectedInstitutions.length > 0 || selectedLanguage

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setDebouncedSearch('')
    setSelectedCategories([])
    setSelectedInstitutions([])
    setSelectedLanguage('')
    setSortBy('newest')
  }, [])

  const handleDownload = useCallback((report: Report) => {
    console.log(`[Expert Library] Download triggered: "${report.title}" (${report.fileSize})`)
    console.log(`[Expert Library] URL: ${report.downloadUrl}`)
  }, [])

  const relatedReports = useMemo(() => {
    if (!selectedReport) return []
    return allReports
      .filter(r => r.id !== selectedReport.id && r.category === selectedReport.category)
      .slice(0, 3)
  }, [selectedReport])

  if (!isMember) {
    return <MemberAccessGuard locale={locale} />
  }

  const el = t.expertLibrary

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-[#000C14] dark:via-[#001520] dark:to-[#001B30] ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 relative">
          <Link
            href="/services"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-white/50 dark:hover:text-white/80 mb-8 transition-colors text-sm"
          >
            <svg className="w-4 h-4 me-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t.services.backToDirectory}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {el.title}
              </h1>
              <p className="text-gray-600 dark:text-white/60 max-w-2xl">
                {el.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                {allReports.length} {el.reportsLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Featured Reports */}
        {!hasActiveFilters && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{el.featured}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {featuredReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="text-start p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/10 border border-blue-200/50 dark:border-blue-700/30 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <InstitutionAvatar name={report.institution} size="sm" />
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{isRtl ? report.institutionAr : report.institution}</span>
                    <span className="ms-auto text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-medium">
                      {el.featuredBadge}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {isRtl ? report.titleAr : report.title}
                  </h3>
                  <p className="text-xs line-clamp-2 text-gray-500 dark:text-white/40">
                    {isRtl ? report.descriptionAr : report.description}
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="rounded-2xl p-5 theme-panel mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t.common.search}
              </label>
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
                <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category */}
            <MultiSelect
              label={el.categoryLabel}
              options={categories}
              selected={selectedCategories}
              onChange={setSelectedCategories}
              locale={locale}
            />

            {/* Institution */}
            <MultiSelect
              label={el.institutionLabel}
              options={institutions}
              selected={selectedInstitutions}
              onChange={setSelectedInstitutions}
              locale={locale}
            />

            {/* Language + Sort */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{el.languageLabel}</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  style={{ color: 'var(--text)' }}
                >
                  <option value="">{isRtl ? 'الكل' : 'All'}</option>
                  <option value="English">{isRtl ? 'إنجليزي' : 'English'}</option>
                  <option value="Arabic">{isRtl ? 'عربي' : 'Arabic'}</option>
                  <option value="Bilingual">{isRtl ? 'ثنائي' : 'Bilingual'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{el.sortLabel}</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  style={{ color: 'var(--text)' }}
                >
                  <option value="newest">{el.sortNewest}</option>
                  <option value="oldest">{el.sortOldest}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={clearFilters} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                {el.clearFilters}
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {el.showing
              .replace('{count}', String(filteredReports.length))
              .replace('{total}', String(allReports.length))}
          </p>
        </div>

        {/* Report Grid / Loading / Empty */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ReportCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                locale={locale}
                onView={setSelectedReport}
                onDownload={handleDownload}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl theme-panel">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-white/60 mb-2">{el.noResults}</p>
            <p className="text-sm text-gray-400 dark:text-white/30 mb-4">{el.noResultsHint}</p>
            <button onClick={clearFilters} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
              {el.clearFilters}
            </button>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          locale={locale}
          onClose={() => setSelectedReport(null)}
          onDownload={handleDownload}
          relatedReports={relatedReports}
          onViewRelated={setSelectedReport}
        />
      )}
    </div>
  )
}
