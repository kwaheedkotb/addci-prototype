'use client'

import { useI18n } from '@/lib/i18n'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TimelineStage {
  key: string
  labelEn: string
  labelAr: string
  date: string | null // ISO date or null if not reached
  isCurrent: boolean
}

interface ApplicationStatusTimelineProps {
  stages: TimelineStage[]
}

// ─── Predefined Stage Sets ──────────────────────────────────────────────────

const STATUS_ORDER = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'PENDING_INFO',
  'CLOSED',
]

function statusIndex(status: string): number {
  const idx = STATUS_ORDER.indexOf(status)
  return idx >= 0 ? idx : 0
}

/**
 * Build a TimelineStage[] for a given service type and application record.
 * The application object is loosely typed (`any`) because the shape
 * varies across service types.
 */
export function getStagesForService(serviceType: string, app: any): TimelineStage[] {
  if (serviceType === 'ESG_LABEL') {
    return buildESGStages(app)
  }
  if (serviceType === 'KNOWLEDGE_SHARING') {
    return buildKnowledgeSharingStages(app)
  }
  return buildDefaultStages(app)
}

// ── Default: Submitted → Under Review → Completed ──────────────────────────

function buildDefaultStages(app: any): TimelineStage[] {
  const status: string = app.status ?? 'SUBMITTED'
  const sIdx = statusIndex(status)

  const stages: TimelineStage[] = [
    {
      key: 'submitted',
      labelEn: 'Submitted',
      labelAr: 'تم التقديم',
      date: app.submittedAt ?? null,
      isCurrent: status === 'SUBMITTED',
    },
    {
      key: 'under_review',
      labelEn: 'Under Review',
      labelAr: 'قيد المراجعة',
      date: sIdx >= 1 ? (app.updatedAt ?? app.submittedAt ?? null) : null,
      isCurrent: status === 'UNDER_REVIEW' || status === 'PENDING_INFO',
    },
    {
      key: 'completed',
      labelEn: status === 'REJECTED' ? 'Rejected' : 'Completed',
      labelAr: status === 'REJECTED' ? 'مرفوض' : 'مكتمل',
      date: ['APPROVED', 'REJECTED', 'CLOSED'].includes(status)
        ? (app.reviewedAt ?? app.updatedAt ?? null)
        : null,
      isCurrent: ['APPROVED', 'REJECTED', 'CLOSED'].includes(status),
    },
  ]

  return stages
}

// ── ESG: EoI Submitted → EoI Approved → Full Application → Under Review → Endorsed

function buildESGStages(app: any): TimelineStage[] {
  const status: string = app.status ?? 'SUBMITTED'
  const esg = app.esgApplication ?? {}

  // Determine which stage we are at
  const hasEoiApproved = !!esg.eoiApprovedAt
  const hasFullApp = hasEoiApproved && statusIndex(status) >= 1
  const isUnderReview = status === 'UNDER_REVIEW' || status === 'PENDING_INFO'
  const isEndorsed = status === 'APPROVED'
  const isRejected = status === 'REJECTED'

  const stages: TimelineStage[] = [
    {
      key: 'eoi_submitted',
      labelEn: 'EoI Submitted',
      labelAr: 'تقديم خطاب الاهتمام',
      date: esg.eoiSubmittedAt ?? app.submittedAt ?? null,
      isCurrent: status === 'SUBMITTED' && !hasEoiApproved,
    },
    {
      key: 'eoi_approved',
      labelEn: 'EoI Approved',
      labelAr: 'الموافقة على خطاب الاهتمام',
      date: esg.eoiApprovedAt ?? null,
      isCurrent: hasEoiApproved && !hasFullApp && status === 'SUBMITTED',
    },
    {
      key: 'full_application',
      labelEn: 'Full Application',
      labelAr: 'الطلب الكامل',
      date: hasFullApp ? (esg.fullApplicationAt ?? app.updatedAt ?? null) : null,
      isCurrent: hasFullApp && !isUnderReview && !isEndorsed && !isRejected,
    },
    {
      key: 'under_review',
      labelEn: 'Under Review',
      labelAr: 'قيد المراجعة',
      date: isUnderReview || isEndorsed || isRejected
        ? (app.updatedAt ?? null)
        : null,
      isCurrent: isUnderReview,
    },
    {
      key: 'endorsed',
      labelEn: isRejected ? 'Rejected' : 'Endorsed',
      labelAr: isRejected ? 'مرفوض' : 'مُعتمد',
      date: isEndorsed || isRejected ? (app.reviewedAt ?? app.updatedAt ?? null) : null,
      isCurrent: isEndorsed || isRejected,
    },
  ]

  return stages
}

