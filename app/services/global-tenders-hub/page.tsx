'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import {
  tenders as allTenders,
  sectors,
  sectorsAr,
  regions,
  regionsAr,
  tenderTypes,
  tenderTypesAr,
  organizationColors,
  countryFlags,
  type Tender,
} from '@/lib/global-tenders-data'

// ─── Helpers ────────────────────────────────────────────────────────────────
function daysUntil(deadline: string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const dl = new Date(deadline)
  dl.setHours(0, 0, 0, 0)
  return Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatCountdown(days: number, isRtl: boolean): string {
  if (days < 0) return isRtl ? 'انتهى' : 'Expired'
  if (days === 0) return isRtl ? 'اليوم' : 'Today'
  if (days === 1) return isRtl ? 'غداً' : 'Tomorrow'
  return isRtl ? `${days} يوم` : `${days} days`
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
              ? 'مركز المناقصات العالمية متاح حصرياً لأعضاء غرفة أبوظبي. سجّل الدخول أو انضم للوصول إلى فرص المناقصات الدولية.'
              : 'The Global Tenders Hub is exclusively available to Abu Dhabi Chamber members. Log in or become a member to access international tender opportunities.'}
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

// ─── Organization Avatar ────────────────────────────────────────────────────
function OrgAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const colors = organizationColors[name] || { bg: 'bg-gray-500', text: 'text-white' }
  const initials = name.split(/[\s&]+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sizeClasses = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sizeClasses} ${colors.bg} ${colors.text} rounded-lg flex items-center justify-center font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ─── Status Badge ───────────────────────────────────────────────────────────
const statusColorMap: Record<string, string> = {
  Open: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  'Closing Soon': 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  Closed: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10',
}

function StatusBadge({ status }: { status: string }) {
  const color = statusColorMap[status] || statusColorMap.Open
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {status}
    </span>
  )
}

// ─── Sector Badge ───────────────────────────────────────────────────────────
const sectorColorMap: Record<string, string> = {
  Infrastructure: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  Technology: 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
  Energy: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  Healthcare: 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
  Logistics: 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
  Construction: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  Consulting: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
  Education: 'bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-500/30',
}

function SectorBadge({ sector }: { sector: string }) {
  const color = sectorColorMap[sector] || 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-white/10'
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {sector}
    </span>
  )
}

// ─── Skeleton Loader ────────────────────────────────────────────────────────
function TenderCardSkeleton() {
  return (
    <div className="rounded-2xl p-6 theme-panel animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div>
            <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-20" />
          </div>
        </div>
        <div className="h-5 bg-gray-200 dark:bg-white/10 rounded-full w-16" />
      </div>
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-full mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-3/4 mb-4" />
      <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-full mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-2/3 mb-4" />
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
        <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-24" />
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-lg w-24" />
      </div>
    </div>
  )
}

