'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { getServiceMeta, MEMBER_STATUS_LABELS, SERVICE_CATEGORIES } from '@/lib/service-metadata'
import ApplicationStatusTimeline, { getStagesForService } from './ApplicationStatusTimeline'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ApplicationDetailViewProps {
  application: {
    id: string
    serviceType: string
    status: string
    submittedBy: string
    submittedByEmail: string
    memberTier: string
    submittedAt: string
    updatedAt: string
    reviewedAt: string | null
    rejectionReason: string | null
    esgApplication: any | null
    knowledgeSharingApplication: any | null
    certificate?: {
      certificateNumber: string
      issuedAt: string
      validUntil: string | null
    } | null
    activityLogs: Array<{
      id: string
      action: string
      performedBy: string
      performedAt: string
    }>
    isLegacy: boolean
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(isoDate: string, isRtl: boolean): string {
  try {
    return new Date(isoDate).toLocaleDateString(
      isRtl ? 'ar-AE' : 'en-US',
      { month: 'long', day: 'numeric', year: 'numeric' },
    )
  } catch {
    return isoDate
  }
}

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

function formatAbsoluteTime(dateStr: string, isRtl: boolean): string {
  try {
    return new Date(dateStr).toLocaleString(
      isRtl ? 'ar-AE' : 'en-US',
      { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' },
    )
  } catch {
    return dateStr
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ApplicationDetailView({ application }: ApplicationDetailViewProps) {
  const { locale, dir } = useI18n()
  const isRtl = locale === 'ar'
  const [copied, setCopied] = useState(false)

  const meta = getServiceMeta(application.serviceType)
  const statusMeta = MEMBER_STATUS_LABELS[application.status]
  const category = SERVICE_CATEGORIES[application.serviceType]

  const stages = getStagesForService(application.serviceType, application)

  // ── Copy ID to clipboard ──────────────────────────────────────────────

  function handleCopyId() {
    navigator.clipboard.writeText(application.id).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      // Fallback: do nothing
    })
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6" dir={dir}>
      {/* ── 1. Header (no card wrapper) ───────────────────────────────── */}
      <div>
        {/* Service name + category badge */}
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            {meta
              ? (isRtl ? meta.nameAr : meta.nameEn)
              : application.serviceType.replace(/_/g, ' ')}
          </h1>
          {category && (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
              style={{ background: 'var(--panel)', borderColor: 'var(--border)', color: 'var(--muted)' }}
            >
              {isRtl ? category.ar : category.en}
            </span>
          )}
        </div>

        {/* Application ID with copy button */}
        <div className="flex items-center gap-2 mb-3">
          <code
            className="text-xs font-mono px-2 py-1 rounded"
            style={{ background: 'var(--panel-2)', color: 'var(--muted)' }}
          >
            {application.id}
          </code>
          <button
            onClick={handleCopyId}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: 'var(--muted)' }}
            title={isRtl ? 'نسخ رقم الطلب' : 'Copy application ID'}
          >
            {copied ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent-green)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          {copied && (
            <span className="text-xs" style={{ color: 'var(--accent-green)' }}>
              {isRtl ? 'تم النسخ' : 'Copied!'}
            </span>
          )}
        </div>

        {/* Submitted date + status badge + tier badge */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--muted)' }}>
            {isRtl ? 'تاريخ التقديم:' : 'Submitted:'}{' '}
            <span style={{ color: 'var(--text)' }}>
              {formatDate(application.submittedAt, isRtl)}
            </span>
          </span>

          {statusMeta && (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusMeta.color}`}
            >
              {isRtl ? statusMeta.ar : statusMeta.en}
            </span>
          )}

          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
            style={{ background: 'var(--panel)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            {application.memberTier}
          </span>
        </div>
      </div>

      {/* ── 2. Status Timeline ────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 theme-panel">
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
          {isRtl ? 'مسار الطلب' : 'Application Progress'}
        </h2>
        <ApplicationStatusTimeline stages={stages} />
      </div>

      {/* ── 3. Application Summary ────────────────────────────────────── */}
      <div className="rounded-2xl p-6 theme-panel">
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
          {isRtl ? 'ملخص الطلب' : 'Application Summary'}
        </h2>
        {application.serviceType === 'ESG_LABEL' && application.esgApplication
          ? renderESGSummary(application.esgApplication, isRtl)
          : application.serviceType === 'KNOWLEDGE_SHARING' && application.knowledgeSharingApplication
            ? renderKSSummary(application.knowledgeSharingApplication, isRtl)
            : renderGenericSummary(application, isRtl)}
      </div>

      {/* ── 4. Certificate Section ────────────────────────────────────── */}
      {application.certificate && (
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'color-mix(in srgb, var(--accent-green) 8%, var(--panel))',
            border: '1px solid color-mix(in srgb, var(--accent-green) 25%, var(--border))',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent-green)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--accent-green)' }}>
              {isRtl ? 'الشهادة' : 'Certificate'}
            </h2>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <dt className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                {isRtl ? 'رقم الشهادة' : 'Certificate Number'}
              </dt>
              <dd className="text-sm font-mono mt-0.5" style={{ color: 'var(--text)' }}>
                {application.certificate.certificateNumber}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                {isRtl ? 'تاريخ الإصدار' : 'Issued Date'}
              </dt>
              <dd className="text-sm mt-0.5" style={{ color: 'var(--text)' }}>
                {formatDate(application.certificate.issuedAt, isRtl)}
              </dd>
            </div>
            {application.certificate.validUntil && (
              <div>
                <dt className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'صالحة حتى' : 'Valid Until'}
                </dt>
                <dd className="text-sm mt-0.5" style={{ color: 'var(--text)' }}>
                  {formatDate(application.certificate.validUntil, isRtl)}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* ── 5. Staff Response (KS only) ───────────────────────────────── */}
      {application.serviceType === 'KNOWLEDGE_SHARING' &&
        application.knowledgeSharingApplication?.responseText && (
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'var(--panel-2)',
              border: '1px solid var(--border)',
            }}
          >
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
              {isRtl ? 'رد من الغرفة' : 'Response from ADCCI'}
            </h2>
            <p
              className="text-sm whitespace-pre-wrap leading-relaxed"
              style={{ color: 'var(--text)' }}
            >
              {application.knowledgeSharingApplication.responseText}
            </p>
            {application.knowledgeSharingApplication.respondedAt && (
              <p className="text-xs mt-3" style={{ color: 'var(--muted)' }}>
                {formatDate(application.knowledgeSharingApplication.respondedAt, isRtl)}
              </p>
            )}
          </div>
        )}

      {/* ── 6. Rejection Reason ───────────────────────────────────────── */}
      {application.rejectionReason && (
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'color-mix(in srgb, #ef4444 8%, var(--panel))',
            border: '1px solid color-mix(in srgb, #ef4444 25%, var(--border))',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#ef4444' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-sm font-semibold" style={{ color: '#ef4444' }}>
              {isRtl ? 'سبب الرفض' : 'Rejection Reason'}
            </h2>
          </div>
          <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
            {application.rejectionReason}
          </p>
        </div>
      )}

      {/* ── 7. Activity History ────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 theme-panel">
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>
          {isRtl ? 'سجل النشاط' : 'Activity History'}
        </h2>
        {application.activityLogs.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {isRtl ? 'لا يوجد نشاط بعد' : 'No activity recorded yet.'}
          </p>
        ) : (
          <div className="space-y-4">
            {application.activityLogs.map((entry) => (
              <div key={entry.id} className="flex gap-3">
                {/* Dot */}
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ background: 'var(--primary)' }}
                />
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--text)' }}>
                    {entry.action}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {relativeTime(entry.performedAt, isRtl)}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      {formatAbsoluteTime(entry.performedAt, isRtl)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 8. CTA ────────────────────────────────────────────────────── */}
      <div className="flex justify-center pt-2 pb-6">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {isRtl ? 'تقديم طلب جديد' : 'Submit Another Request'}
        </Link>
      </div>
    </div>
  )
}

// ─── Summary Renderers ───────────────────────────────────────────────────────

function renderESGSummary(esg: any, isRtl: boolean) {
  const fields: Array<{ labelEn: string; labelAr: string; value: string | undefined | null }> = [
    { labelEn: 'Sub-Sector', labelAr: 'القطاع الفرعي', value: esg.subSector },
    { labelEn: 'Country', labelAr: 'الدولة', value: esg.country },
    { labelEn: 'Phone', labelAr: 'الهاتف', value: esg.phoneNumber },
    { labelEn: 'Trade License', labelAr: 'الرخصة التجارية', value: esg.tradeLicenseNumber },
  ]

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((f) =>
        f.value ? (
          <div key={f.labelEn}>
            <dt className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              {isRtl ? f.labelAr : f.labelEn}
            </dt>
            <dd className="text-sm mt-0.5" style={{ color: 'var(--text)' }}>
              {f.value}
            </dd>
          </div>
        ) : null,
      )}
    </dl>
  )
}

function renderKSSummary(ks: any, isRtl: boolean) {
  const fields: Array<{ labelEn: string; labelAr: string; value: string | number | undefined | null }> = [
    { labelEn: 'Request Type', labelAr: 'نوع الطلب', value: ks.requestType?.replace(/_/g, ' ') },
    { labelEn: 'Program Type', labelAr: 'نوع البرنامج', value: ks.programType?.replace(/_/g, ' ') },
    { labelEn: 'Program Name', labelAr: 'اسم البرنامج', value: ks.programName },
    { labelEn: 'Number of Attendees', labelAr: 'عدد الحضور', value: ks.numberOfAttendees },
    {
      labelEn: 'Session Date',
      labelAr: 'تاريخ الجلسة',
      value: ks.sessionDate
        ? new Date(ks.sessionDate).toLocaleDateString(isRtl ? 'ar-AE' : 'en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        : null,
    },
  ]

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) =>
          f.value != null && f.value !== '' ? (
            <div key={f.labelEn}>
              <dt className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                {isRtl ? f.labelAr : f.labelEn}
              </dt>
              <dd className="text-sm mt-0.5" style={{ color: 'var(--text)' }}>
                {String(f.value)}
              </dd>
            </div>
          ) : null,
        )}
      </dl>

      {/* Query text (full width) */}
      {ks.queryText && (
        <div>
          <dt className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
            {isRtl ? 'نص الاستفسار' : 'Query'}
          </dt>
          <dd
            className="text-sm whitespace-pre-wrap p-3 rounded-xl"
            style={{ background: 'var(--panel-2)', color: 'var(--text)' }}
          >
            {ks.queryText}
          </dd>
        </div>
      )}

      {/* Attendee details for calendar booking */}
      {ks.requestType === 'CALENDAR_BOOKING' && ks.attendeeName && (
        <div>
          <h3 className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>
            {isRtl ? 'بيانات الحضور' : 'Attendee Details'}
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ks.attendeeName && (
              <div>
                <dt className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'الاسم' : 'Name'}
                </dt>
                <dd className="text-sm mt-0.5" style={{ color: 'var(--text)' }}>
                  {ks.attendeeName}
                </dd>
              </div>
            )}
            {ks.attendeeEmail && (
              <div>
                <dt className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'البريد الإلكتروني' : 'Email'}
                </dt>
                <dd className="text-sm mt-0.5" style={{ color: 'var(--text)' }}>
                  {ks.attendeeEmail}
                </dd>
              </div>
            )}
            {ks.attendeePhone && (
              <div>
                <dt className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'الهاتف' : 'Phone'}
                </dt>
                <dd className="text-sm mt-0.5" style={{ color: 'var(--text)' }}>
                  {ks.attendeePhone}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  )
}

function renderGenericSummary(application: any, isRtl: boolean) {
  const fields: Array<{ labelEn: string; labelAr: string; value: string | undefined | null }> = [
    { labelEn: 'Service Type', labelAr: 'نوع الخدمة', value: application.serviceType?.replace(/_/g, ' ') },
    { labelEn: 'Submitted By', labelAr: 'مُقدَّم من', value: application.submittedBy },
    { labelEn: 'Email', labelAr: 'البريد الإلكتروني', value: application.submittedByEmail },
    { labelEn: 'Member Tier', labelAr: 'فئة العضوية', value: application.memberTier },
  ]

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((f) =>
        f.value ? (
          <div key={f.labelEn}>
            <dt className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              {isRtl ? f.labelAr : f.labelEn}
            </dt>
            <dd className="text-sm mt-0.5" style={{ color: 'var(--text)' }}>
              {f.value}
            </dd>
          </div>
        ) : null,
      )}
    </dl>
  )
}
