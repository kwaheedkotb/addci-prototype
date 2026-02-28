// ─── Service Metadata (Member-Facing) ──────────────────────────────────────────
// Unified metadata for all services. Builds on staff-service-map.ts and adds
// member-friendly status labels, categories, and helper functions.

import { STAFF_SERVICE_MAP, SERVICE_TYPE_TO_SLUG } from './staff-service-map'
import type { ServiceMeta } from './staff-service-map'

export type { ServiceMeta }
export { STAFF_SERVICE_MAP, SERVICE_TYPE_TO_SLUG }

// ─── Status Labels (member-friendly) ──────────────────────────────────────────

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PENDING_INFO'
  | 'CLOSED'
  // Legacy statuses
  | 'CORRECTIONS_REQUESTED'

export interface StatusMeta {
  en: string
  ar: string
  color: string // Tailwind class string for badge
}

export const MEMBER_STATUS_LABELS: Record<string, StatusMeta> = {
  SUBMITTED: {
    en: 'Submitted',
    ar: 'مُقدَّم',
    color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  },
  UNDER_REVIEW: {
    en: 'Under Review',
    ar: 'قيد المراجعة',
    color: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  },
  APPROVED: {
    en: 'Approved',
    ar: 'مُعتمد',
    color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  },
  REJECTED: {
    en: 'Rejected',
    ar: 'مرفوض',
    color: 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-500/30',
  },
  PENDING_INFO: {
    en: 'Requires Action',
    ar: 'يتطلب إجراء',
    color: 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
  },
  CLOSED: {
    en: 'Closed',
    ar: 'مغلق',
    color: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10',
  },
  CORRECTIONS_REQUESTED: {
    en: 'Corrections Requested',
    ar: 'تصحيحات مطلوبة',
    color: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  },
}

// ─── Service Categories ───────────────────────────────────────────────────────

export const SERVICE_CATEGORIES: Record<string, { en: string; ar: string }> = {
  KNOWLEDGE_SHARING: { en: 'Training & Capability Development', ar: 'التدريب وتطوير القدرات' },
  CHAMBER_BOOST: { en: 'Commercial', ar: 'تجاري' },
  BUSINESS_MATCHMAKING: { en: 'Networking & Facility Booking', ar: 'التواصل وحجز المرافق' },
  ESG_LABEL: { en: 'Certificates', ar: 'الشهادات' },
  BUSINESS_DEVELOPMENT: { en: 'Commercial', ar: 'تجاري' },
  BUSINESS_ENABLEMENT: { en: 'Commercial', ar: 'تجاري' },
  POLICY_ADVOCACY: { en: 'Policy Advocacy', ar: 'المناصرة والسياسات' },
  LOYALTY_PLUS: { en: 'Commercial', ar: 'تجاري' },
  AD_CONNECT_CONCIERGE: { en: 'Networking & Facility Booking', ar: 'التواصل وحجز المرافق' },
}

// ─── Department List ──────────────────────────────────────────────────────────

export const DEPARTMENT_LIST: Array<{ key: string; en: string; ar: string }> = [
  { key: 'Business Connect & Services', en: 'Business Connect & Services', ar: 'ربط الأعمال والخدمات' },
  { key: 'Member Affairs', en: 'Member Affairs', ar: 'شؤون الأعضاء' },
  { key: 'Advocacy & Government Affairs', en: 'Advocacy & Government Affairs', ar: 'المناصرة والشؤون الحكومية' },
]

// ─── Category List ────────────────────────────────────────────────────────────

export const CATEGORY_LIST: Array<{ key: string; en: string; ar: string }> = [
  { key: 'Training & Capability Development', en: 'Training & Capability Development', ar: 'التدريب وتطوير القدرات' },
  { key: 'Commercial', en: 'Commercial', ar: 'تجاري' },
  { key: 'Certificates', en: 'Certificates', ar: 'الشهادات' },
  { key: 'Networking & Facility Booking', en: 'Networking & Facility Booking', ar: 'التواصل وحجز المرافق' },
  { key: 'Policy Advocacy', en: 'Policy Advocacy', ar: 'المناصرة والسياسات' },
]

// ─── Helper Functions ─────────────────────────────────────────────────────────

/** Look up ServiceMeta by ServiceType enum value */
export function getServiceMeta(serviceType: string): ServiceMeta | undefined {
  const slug = SERVICE_TYPE_TO_SLUG[serviceType]
  if (!slug) return undefined
  return STAFF_SERVICE_MAP[slug]
}

/** Get all ServiceType values that belong to a given department */
export function getServiceTypesByDepartment(department: string): string[] {
  return Object.values(STAFF_SERVICE_MAP)
    .filter(m => m.department === department)
    .map(m => m.serviceType)
}

/** Build a 1-line request summary from application + extension data */
export function getRequestSummary(app: {
  serviceType: string
  knowledgeSharingApplication?: {
    requestType?: string | null
    programName?: string | null
    programNameAr?: string | null
    queryText?: string | null
  } | null
  esgApplication?: {
    subSector?: string | null
  } | null
}): { en: string; ar: string } {
  const meta = getServiceMeta(app.serviceType)

  if (app.serviceType === 'KNOWLEDGE_SHARING' && app.knowledgeSharingApplication) {
    const ks = app.knowledgeSharingApplication
    if (ks.requestType === 'CALENDAR_BOOKING') {
      return {
        en: ks.programName ? `Session booking: ${ks.programName}` : 'Session booking request',
        ar: ks.programNameAr ? `حجز جلسة: ${ks.programNameAr}` : 'طلب حجز جلسة',
      }
    }
    if (ks.requestType === 'TRAINING_QUERY') {
      const preview = ks.queryText ? ks.queryText.slice(0, 80) + (ks.queryText.length > 80 ? '...' : '') : ''
      return {
        en: preview || 'Training query',
        ar: preview || 'استفسار تدريبي',
      }
    }
  }

  if (app.serviceType === 'ESG_LABEL') {
    const sector = app.esgApplication?.subSector
    return {
      en: sector ? `ESG Label Application — ${sector}` : 'ESG Label Application',
      ar: sector ? `طلب ختم الاستدامة — ${sector}` : 'طلب ختم الاستدامة',
    }
  }

  // Default: use the service name
  return {
    en: meta?.nameEn || app.serviceType.replace(/_/g, ' '),
    ar: meta?.nameAr || app.serviceType.replace(/_/g, ' '),
  }
}