// ─── Tender Card ────────────────────────────────────────────────────────────
function TenderCard({ tender, locale, onView, onSave, isSaved }: {
  tender: Tender
  locale: string
  onView: (t: Tender) => void
  onSave: (id: string) => void
  isSaved: boolean
}) {
  const isRtl = locale === 'ar'
  const title = isRtl ? tender.titleAr : tender.title
  const desc = isRtl ? tender.descriptionAr : tender.description
  const org = isRtl ? tender.issuingOrganizationAr : tender.issuingOrganization
  const sector = isRtl ? (sectorsAr[tender.sector] || tender.sector) : tender.sector
  const country = isRtl ? tender.countryAr : tender.country
  const flag = countryFlags[tender.country] || ''
  const days = daysUntil(tender.deadline)
  const isUrgent = tender.status === 'Closing Soon'
  const isClosed = tender.status === 'Closed'

  return (
    <div className={`rounded-2xl p-6 theme-panel hover:shadow-lg transition-all group ${isClosed ? 'opacity-70' : ''}`}>
      {/* Header: Org + Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <OrgAvatar name={tender.issuingOrganization} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{org}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {flag} {country} &middot; {tender.referenceNumber}
            </p>
          </div>
        </div>
        <StatusBadge status={tender.status} />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--muted)' }}>
        {desc}
      </p>

      {/* Tags Row: Sector + Type */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        <SectorBadge sector={sector} />
        <span className="px-2 py-0.5 text-xs rounded-md bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/50 border border-gray-200 dark:border-white/10">
          {isRtl ? (tenderTypesAr[tender.tenderType] || tender.tenderType) : tender.tenderType}
        </span>
      </div>

      {/* Footer: Deadline + Value + Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
          {/* Deadline with countdown */}
          <span className={`flex items-center gap-1 ${isUrgent ? 'text-amber-600 dark:text-amber-400 font-medium' : ''}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {isClosed
              ? (isRtl ? 'مغلق' : 'Closed')
              : formatCountdown(days, isRtl)}
          </span>
          <span>{tender.estimatedValue}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onSave(tender.id) }}
            className={`p-2 rounded-lg transition-colors ${
              isSaved
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                : 'text-gray-400 dark:text-white/30 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10'
            }`}
            title={isRtl ? (isSaved ? 'إزالة من المحفوظات' : 'حفظ') : (isSaved ? 'Remove from saved' : 'Save')}
          >
            <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button
            onClick={() => onView(tender)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            {isRtl ? 'عرض' : 'View'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tender Detail Modal ────────────────────────────────────────────────────
function TenderDetailModal({ tender, locale, onClose, onSave, isSaved, relatedTenders, onViewRelated }: {
  tender: Tender
  locale: string
  onClose: () => void
  onSave: (id: string) => void
  isSaved: boolean
  relatedTenders: Tender[]
  onViewRelated: (t: Tender) => void
}) {
  const isRtl = locale === 'ar'
  const title = isRtl ? tender.titleAr : tender.title
  const desc = isRtl ? tender.descriptionAr : tender.description
  const org = isRtl ? tender.issuingOrganizationAr : tender.issuingOrganization
  const sector = isRtl ? (sectorsAr[tender.sector] || tender.sector) : tender.sector
  const region = isRtl ? (regionsAr[tender.region] || tender.region) : tender.region
  const country = isRtl ? tender.countryAr : tender.country
  const tenderType = isRtl ? (tenderTypesAr[tender.tenderType] || tender.tenderType) : tender.tenderType
  const requirements = isRtl ? tender.requirementsAr : tender.requirements
  const submissionMethod = isRtl ? tender.submissionMethodAr : tender.submissionMethod
  const tags = isRtl ? tender.tagsAr : tender.tags
  const flag = countryFlags[tender.country] || ''
  const days = daysUntil(tender.deadline)
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
    const url = `${window.location.origin}/services/global-tenders-hub?tender=${tender.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] pb-[5vh]" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
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
          <div className="flex items-start gap-4 mb-4">
            <OrgAvatar name={tender.issuingOrganization} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 dark:text-white/50 mb-1">{org}</p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            </div>
          </div>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <StatusBadge status={tender.status} />
            <SectorBadge sector={sector} />
            <span className="text-sm text-gray-500 dark:text-white/40">
              {flag} {country} &middot; {region}
            </span>
          </div>

          {/* Deadline & Value Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
              <p className="text-xs text-gray-500 dark:text-white/40 mb-1">{isRtl ? 'الموعد النهائي' : 'Deadline'}</p>
              <p className={`text-sm font-medium ${days <= 7 && days >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
                {new Date(tender.deadline).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
              <p className="text-xs text-gray-500 dark:text-white/40 mb-1">{isRtl ? 'القيمة التقديرية' : 'Est. Value'}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{tender.estimatedValue}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
              <p className="text-xs text-gray-500 dark:text-white/40 mb-1">{isRtl ? 'النوع' : 'Type'}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{tenderType}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
              <p className="text-xs text-gray-500 dark:text-white/40 mb-1">{isRtl ? 'طريقة التقديم' : 'Submission'}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{submissionMethod}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{isRtl ? 'الوصف' : 'Description'}</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-white/60">{desc}</p>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{isRtl ? 'المتطلبات' : 'Requirements'}</h3>
            <ul className="space-y-2">
              {requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-white/60">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Reference & Tags */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 dark:text-white/40 mb-2">
              {isRtl ? 'الرقم المرجعي' : 'Reference'}: <span className="font-mono text-gray-700 dark:text-white/60">{tender.referenceNumber}</span>
            </p>
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
              onClick={() => {
                console.log(`[Tenders] Download tender document: "${tender.title}" (${tender.referenceNumber})`)
                console.log(`[Tenders] URL: ${tender.documentUrl}`)
              }}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isRtl ? 'تحميل وثائق المناقصة' : 'Download Tender Documents'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onSave(tender.id) }}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                isSaved
                  ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300'
                  : 'bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 hover:bg-white dark:hover:bg-white/10'
              }`}
            >
              <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {isSaved ? (isRtl ? 'تم الحفظ' : 'Saved') : (isRtl ? 'حفظ المناقصة' : 'Save Tender')}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/70 font-medium rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {copied ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'مشاركة' : 'Share')}
            </button>
          </div>

          {/* Related Tenders */}
          {relatedTenders.length > 0 && (
            <div className="pt-6 border-t border-gray-200 dark:border-white/10">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                {isRtl ? 'مناقصات ذات صلة' : 'Related Tenders'}
              </h3>
              <div className="space-y-3">
                {relatedTenders.map((related) => (
                  <button
                    key={related.id}
                    onClick={() => onViewRelated(related)}
                    className="w-full text-start flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    <OrgAvatar name={related.issuingOrganization} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {isRtl ? related.titleAr : related.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-white/40">
                        {isRtl ? related.issuingOrganizationAr : related.issuingOrganization} &middot; {related.estimatedValue}
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
export default function GlobalTendersHubPage() {
  const { locale, t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRtl = locale === 'ar'

  const isMember = true

  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  const [selectedSectors, setSelectedSectors] = useState<string[]>(
    searchParams.get('sectors')?.split(',').filter(Boolean) || []
  )
  const [selectedRegions, setSelectedRegions] = useState<string[]>(
    searchParams.get('regions')?.split(',').filter(Boolean) || []
  )
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get('types')?.split(',').filter(Boolean) || []
  )
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    searchParams.get('statuses')?.split(',').filter(Boolean) || []
  )
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'deadline')
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [savedTenderIds, setSavedTenderIds] = useState<string[]>([])
  const [bannerDismissed, setBannerDismissed] = useState(false)

  // Load saved tenders from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedTenders')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setSavedTenderIds(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

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

  // Open tender from URL param
  useEffect(() => {
    const tenderId = searchParams.get('tender')
    if (tenderId && !loading) {
      const found = allTenders.find(t => t.id === tenderId)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (found) setSelectedTender(found)
    }
  }, [searchParams, loading])

  // Sync filters to URL
  useEffect(() => {
    if (loading) return
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('q', debouncedSearch)
    if (selectedSectors.length) params.set('sectors', selectedSectors.join(','))
    if (selectedRegions.length) params.set('regions', selectedRegions.join(','))
    if (selectedTypes.length) params.set('types', selectedTypes.join(','))
    if (selectedStatuses.length) params.set('statuses', selectedStatuses.join(','))
    if (sortBy && sortBy !== 'deadline') params.set('sort', sortBy)
    if (selectedTender) params.set('tender', selectedTender.id)

    const paramString = params.toString()
    const newUrl = paramString ? `?${paramString}` : '/services/global-tenders-hub'
    router.replace(newUrl, { scroll: false })
  }, [debouncedSearch, selectedSectors, selectedRegions, selectedTypes, selectedStatuses, sortBy, selectedTender, loading, router])

  // Toggle save
  const toggleSave = useCallback((id: string) => {
    setSavedTenderIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      try { localStorage.setItem('savedTenders', JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  // Filter & sort
  const filteredTenders = useMemo(() => {
    let results = [...allTenders]

    // Saved filter
    if (showSavedOnly) {
      results = results.filter(t => savedTenderIds.includes(t.id))
    }

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      results = results.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.titleAr.includes(q) ||
        t.issuingOrganization.toLowerCase().includes(q) ||
        t.issuingOrganizationAr.includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.descriptionAr.includes(q) ||
        t.referenceNumber.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q)) ||
        t.tagsAr.some(tag => tag.includes(q))
      )
    }

    // Sector filter
    if (selectedSectors.length > 0) {
      results = results.filter(t => selectedSectors.includes(t.sector))
    }

    // Region filter
    if (selectedRegions.length > 0) {
      results = results.filter(t => selectedRegions.includes(t.region))
    }

    // Type filter
    if (selectedTypes.length > 0) {
      results = results.filter(t => selectedTypes.includes(t.tenderType))
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      results = results.filter(t => selectedStatuses.includes(t.status))
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        results.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
        break
      case 'value':
        // Simple sort by extracted numeric value (approximate)
        results.sort((a, b) => {
          const extractVal = (v: string) => {
            const match = v.match(/[\d.]+/)
            return match ? parseFloat(match[0]) : 0
          }
          return extractVal(b.estimatedValue) - extractVal(a.estimatedValue)
        })
        break
      case 'deadline':
      default:
        results.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        break
    }

    return results
  }, [debouncedSearch, selectedSectors, selectedRegions, selectedTypes, selectedStatuses, sortBy, showSavedOnly, savedTenderIds])

  // Stats
  const stats = useMemo(() => {
    const openTenders = allTenders.filter(t => t.status !== 'Closed')
    const uniqueSectors = new Set(openTenders.map(t => t.sector))
    const uniqueRegions = new Set(openTenders.map(t => t.region))
    const closingThisWeek = allTenders.filter(t => {
      const days = daysUntil(t.deadline)
      return days >= 0 && days <= 7
    })
    return {
      totalOpen: openTenders.length,
      sectorsCount: uniqueSectors.size,
      regionsCount: uniqueRegions.size,
      closingThisWeek: closingThisWeek.length,
    }
  }, [])

  const closingSoonTenders = useMemo(() =>
    allTenders.filter(t => t.status === 'Closing Soon').sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline)),
    []
  )

  const featuredTenders = useMemo(() => allTenders.filter(t => t.isFeatured), [])

  // Active filters for chips
  const activeFilters = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = []
    selectedSectors.forEach(s => chips.push({
      label: isRtl ? (sectorsAr[s] || s) : s,
      onRemove: () => setSelectedSectors(prev => prev.filter(x => x !== s)),
    }))
    selectedRegions.forEach(r => chips.push({
      label: isRtl ? (regionsAr[r] || r) : r,
      onRemove: () => setSelectedRegions(prev => prev.filter(x => x !== r)),
    }))
    selectedTypes.forEach(tp => chips.push({
      label: isRtl ? (tenderTypesAr[tp] || tp) : tp,
      onRemove: () => setSelectedTypes(prev => prev.filter(x => x !== tp)),
    }))
    selectedStatuses.forEach(st => chips.push({
      label: st,
      onRemove: () => setSelectedStatuses(prev => prev.filter(x => x !== st)),
    }))
    return chips
  }, [selectedSectors, selectedRegions, selectedTypes, selectedStatuses, isRtl])

  const hasActiveFilters = debouncedSearch || selectedSectors.length > 0 || selectedRegions.length > 0 || selectedTypes.length > 0 || selectedStatuses.length > 0

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setDebouncedSearch('')
    setSelectedSectors([])
    setSelectedRegions([])
    setSelectedTypes([])
    setSelectedStatuses([])
    setSortBy('deadline')
    setShowSavedOnly(false)
  }, [])

  const relatedTenders = useMemo(() => {
    if (!selectedTender) return []
    return allTenders
      .filter(t => t.id !== selectedTender.id && (t.sector === selectedTender.sector || t.region === selectedTender.region) && t.status !== 'Closed')
      .slice(0, 3)
  }, [selectedTender])

  if (!isMember) {
    return <MemberAccessGuard locale={locale} />
  }

  const el = t.globalTendersHub

  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200 dark:from-[#000C14] dark:via-[#001520] dark:to-[#001B30] ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 relative">
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl theme-panel text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOpen}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{el.statOpenTenders}</p>
          </div>
          <div className="p-4 rounded-2xl theme-panel text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.sectorsCount}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{el.statSectors}</p>
          </div>
          <div className="p-4 rounded-2xl theme-panel text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.regionsCount}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{el.statRegions}</p>
          </div>
          <div className="p-4 rounded-2xl theme-panel text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.closingThisWeek}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{el.statClosingThisWeek}</p>
          </div>
        </div>

        {/* Closing Soon Banner */}
        {!bannerDismissed && closingSoonTenders.length > 0 && !hasActiveFilters && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200/50 dark:border-amber-700/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">{el.closingSoonTitle}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400/70">
                    {closingSoonTenders.slice(0, 3).map(t => isRtl ? t.titleAr : t.title).join(' | ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBannerDismissed(true)}
                className="p-1 rounded text-amber-400 dark:text-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Featured Tenders */}
        {!hasActiveFilters && !showSavedOnly && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{el.featured}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {featuredTenders.map((tender) => {
                const days = daysUntil(tender.deadline)
                const isUrgent = tender.status === 'Closing Soon'
                return (
                  <button
                    key={tender.id}
                    onClick={() => setSelectedTender(tender)}
                    className="text-start p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/10 border border-blue-200/50 dark:border-blue-700/30 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <OrgAvatar name={tender.issuingOrganization} size="sm" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate">
                        {isRtl ? tender.issuingOrganizationAr : tender.issuingOrganization}
                      </span>
                      {isUrgent && (
                        <span className="ms-auto text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-medium flex-shrink-0">
                          {formatCountdown(days, isRtl)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {isRtl ? tender.titleAr : tender.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-white/40">
                      {countryFlags[tender.country]} {isRtl ? tender.countryAr : tender.country} &middot; {tender.estimatedValue}
                    </p>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Tabs: All Tenders / Saved */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowSavedOnly(false)}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              !showSavedOnly
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/70'
            }`}
          >
            {el.allTenders} ({allTenders.length})
          </button>
          <button
            onClick={() => setShowSavedOnly(true)}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              showSavedOnly
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/70'
            }`}
          >
            <svg className="w-4 h-4" fill={showSavedOnly ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {el.savedTenders} ({savedTenderIds.length})
          </button>
        </div>

        {/* Filters */}
        <div className="rounded-2xl p-5 theme-panel mb-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
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

            {/* Sector */}
            <MultiSelect
              label={el.sectorLabel}
              options={sectors}
              selected={selectedSectors}
              onChange={setSelectedSectors}
              locale={locale}
            />

            {/* Region */}
            <MultiSelect
              label={el.regionLabel}
              options={regions}
              selected={selectedRegions}
              onChange={setSelectedRegions}
              locale={locale}
            />

            {/* Tender Type */}
            <MultiSelect
              label={el.typeLabel}
              options={tenderTypes}
              selected={selectedTypes}
              onChange={setSelectedTypes}
              locale={locale}
            />

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{el.sortLabel}</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                style={{ color: 'var(--text)' }}
              >
                <option value="deadline">{el.sortDeadline}</option>
                <option value="newest">{el.sortNewest}</option>
                <option value="value">{el.sortValue}</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="mt-4 pt-3 border-t flex flex-wrap items-center gap-2" style={{ borderColor: 'var(--border)' }}>
              {activeFilters.map((chip, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30"
                >
                  {chip.label}
                  <button onClick={chip.onRemove} className="hover:text-blue-900 dark:hover:text-white transition-colors">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <button onClick={clearFilters} className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                {el.clearFilters}
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {el.showing
              .replace('{count}', String(filteredTenders.length))
              .replace('{total}', String(allTenders.length))}
          </p>
        </div>

        {/* Tenders Grid / Loading / Empty */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <TenderCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredTenders.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredTenders.map((tender) => (
              <TenderCard
                key={tender.id}
                tender={tender}
                locale={locale}
                onView={setSelectedTender}
                onSave={toggleSave}
                isSaved={savedTenderIds.includes(tender.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl theme-panel">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 dark:text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-white/60 mb-2">
              {showSavedOnly ? el.noSavedTenders : el.noResults}
            </p>
            <p className="text-sm text-gray-400 dark:text-white/30 mb-4">
              {showSavedOnly ? el.noSavedHint : el.noResultsHint}
            </p>
            {!showSavedOnly && (
              <button onClick={clearFilters} className="text-sm font-medium" style={{ color: 'var(--primary)' }}>
                {el.clearFilters}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tender Detail Modal */}
      {selectedTender && (
        <TenderDetailModal
          tender={selectedTender}
          locale={locale}
          onClose={() => setSelectedTender(null)}
          onSave={toggleSave}
          isSaved={savedTenderIds.includes(selectedTender.id)}
          relatedTenders={relatedTenders}
          onViewRelated={setSelectedTender}
        />
      )}
    </div>
  )
}