// ── KS: Submitted → Under Review → Response Sent → Closed ──────────────────

function buildKnowledgeSharingStages(app: any): TimelineStage[] {
  const status: string = app.status ?? 'SUBMITTED'
  const ks = app.knowledgeSharingApplication ?? {}

  const hasResponse = !!ks.respondedAt
  const isClosed = status === 'CLOSED' || status === 'APPROVED'
  const isRejected = status === 'REJECTED'

  const stages: TimelineStage[] = [
    {
      key: 'submitted',
      labelEn: 'Submitted',
      labelAr: 'تم التقديم',
      date: app.submittedAt ?? null,
      isCurrent: status === 'SUBMITTED',
    },
    {
      key: 'under_review',
      labelEn: 'Under Review',
      labelAr: 'قيد المراجعة',
      date: statusIndex(status) >= 1 || hasResponse || isClosed
        ? (app.updatedAt ?? null)
        : null,
      isCurrent: status === 'UNDER_REVIEW' || status === 'PENDING_INFO',
    },
    {
      key: 'response_sent',
      labelEn: isRejected ? 'Rejected' : 'Response Sent',
      labelAr: isRejected ? 'مرفوض' : 'تم الرد',
      date: hasResponse
        ? ks.respondedAt
        : isRejected
          ? (app.reviewedAt ?? app.updatedAt ?? null)
          : null,
      isCurrent: (hasResponse && !isClosed) || isRejected,
    },
    {
      key: 'closed',
      labelEn: 'Closed',
      labelAr: 'مغلق',
      date: isClosed ? (app.reviewedAt ?? app.updatedAt ?? null) : null,
      isCurrent: isClosed,
    },
  ]

  return stages
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStageState(
  stage: TimelineStage,
  stages: TimelineStage[],
): 'completed' | 'current' | 'upcoming' {
  if (stage.isCurrent) return 'current'

  // Find the index of the current stage
  const currentIdx = stages.findIndex(s => s.isCurrent)
  const stageIdx = stages.indexOf(stage)

  if (currentIdx === -1) {
    // No current stage found; treat all stages with dates as completed
    return stage.date ? 'completed' : 'upcoming'
  }

  if (stageIdx < currentIdx) return 'completed'
  return 'upcoming'
}

function formatStageDate(isoDate: string, isRtl: boolean): string {
  try {
    return new Date(isoDate).toLocaleDateString(
      isRtl ? 'ar-AE' : 'en-US',
      { month: 'short', day: 'numeric', year: 'numeric' },
    )
  } catch {
    return isoDate
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ApplicationStatusTimeline({ stages }: ApplicationStatusTimelineProps) {
  const { locale, dir } = useI18n()
  const isRtl = locale === 'ar'

  return (
    <div dir={dir}>
      {/* Desktop: horizontal */}
      <div className="hidden md:flex items-start" style={{ direction: dir }}>
        {stages.map((stage, idx) => {
          const state = getStageState(stage, stages)
          const isLast = idx === stages.length - 1

          return (
            <div key={stage.key} className={`flex items-start ${!isLast ? 'flex-1' : ''}`}>
              {/* Stage node */}
              <div className="flex flex-col items-center" style={{ minWidth: '80px' }}>
                {/* Circle */}
                <div
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    state === 'current' ? 'ring-4 animate-pulse' : ''
                  }`}
                  style={{
                    background:
                      state === 'completed'
                        ? 'var(--accent-green)'
                        : state === 'current'
                          ? 'var(--primary)'
                          : 'transparent',
                    border:
                      state === 'upcoming'
                        ? '2px solid var(--muted)'
                        : 'none',
                    boxShadow:
                      state === 'current'
                        ? '0 0 0 4px color-mix(in srgb, var(--primary) 25%, transparent)'
                        : undefined,
                  }}
                >
                  {state === 'completed' ? (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : state === 'current' ? (
                    <div className="w-3 h-3 rounded-full bg-white" />
                  ) : (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: 'var(--muted)' }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className="mt-2 text-xs font-medium text-center leading-tight"
                  style={{
                    color: state === 'upcoming' ? 'var(--muted)' : 'var(--text)',
                    maxWidth: '100px',
                  }}
                >
                  {isRtl ? stage.labelAr : stage.labelEn}
                </span>

                {/* Date or "Current" */}
                {state === 'current' && (
                  <span
                    className="mt-1 text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--primary)' }}
                  >
                    {isRtl ? 'الحالي' : 'Current'}
                  </span>
                )}
                {state === 'completed' && stage.date && (
                  <span
                    className="mt-1 text-[10px]"
                    style={{ color: 'var(--muted)' }}
                  >
                    {formatStageDate(stage.date, isRtl)}
                  </span>
                )}
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  className="flex-1 mt-5 mx-1"
                  style={{
                    height: '2px',
                    borderTop:
                      getStageState(stages[idx + 1], stages) !== 'upcoming'
                        ? '2px solid var(--accent-green)'
                        : '2px dashed var(--muted)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical */}
      <div className="flex md:hidden flex-col" style={{ direction: dir }}>
        {stages.map((stage, idx) => {
          const state = getStageState(stage, stages)
          const isLast = idx === stages.length - 1

          return (
            <div key={stage.key} className="flex">
              {/* Left column: circle + line */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    state === 'current' ? 'ring-4 animate-pulse' : ''
                  }`}
                  style={{
                    background:
                      state === 'completed'
                        ? 'var(--accent-green)'
                        : state === 'current'
                          ? 'var(--primary)'
                          : 'transparent',
                    border:
                      state === 'upcoming'
                        ? '2px solid var(--muted)'
                        : 'none',
                    boxShadow:
                      state === 'current'
                        ? '0 0 0 4px color-mix(in srgb, var(--primary) 25%, transparent)'
                        : undefined,
                  }}
                >
                  {state === 'completed' ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : state === 'current' ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  ) : (
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: 'var(--muted)' }}
                    />
                  )}
                </div>

                {/* Vertical connecting line */}
                {!isLast && (
                  <div
                    className="flex-1 w-0 my-1"
                    style={{
                      minHeight: '24px',
                      borderInlineStart:
                        getStageState(stages[idx + 1], stages) !== 'upcoming'
                          ? '2px solid var(--accent-green)'
                          : '2px dashed var(--muted)',
                    }}
                  />
                )}
              </div>

              {/* Right column: label + date */}
              <div className={`ms-3 ${!isLast ? 'pb-4' : ''}`}>
                <span
                  className="text-sm font-medium leading-tight block"
                  style={{
                    color: state === 'upcoming' ? 'var(--muted)' : 'var(--text)',
                  }}
                >
                  {isRtl ? stage.labelAr : stage.labelEn}
                </span>

                {state === 'current' && (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide block mt-0.5"
                    style={{ color: 'var(--primary)' }}
                  >
                    {isRtl ? 'الحالي' : 'Current'}
                  </span>
                )}
                {state === 'completed' && stage.date && (
                  <span
                    className="text-[10px] block mt-0.5"
                    style={{ color: 'var(--muted)' }}
                  >
                    {formatStageDate(stage.date, isRtl)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
