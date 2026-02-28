// ─── Staff Service Map ──────────────────────────────────────────────────────
// Maps service slugs (used in URLs) to ServiceType enum values and metadata.
// Used by: app/staff/[serviceSlug]/page.tsx, app/staff/page.tsx activity feed

export interface ServiceMeta {
  serviceType: string
  nameEn: string
  nameAr: string
  department: string
  departmentAr: string
  sla: string
  slaAr: string
  /** Numeric SLA days for the SLAIndicator component (null = N/A) */
  slaDays: number | null
}

export const STAFF_SERVICE_MAP: Record<string, ServiceMeta> = {
  'knowledge-sharing': {
    serviceType: 'KNOWLEDGE_SHARING',
    nameEn: 'Knowledge Sharing & Upskilling',
    nameAr: 'برامج المعرفة والتطوير',
    department: 'Business Connect & Services',
    departmentAr: 'ربط الأعمال والخدمات',
    sla: '1 day',
    slaAr: 'يوم واحد',
    slaDays: 1,
  },
  'chamber-boost': {
    serviceType: 'CHAMBER_BOOST',
    nameEn: 'Chamber Boost',
    nameAr: 'تعزيز الغرفة',
    department: 'Business Connect & Services',
    departmentAr: 'ربط الأعمال والخدمات',
    sla: '2 working days',
    slaAr: 'يومان عمل',
    slaDays: 2,
  },
  'business-matchmaking': {
    serviceType: 'BUSINESS_MATCHMAKING',
    nameEn: 'Chamber Business Matchmaking',
    nameAr: 'مطابقة الأعمال',
    department: 'Business Connect & Services',
    departmentAr: 'ربط الأعمال والخدمات',
    sla: '2–10 working days',
    slaAr: '2-10 أيام عمل',
    slaDays: 10,
  },
  'esg-label': {
    serviceType: 'ESG_LABEL',
    nameEn: 'Chamber ESG Label',
    nameAr: 'ختم الاستدامة للغرفة',
    department: 'Business Connect & Services',
    departmentAr: 'ربط الأعمال والخدمات',
    sla: 'TBD (multi-phase)',
    slaAr: 'يُحدد لاحقاً (متعدد المراحل)',
    slaDays: null,
  },
  'business-development': {
    serviceType: 'BUSINESS_DEVELOPMENT',
    nameEn: 'Business Development Services',
    nameAr: 'خدمات تطوير الأعمال',
    department: 'Business Connect & Services',
    departmentAr: 'ربط الأعمال والخدمات',
    sla: '2 working days',
    slaAr: 'يومان عمل',
    slaDays: 2,
  },
  'business-enablement': {
    serviceType: 'BUSINESS_ENABLEMENT',
    nameEn: 'Business Enablement Advisory',
    nameAr: 'الاستشارات التمكينية للأعمال',
    department: 'Business Connect & Services',
    departmentAr: 'ربط الأعمال والخدمات',
    sla: 'TBD',
    slaAr: 'يُحدد لاحقاً',
    slaDays: null,
  },
  'policy-advocacy': {
    serviceType: 'POLICY_ADVOCACY',
    nameEn: 'Policy Advocacy',
    nameAr: 'المناصرة والسياسات',
    department: 'Advocacy & Government Affairs',
    departmentAr: 'المناصرة والشؤون الحكومية',
    sla: 'Varies',
    slaAr: 'متغير',
    slaDays: null,
  },
  'loyalty-plus': {
    serviceType: 'LOYALTY_PLUS',
    nameEn: 'ADCCI Loyalty Plus',
    nameAr: 'برنامج الولاء',
    department: 'Business Connect & Services',
    departmentAr: 'ربط الأعمال والخدمات',
    sla: 'TBD',
    slaAr: 'يُحدد لاحقاً',
    slaDays: null,
  },
  'ad-connect': {
    serviceType: 'AD_CONNECT_CONCIERGE',
    nameEn: 'AD Connect & Concierge',
    nameAr: 'أبوظبي كونكت والكونسيرج',
    department: 'Member Affairs',
    departmentAr: 'شؤون الأعضاء',
    sla: 'TBD',
    slaAr: 'يُحدد لاحقاً',
    slaDays: null,
  },
}

/** Reverse lookup: ServiceType enum → slug */
export const SERVICE_TYPE_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(STAFF_SERVICE_MAP).map(([slug, meta]) => [meta.serviceType, slug])
)
