'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import {
  allReports,
  sectors,
  sectorsAr,
  sectorIcons,
  sectorColors,
  languages,
  languagesAr,
  years,
  type Report,
  type SectorialReport,
} from '@/lib/flagship-reports-data'

// ─── Member Access Guard ────────────────────────────────────────────────────
function MemberAccessGuard({ locale, t }: { locale: string; t: { memberOnly: string; memberOnlyDesc: string; loginAccess: string; becomeMember: string } }) {
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t.memberOnly}</h2>
          <p className="text-gray-600 dark:text-white/60 mb-8">{t.memberOnlyDesc}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors">
              {t.loginAccess}
            </button>
            <button className="px-6 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 font-medium rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors">
              {t.becomeMember}
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

// ─── Sector Badge ───────────────────────────────────────────────────────────
function SectorBadge({ sector, locale }: { sector: string; locale: string }) {
  const isRtl = locale === 'ar'
  const c = sectorColors[sector] || { bg: 'bg-gray-100 dark:bg-white/10', text: 'text-gray-800 dark:text-gray-300', border: 'border-gray-200 dark:border-white/10' }
  const label = isRtl ? (sectorsAr[sector] || sector) : sector
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>{label}</span>
}

// ─── Language Badge ─────────────────────────────────────────────────────────
function LanguageBadge({ language, locale }: { language: string; locale: string }) {
  const isRtl = locale === 'ar'
  const label = isRtl ? (languagesAr[language] || language) : language
  return (
    <span className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 border border-gray-200 dark:border-white/10">
      {label}
    </span>
  )
}

// ─── Report Card Skeleton ───────────────────────────────────────────────────
function ReportCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 theme-panel animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-24" />
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-16" />
      </div>
      <div className="h-5 bg-gray-200 dark:bg-white/10 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-2/3 mb-4" />
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-32" />
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-lg w-24" />
      </div>
    </div>
  )
}

// ─── Flagship Report Card (Premium Horizontal) ─────────────────────────────
function FlagshipReportCard({ report, locale, onView, onDownload }: {
  report: Report
  locale: string
  onView: (r: Report) => void
  onDownload: (r: Report) => void
}) {
  const isRtl = locale === 'ar'
  const title = isRtl ? report.titleAr : report.title
  const summary = isRtl ? report.summaryAr : report.summary
  const edition = isRtl ? report.editionAr : report.edition
  const findings = isRtl ? report.keyFindingsAr : report.keyFindings
  const fl = isRtl
    ? { flagship: 'تقرير رئيسي', pages: 'صفحة', downloads: 'تحميل', read: 'قراءة التقرير' }
    : { flagship: 'ADCCI Flagship', pages: 'pages', downloads: 'downloads', read: 'Read Report' }

  return (
    <div
      className="rounded-2xl theme-panel hover:shadow-xl transition-all group border border-transparent hover:border-amber-300/50 dark:hover:border-amber-500/30 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row">
        {/* Cover Placeholder */}
        <div className="md:w-48 lg:w-56 flex-shrink-0 bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-600/10 dark:from-amber-500/5 dark:via-orange-500/5 dark:to-amber-600/5 flex items-center justify-center p-6 md:p-8">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto text-amber-500/40 dark:text-amber-400/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs text-amber-600/60 dark:text-amber-400/40 font-medium">ADCCI</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {/* Badge Row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
              {fl.flagship}
            </span>
            <LanguageBadge language={report.language} locale={locale} />
            <span className="text-xs text-gray-400 dark:text-white/30">{edition}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </h3>

          {/* Summary */}
          <p className="text-sm text-gray-600 dark:text-white/60 mb-3 line-clamp-3">{summary}</p>

          {/* Key Findings Preview */}
          {findings.length > 0 && (
            <div className="mb-4">
              <ul className="space-y-1">
                {findings.slice(0, 2).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-white/50">
                    <svg className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                    <span className="line-clamp-1">{f}</span>
                  </li>
                ))}
              </ul>
              {findings.length > 2 && (
                <span className="text-xs text-gray-400 dark:text-white/30 ms-6">
                  +{findings.length - 2} {isRtl ? 'المزيد' : 'more'}
                </span>
              )}
            </div>
          )}

          {/* Metadata + Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-white/30">
              <span>{report.pageCount} {fl.pages}</span>
              <span>&middot;</span>
              <span>{report.fileSize}</span>
              <span>&middot;</span>
              <span>{report.downloads.toLocaleString()} {fl.downloads}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onDownload(report) }}
                className="p-2 rounded-lg text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                title={isRtl ? 'تحميل' : 'Download'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button
                onClick={() => onView(report)}
                className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {fl.read}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sectorial Report Card (Standard Grid) ──────────────────────────────────
function SectorialReportCard({ report, locale, onView, onDownload }: {
  report: SectorialReport
  locale: string
  onView: (r: Report) => void
  onDownload: (r: Report) => void
}) {
  const isRtl = locale === 'ar'
  const title = isRtl ? report.titleAr : report.title
  const summary = isRtl ? report.summaryAr : report.summary
  const edition = isRtl ? report.editionAr : report.edition
  const fl = isRtl
    ? { adcci: 'غرفة أبوظبي', findings: 'نتائج رئيسية', pages: 'صفحة', view: 'عرض التفاصيل' }
    : { adcci: 'ADCCI Authored', findings: 'Key Findings', pages: 'pages', view: 'View Details' }

  return (
    <button
      onClick={() => onView(report)}
      className="text-start rounded-2xl p-6 theme-panel hover:shadow-lg transition-all group w-full"
    >
      {/* Badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <SectorBadge sector={report.sector} locale={locale} />
        <LanguageBadge language={report.language} locale={locale} />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {title}
      </h3>

      {/* Edition */}
      <p className="text-xs text-gray-400 dark:text-white/30 mb-2">{edition}</p>

      {/* Summary */}
      <p className="text-sm text-gray-600 dark:text-white/50 mb-3 line-clamp-2">{summary}</p>

      {/* ADCCI badge + Findings Count */}
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 font-medium">
          {fl.adcci}
        </span>
        <span className="text-xs text-gray-400 dark:text-white/30">
          {report.keyFindings.length} {fl.findings}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/30">
          <span>{report.pageCount} {fl.pages}</span>
          <span>&middot;</span>
          <span>{report.fileSize}</span>
          <span>&middot;</span>
          <span>{report.downloads.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <span
            onClick={(e) => { e.stopPropagation(); onDownload(report) }}
            className="p-1.5 rounded-lg text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </span>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
            {fl.view}
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── Report Detail Modal ────────────────────────────────────────────────────
function ReportDetailModal({ report, locale, onClose, onViewRelated, onDownload, relatedReports }: {
  report: Report
  locale: string
  onClose: () => void
  onViewRelated: (r: Report) => void
  onDownload: (r: Report) => void
  relatedReports: Report[]
}) {
  const isRtl = locale === 'ar'
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleEsc) }
  }, [onClose])

  const title = isRtl ? report.titleAr : report.title
  const summary = isRtl ? report.summaryAr : report.summary
  const edition = isRtl ? report.editionAr : report.edition
  const findings = isRtl ? report.keyFindingsAr : report.keyFindings
  const tags = isRtl ? report.tagsAr : report.tags
  const isSectorial = report.type === 'Sectorial'

  const handleShare = () => {
    const url = `${window.location.origin}/services/flagship-reports?report=${report.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const fl = isRtl
    ? { flagship: 'تقرير رئيسي', sectorial: 'تقرير قطاعي', summary: 'الملخص', findings: 'النتائج الرئيسية', tags: 'الكلمات المفتاحية', download: 'تحميل التقرير', share: 'مشاركة الرابط', copied: 'تم النسخ!', related: 'تقارير ذات صلة', pages: 'صفحة', downloads: 'تحميل' }
    : { flagship: 'ADCCI Flagship', sectorial: 'Sectorial Report', summary: 'Summary', findings: 'Key Findings', tags: 'Tags', download: 'Download Report', share: 'Share Link', copied: 'Copied!', related: 'Related Reports', pages: 'pages', downloads: 'downloads' }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] pb-[5vh]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-10 p-2 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {isSectorial ? (
              <SectorBadge sector={(report as SectorialReport).sector} locale={locale} />
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                {fl.flagship}
              </span>
            )}
            <LanguageBadge language={report.language} locale={locale} />
            <span className="px-2 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 font-medium">
              {isRtl ? 'غرفة أبوظبي' : 'ADCCI Authored'}
            </span>
          </div>

          {/* Title + Edition */}
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{title}</h2>
          <p className="text-sm text-gray-400 dark:text-white/30 mb-4">{edition}</p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-white/40 mb-6">
            <span>{new Date(report.publishedDate).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>&middot;</span>
            <span>{report.pageCount} {fl.pages}</span>
            <span>&middot;</span>
            <span>{report.fileSize}</span>
            <span>&middot;</span>
            <span>{report.downloads.toLocaleString()} {fl.downloads}</span>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{fl.summary}</h3>
            <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed">{summary}</p>
          </div>

          {/* Key Findings */}
          {findings.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">{fl.findings}</h3>
              <div className="space-y-2">
                {findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-gray-700 dark:text-white/70 leading-relaxed">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{fl.tags}</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg text-xs bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/50 border border-gray-200 dark:border-white/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => onDownload(report)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {fl.download}
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 font-medium rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors text-sm"
            >
              {copied ? fl.copied : fl.share}
            </button>
          </div>

          {/* Related Reports */}
          {relatedReports.length > 0 && (
            <div className="pt-6 border-t border-gray-200 dark:border-white/10">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">{fl.related}</h3>
              <div className="space-y-3">
                {relatedReports.map((related) => (
                  <button
                    key={related.id}
                    onClick={() => onViewRelated(related)}
                    className="w-full text-start flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {isRtl ? related.titleAr : related.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-white/40">
                        {related.type === 'Sectorial' ? (isRtl ? (related as SectorialReport).sectorAr : (related as SectorialReport).sector) : (isRtl ? 'تقرير رئيسي' : 'Flagship')}
                        {' '}&middot;{' '}
                        {new Date(related.publishedDate).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { year: 'numeric', month: 'short' })}
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

// ─── Sector Navigator ───────────────────────────────────────────────────────
function SectorNavigator({ selectedSector, onSelect, locale, sectorCounts }: {
  selectedSector: string
  onSelect: (s: string) => void
  locale: string
  sectorCounts: Record<string, number>
}) {
  const isRtl = locale === 'ar'
  const fl = isRtl
    ? { title: 'استكشف حسب القطاع', all: 'جميع القطاعات', reports: 'تقارير' }
    : { title: 'Explore by Sector', all: 'All Sectors', reports: 'reports' }

  return (
    <div className="rounded-2xl theme-panel p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{fl.title}</h2>
        {selectedSector && (
          <button
            onClick={() => onSelect('')}
            className="text-xs font-medium"
            style={{ color: 'var(--primary)' }}
          >
            {fl.all}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {sectors.map((sector) => {
          const isActive = selectedSector === sector
          const c = sectorColors[sector]
          const count = sectorCounts[sector] || 0
          return (
            <button
              key={sector}
              onClick={() => onSelect(isActive ? '' : sector)}
              className={`p-3 rounded-xl text-center transition-all border ${
                isActive
                  ? `${c?.bg} ${c?.text} ${c?.border}`
                  : 'bg-white/50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="text-xl mb-1">{sectorIcons[sector]}</div>
              <p className={`text-xs font-medium mb-0.5 line-clamp-1 ${isActive ? '' : 'text-gray-700 dark:text-white/70'}`}>
                {isRtl ? (sectorsAr[sector] || sector) : sector}
              </p>
              <p className={`text-xs ${isActive ? 'opacity-70' : 'text-gray-400 dark:text-white/30'}`}>
                {count} {fl.reports}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function FlagshipReportsPage() {
  const { locale, t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRtl = locale === 'ar'
  const fl = t.flagshipReports
  const isMember = true

  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  const [selectedSector, setSelectedSector] = useState(searchParams.get('sector') || '')
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || '')
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)

  const sectorialSectionRef = useRef<HTMLDivElement>(null)

  // Loading simulation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Open report from URL
  useEffect(() => {
    const reportId = searchParams.get('report')
    if (reportId && !loading) {
      const found = allReports.find(r => r.id === reportId)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (found) setSelectedReport(found)
    }
  }, [searchParams, loading])

  // URL sync
  useEffect(() => {
    if (loading) return
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('q', debouncedSearch)
    if (selectedSector) params.set('sector', selectedSector)
    if (selectedLanguage) params.set('language', selectedLanguage)
    if (selectedYear) params.set('year', selectedYear)
    if (sortBy !== 'newest') params.set('sort', sortBy)
    if (selectedReport) params.set('report', selectedReport.id)
    const paramString = params.toString()
    const newUrl = paramString ? `?${paramString}` : '/services/flagship-reports'
    router.replace(newUrl, { scroll: false })
  }, [debouncedSearch, selectedSector, selectedLanguage, selectedYear, sortBy, selectedReport, loading, router])

  // Sector counts
  const sectorCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allReports.filter(r => r.type === 'Sectorial').forEach(r => {
      const s = (r as SectorialReport).sector
      counts[s] = (counts[s] || 0) + 1
    })
    return counts
  }, [])

  // Filtered flagship reports (only by search)
  const displayedFlagshipReports = useMemo(() => {
    const flagships = allReports.filter(r => r.type === 'Flagship')
    if (!debouncedSearch) return flagships
    const q = debouncedSearch.toLowerCase()
    return flagships.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.titleAr.includes(q) ||
      r.summary.toLowerCase().includes(q) ||
      r.summaryAr.includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q)) ||
      r.tagsAr.some(t => t.includes(q))
    )
  }, [debouncedSearch])

  // Filtered sectorial reports
  const filteredSectorialReports = useMemo(() => {
    let results = allReports.filter(r => r.type === 'Sectorial') as SectorialReport[]

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      results = results.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.titleAr.includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.summaryAr.includes(q) ||
        r.sector.toLowerCase().includes(q) ||
        r.sectorAr.includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q)) ||
        r.tagsAr.some(t => t.includes(q))
      )
    }

    if (selectedSector) {
      results = results.filter(r => r.sector === selectedSector)
    }

    if (selectedLanguage) {
      results = results.filter(r => r.language === selectedLanguage)
    }

    if (selectedYear) {
      results = results.filter(r => r.publishedDate.startsWith(selectedYear))
    }

    switch (sortBy) {
      case 'oldest':
        results.sort((a, b) => new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime())
        break
      case 'mostDownloaded':
        results.sort((a, b) => b.downloads - a.downloads)
        break
      case 'newest':
      default:
        results.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
        break
    }

    return results
  }, [debouncedSearch, selectedSector, selectedLanguage, selectedYear, sortBy])

  const totalSectorial = allReports.filter(r => r.type === 'Sectorial').length
  const hasActiveFilters = debouncedSearch || selectedSector || selectedLanguage || selectedYear

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setDebouncedSearch('')
    setSelectedSector('')
    setSelectedLanguage('')
    setSelectedYear('')
    setSortBy('newest')
  }, [])

  const handleDownload = useCallback((report: Report) => {
    console.log(`[Flagship Reports] Download triggered: "${report.title}" (${report.fileSize})`)
    console.log(`[Flagship Reports] URL: ${report.downloadUrl}`)
  }, [])

  const handleSectorSelect = useCallback((sector: string) => {
    setSelectedSector(sector)
    if (sector) {
      setTimeout(() => sectorialSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [])

  // Related reports
  const relatedReports = useMemo(() => {
    if (!selectedReport) return []
    if (selectedReport.type === 'Sectorial') {
      return allReports
        .filter(r => r.id !== selectedReport.id && r.type === 'Sectorial' && (r as SectorialReport).sector === (selectedReport as SectorialReport).sector)
        .slice(0, 3)
    }
    return allReports
      .filter(r => r.id !== selectedReport.id && r.type === 'Flagship')
      .slice(0, 3)
  }, [selectedReport])

  // Guard - must be after all hooks
  if (!isMember) return <MemberAccessGuard locale={locale} t={fl} />

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-[#000C14] dark:via-[#001520] dark:to-[#001B30] ${isRtl ? 'rtl' : 'ltr'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
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
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  {fl.title}
                </h1>
              </div>
              <p className="text-gray-600 dark:text-white/60 max-w-2xl mb-3">{fl.subtitle}</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                {fl.officialBadge}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30">
                {allReports.length} {fl.reportsCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Flagship Reports Section */}
        {displayedFlagshipReports.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{fl.flagshipSection}</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                {displayedFlagshipReports.length}
              </span>
            </div>
            <div className="space-y-4">
              {displayedFlagshipReports.map((report) => (
                <FlagshipReportCard
                  key={report.id}
                  report={report}
                  locale={locale}
                  onView={setSelectedReport}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </section>
        )}

        {/* Sector Navigator */}
        {!debouncedSearch && (
          <SectorNavigator
            selectedSector={selectedSector}
            onSelect={handleSectorSelect}
            locale={locale}
            sectorCounts={sectorCounts}
          />
        )}

        {/* Sectorial Reports Section */}
        <div ref={sectorialSectionRef}>
          {/* Section Title */}
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{fl.sectorialSection}</h2>
          </div>

          {/* Filter Bar */}
          <div className="rounded-2xl theme-panel p-5 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {isRtl ? 'بحث' : 'Search'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={fl.searchPlaceholder}
                    className="w-full px-3 py-2 ps-9 rounded-xl text-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ color: 'var(--text)' }}
                    dir={isRtl ? 'rtl' : 'ltr'}
                  />
                  <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {fl.languageLabel}
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">{fl.allLanguages}</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>{isRtl ? (languagesAr[lang] || lang) : lang}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {fl.yearLabel}
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">{fl.allYears}</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {fl.sortLabel}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="newest">{fl.sortNewest}</option>
                  <option value="oldest">{fl.sortOldest}</option>
                  <option value="mostDownloaded">{fl.sortMostDownloaded}</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button onClick={clearFilters} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                  {fl.clearFilters}
                </button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {fl.showing.replace('{count}', String(filteredSectorialReports.length)).replace('{total}', String(totalSectorial))}
            </p>
          </div>

          {/* Sectorial Reports Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <ReportCardSkeleton key={i} />)}
            </div>
          ) : filteredSectorialReports.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSectorialReports.map((report) => (
                <SectorialReportCard
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
              <p className="text-gray-600 dark:text-white/60 mb-2">{fl.noResults}</p>
              <p className="text-sm text-gray-400 dark:text-white/30 mb-4">{fl.noResultsHint}</p>
              <button onClick={clearFilters} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                {fl.clearFilters}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          locale={locale}
          onClose={() => setSelectedReport(null)}
          onViewRelated={setSelectedReport}
          onDownload={handleDownload}
          relatedReports={relatedReports}
        />
      )}
    </div>
  )
}
