// ─── Procurement Hub Seed Data ───────────────────────────────────────────────
// B2B marketplace: suppliers, catalog items, and procurement requests

export interface CatalogItem {
  id: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  category: string
  categoryAr: string
  priceType: 'Fixed' | 'Per Unit' | 'Negotiable' | 'On Request'
  priceRange: string
  priceRangeAr: string
  deliveryTime: string
  deliveryTimeAr: string
  tags: string[]
  tagsAr: string[]
}

export interface Supplier {
  id: string
  companyName: string
  companyNameAr: string
  sector: string
  sectorAr: string
  description: string
  descriptionAr: string
  isGoldenVendor: boolean
  memberTier: 'Standard' | 'Premium' | 'Elite Plus'
  location: string
  locationAr: string
  establishedYear: number
  employeeCount: string
  rating: number
  reviewCount: number
  catalogItems: CatalogItem[]
  tags: string[]
  tagsAr: string[]
  contactEmail: string
  responseTime: string
  responseTimeAr: string
  completedDeals: number
}

export interface ProcurementRequest {
  id: string
  title: string
  titleAr: string
  postedBy: string
  postedByAr: string
  sector: string
  sectorAr: string
  description: string
  descriptionAr: string
  requirements: string[]
  requirementsAr: string[]
  budget: string
  budgetAr: string
  deadline: string
  status: 'Open' | 'In Review' | 'Closed'
  proposalCount: number
  postedDate: string
  tags: string[]
  tagsAr: string[]
  isUrgent: boolean
}

// ─── Sectors ────────────────────────────────────────────────────────────────

export const sectors = [
  'IT Services',
  'Construction',
  'Logistics',
  'Consulting',
  'Facility Management',
  'Healthcare Supplies',
  'Food & Beverage',
  'Security Services',
  'Marketing & Media',
  'Engineering',
  'Legal Services',
]

export const sectorsAr: Record<string, string> = {
  'IT Services': 'خدمات تقنية المعلومات',
  Construction: 'البناء والتشييد',
  Logistics: 'الخدمات اللوجستية',
  Consulting: 'الاستشارات',
  'Facility Management': 'إدارة المرافق',
  'Healthcare Supplies': 'المستلزمات الطبية',
  'Food & Beverage': 'الأغذية والمشروبات',
  'Security Services': 'خدمات الأمن',
  'Marketing & Media': 'التسويق والإعلام',
  Engineering: 'الهندسة',
  'Legal Services': 'الخدمات القانونية',
}

export const sectorColors: Record<string, { bg: string; text: string; border: string }> = {
  'IT Services': { bg: 'bg-cyan-100 dark:bg-cyan-500/20', text: 'text-cyan-800 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-500/30' },
  Construction: { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-800 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-500/30' },
  Logistics: { bg: 'bg-indigo-100 dark:bg-indigo-500/20', text: 'text-indigo-800 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-500/30' },
  Consulting: { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-800 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-500/30' },
  'Facility Management': { bg: 'bg-teal-100 dark:bg-teal-500/20', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-500/30' },
  'Healthcare Supplies': { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-800 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-500/30' },
  'Food & Beverage': { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-500/30' },
  'Security Services': { bg: 'bg-slate-100 dark:bg-slate-500/20', text: 'text-slate-800 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-500/30' },
  'Marketing & Media': { bg: 'bg-pink-100 dark:bg-pink-500/20', text: 'text-pink-800 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-500/30' },
  Engineering: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-500/30' },
  'Legal Services': { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/30' },
}

export const companyColors: Record<string, { bg: string; text: string }> = {
  'NexaTech Solutions': { bg: 'bg-cyan-600', text: 'text-white' },
  'Al Bawani Construction': { bg: 'bg-orange-600', text: 'text-white' },
  'SwiftLog Freight': { bg: 'bg-indigo-600', text: 'text-white' },
  'Stratagem Advisory': { bg: 'bg-purple-600', text: 'text-white' },
  'ProFacility Group': { bg: 'bg-teal-600', text: 'text-white' },
  'MedSupply Gulf': { bg: 'bg-rose-600', text: 'text-white' },
  'Tastemakers Catering': { bg: 'bg-amber-600', text: 'text-white' },
  'Sentinel Security': { bg: 'bg-slate-600', text: 'text-white' },
  'BrightSpark Media': { bg: 'bg-pink-600', text: 'text-white' },
  'Apex Engineering': { bg: 'bg-blue-600', text: 'text-white' },
  'Al Adl Legal Consultants': { bg: 'bg-emerald-600', text: 'text-white' },
  'CloudBridge Systems': { bg: 'bg-violet-600', text: 'text-white' },
  'GreenBuild Contractors': { bg: 'bg-lime-600', text: 'text-white' },
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export const memberTiers = ['Standard', 'Premium', 'Elite Plus'] as const
export const memberTiersAr: Record<string, string> = { Standard: 'قياسي', Premium: 'متميز', 'Elite Plus': 'نخبة بلس' }

export const tierColors: Record<string, string> = {
  Standard: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10',
  Premium: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  'Elite Plus': 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
}

export const statusColors: Record<string, string> = {
  Open: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  'In Review': 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
  Closed: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10',
}

export const statusesAr: Record<string, string> = { Open: 'مفتوح', 'In Review': 'قيد المراجعة', Closed: 'مغلق' }
export const priceTypesAr: Record<string, string> = { Fixed: 'ثابت', 'Per Unit': 'لكل وحدة', Negotiable: 'قابل للتفاوض', 'On Request': 'عند الطلب' }

export const budgetRanges = ['Under AED 25,000', 'AED 25,000–50,000', 'AED 50,000–100,000', 'AED 100,000–500,000', 'AED 500,000+', 'Undisclosed']
export const budgetRangesAr: Record<string, string> = {
  'Under AED 25,000': 'أقل من 25,000 درهم',
  'AED 25,000–50,000': '25,000–50,000 درهم',
  'AED 50,000–100,000': '50,000–100,000 درهم',
  'AED 100,000–500,000': '100,000–500,000 درهم',
  'AED 500,000+': 'أكثر من 500,000 درهم',
  Undisclosed: 'غير معلن',
}

// ─── Suppliers (13) ─────────────────────────────────────────────────────────

export const allSuppliers: Supplier[] = [
  {
    id: 'sup-001', companyName: 'NexaTech Solutions', companyNameAr: 'نيكساتك للحلول', sector: 'IT Services', sectorAr: 'خدمات تقنية المعلومات',
    description: 'Full-stack IT solutions provider specializing in cloud migration, cybersecurity, and enterprise software development for government and private sector clients in Abu Dhabi.',
    descriptionAr: 'مزود حلول تقنية شاملة متخصص في الحوسبة السحابية والأمن السيبراني وتطوير البرمجيات المؤسسية.',
    isGoldenVendor: true, memberTier: 'Elite Plus', location: 'ADGM', locationAr: 'سوق أبوظبي العالمي',
    establishedYear: 2016, employeeCount: '200–500', rating: 4.9, reviewCount: 87,
    tags: ['Cloud', 'Cybersecurity', 'ERP', 'AI'], tagsAr: ['سحابة', 'أمن سيبراني', 'تخطيط موارد', 'ذكاء اصطناعي'],
    contactEmail: 'procurement@nexatech.ae', responseTime: 'Within 24 hours', responseTimeAr: 'خلال 24 ساعة', completedDeals: 142,
    catalogItems: [
      { id: 'cat-001-1', title: 'Cloud Infrastructure Migration', titleAr: 'ترحيل البنية التحتية السحابية', description: 'End-to-end migration of on-premise infrastructure to AWS, Azure, or GCP with zero downtime guarantee.', descriptionAr: 'ترحيل شامل للبنية التحتية المحلية إلى السحابة مع ضمان عدم توقف الخدمة.', category: 'Cloud Services', categoryAr: 'خدمات سحابية', priceType: 'Negotiable', priceRange: 'AED 50,000–200,000', priceRangeAr: '50,000–200,000 درهم', deliveryTime: '4–12 weeks', deliveryTimeAr: '4–12 أسبوع', tags: ['Cloud', 'Migration', 'AWS'], tagsAr: ['سحابة', 'ترحيل'] },
      { id: 'cat-001-2', title: 'Cybersecurity Assessment & SOC Setup', titleAr: 'تقييم الأمن السيبراني وإنشاء مركز عمليات', description: 'Comprehensive security audit with 24/7 Security Operations Center implementation.', descriptionAr: 'تدقيق أمني شامل مع تنفيذ مركز عمليات أمنية يعمل على مدار الساعة.', category: 'Security', categoryAr: 'أمن', priceType: 'Fixed', priceRange: 'AED 75,000', priceRangeAr: '75,000 درهم', deliveryTime: '6–8 weeks', deliveryTimeAr: '6–8 أسابيع', tags: ['Security', 'SOC', 'Audit'], tagsAr: ['أمن', 'تدقيق'] },
      { id: 'cat-001-3', title: 'Custom Enterprise Software Development', titleAr: 'تطوير برمجيات مؤسسية مخصصة', description: 'Bespoke software solutions tailored to business requirements with agile delivery methodology.', descriptionAr: 'حلول برمجية مخصصة حسب متطلبات العمل بمنهجية تسليم رشيقة.', category: 'Software', categoryAr: 'برمجيات', priceType: 'Negotiable', priceRange: 'AED 100,000–500,000', priceRangeAr: '100,000–500,000 درهم', deliveryTime: '8–24 weeks', deliveryTimeAr: '8–24 أسبوع', tags: ['Software', 'Custom', 'Agile'], tagsAr: ['برمجيات', 'مخصص'] },
    ],
  },
  {
    id: 'sup-002', companyName: 'Al Bawani Construction', companyNameAr: 'البواني للبناء', sector: 'Construction', sectorAr: 'البناء والتشييد',
    description: 'Award-winning construction firm delivering commercial, residential, and infrastructure projects across the UAE with a focus on sustainable building practices.',
    descriptionAr: 'شركة بناء حائزة على جوائز تنفذ مشاريع تجارية وسكنية وبنية تحتية في جميع أنحاء الإمارات.',
    isGoldenVendor: true, memberTier: 'Elite Plus', location: 'Mussafah', locationAr: 'المصفح',
    establishedYear: 2008, employeeCount: '500–1000', rating: 4.8, reviewCount: 64,
    tags: ['Construction', 'Infrastructure', 'Sustainable', 'MEP'], tagsAr: ['بناء', 'بنية تحتية', 'مستدام'],
    contactEmail: 'bids@albawani.ae', responseTime: 'Within 48 hours', responseTimeAr: 'خلال 48 ساعة', completedDeals: 98,
    catalogItems: [
      { id: 'cat-002-1', title: 'Commercial Building Construction', titleAr: 'بناء المباني التجارية', description: 'Full design-build service for commercial properties including offices, warehouses, and retail spaces.', descriptionAr: 'خدمة تصميم وبناء شاملة للعقارات التجارية.', category: 'Construction', categoryAr: 'بناء', priceType: 'Negotiable', priceRange: 'AED 5M–50M', priceRangeAr: '5–50 مليون درهم', deliveryTime: '12–36 months', deliveryTimeAr: '12–36 شهر', tags: ['Commercial', 'Design-Build'], tagsAr: ['تجاري', 'تصميم وبناء'] },
      { id: 'cat-002-2', title: 'MEP Engineering Services', titleAr: 'خدمات الهندسة الكهروميكانيكية', description: 'Mechanical, electrical, and plumbing design and installation for new and existing buildings.', descriptionAr: 'تصميم وتركيب الأنظمة الميكانيكية والكهربائية والسباكة.', category: 'Engineering', categoryAr: 'هندسة', priceType: 'On Request', priceRange: 'On Request', priceRangeAr: 'عند الطلب', deliveryTime: '4–16 weeks', deliveryTimeAr: '4–16 أسبوع', tags: ['MEP', 'Engineering'], tagsAr: ['هندسة كهروميكانيكية'] },
      { id: 'cat-002-3', title: 'Interior Fit-out & Renovation', titleAr: 'التشطيبات الداخلية والتجديد', description: 'Premium interior fit-out services for offices, hospitality, and retail environments.', descriptionAr: 'خدمات تشطيبات داخلية متميزة للمكاتب والضيافة والتجزئة.', category: 'Fit-out', categoryAr: 'تشطيبات', priceType: 'Per Unit', priceRange: 'AED 800–2,500/sqm', priceRangeAr: '800–2,500 درهم/م²', deliveryTime: '8–20 weeks', deliveryTimeAr: '8–20 أسبوع', tags: ['Interior', 'Renovation'], tagsAr: ['تشطيبات', 'تجديد'] },
    ],
  },
  {
    id: 'sup-003', companyName: 'SwiftLog Freight', companyNameAr: 'سويفت لوج للشحن', sector: 'Logistics', sectorAr: 'الخدمات اللوجستية',
    description: 'Integrated logistics and freight forwarding company offering air, sea, and land shipping with customs clearance and warehousing across the GCC.',
    descriptionAr: 'شركة خدمات لوجستية متكاملة تقدم الشحن الجوي والبحري والبري مع التخليص الجمركي والتخزين.',
    isGoldenVendor: false, memberTier: 'Premium', location: 'Khalifa City', locationAr: 'مدينة خليفة',
    establishedYear: 2014, employeeCount: '100–200', rating: 4.6, reviewCount: 52,
    tags: ['Logistics', 'Freight', 'Customs', 'Warehousing'], tagsAr: ['لوجستيات', 'شحن', 'جمارك', 'تخزين'],
    contactEmail: 'quotes@swiftlog.ae', responseTime: 'Within 12 hours', responseTimeAr: 'خلال 12 ساعة', completedDeals: 210,
    catalogItems: [
      { id: 'cat-003-1', title: 'International Freight Forwarding', titleAr: 'الشحن الدولي', description: 'Door-to-door freight services via air, sea, and land across 120+ countries.', descriptionAr: 'خدمات شحن من الباب إلى الباب عبر الجو والبحر والبر.', category: 'Freight', categoryAr: 'شحن', priceType: 'Per Unit', priceRange: 'From AED 15/kg', priceRangeAr: 'من 15 درهم/كجم', deliveryTime: '3–15 business days', deliveryTimeAr: '3–15 يوم عمل', tags: ['International', 'Freight'], tagsAr: ['دولي', 'شحن'] },
      { id: 'cat-003-2', title: 'Customs Clearance & Brokerage', titleAr: 'التخليص الجمركي والوساطة', description: 'Full customs documentation, clearance, and regulatory compliance services.', descriptionAr: 'خدمات التوثيق الجمركي الكامل والتخليص والامتثال التنظيمي.', category: 'Customs', categoryAr: 'جمارك', priceType: 'Fixed', priceRange: 'AED 1,500–5,000', priceRangeAr: '1,500–5,000 درهم', deliveryTime: '1–3 business days', deliveryTimeAr: '1–3 أيام عمل', tags: ['Customs', 'Compliance'], tagsAr: ['جمارك', 'امتثال'] },
      { id: 'cat-003-3', title: 'Warehousing & Distribution', titleAr: 'التخزين والتوزيع', description: 'Temperature-controlled and general warehousing with last-mile distribution network.', descriptionAr: 'تخزين عام ومبرد مع شبكة توزيع الميل الأخير.', category: 'Warehousing', categoryAr: 'تخزين', priceType: 'Per Unit', priceRange: 'AED 25–60/pallet/month', priceRangeAr: '25–60 درهم/طبلية/شهر', deliveryTime: 'Immediate', deliveryTimeAr: 'فوري', tags: ['Warehousing', 'Distribution'], tagsAr: ['تخزين', 'توزيع'] },
    ],
  },
  {
    id: 'sup-004', companyName: 'Stratagem Advisory', companyNameAr: 'ستراتاجيم للاستشارات', sector: 'Consulting', sectorAr: 'الاستشارات',
    description: 'Strategic management consulting firm helping Abu Dhabi businesses with market entry, operational excellence, digital transformation, and organizational restructuring.',
    descriptionAr: 'شركة استشارات إدارية استراتيجية تساعد شركات أبوظبي في دخول الأسواق والتميز التشغيلي والتحول الرقمي.',
    isGoldenVendor: true, memberTier: 'Elite Plus', location: 'Al Maryah Island', locationAr: 'جزيرة المارية',
    establishedYear: 2012, employeeCount: '50–100', rating: 4.9, reviewCount: 41,
    tags: ['Strategy', 'Digital', 'Operations', 'M&A'], tagsAr: ['استراتيجية', 'رقمي', 'عمليات'],
    contactEmail: 'engage@stratagem.ae', responseTime: 'Within 24 hours', responseTimeAr: 'خلال 24 ساعة', completedDeals: 76,
    catalogItems: [
      { id: 'cat-004-1', title: 'Market Entry Strategy', titleAr: 'استراتيجية دخول السوق', description: 'Comprehensive market research, competitor analysis, and go-to-market planning for the UAE and GCC.', descriptionAr: 'بحث سوق شامل وتحليل منافسين وتخطيط دخول سوق الإمارات والخليج.', category: 'Strategy', categoryAr: 'استراتيجية', priceType: 'Fixed', priceRange: 'AED 45,000–120,000', priceRangeAr: '45,000–120,000 درهم', deliveryTime: '4–8 weeks', deliveryTimeAr: '4–8 أسابيع', tags: ['Market Entry', 'Strategy'], tagsAr: ['دخول السوق'] },
      { id: 'cat-004-2', title: 'Digital Transformation Roadmap', titleAr: 'خارطة طريق التحول الرقمي', description: 'Assessment of digital maturity with a phased transformation roadmap and change management plan.', descriptionAr: 'تقييم النضج الرقمي مع خارطة طريق تحول مرحلية وخطة إدارة التغيير.', category: 'Digital', categoryAr: 'رقمي', priceType: 'Negotiable', priceRange: 'AED 80,000–250,000', priceRangeAr: '80,000–250,000 درهم', deliveryTime: '6–12 weeks', deliveryTimeAr: '6–12 أسبوع', tags: ['Digital', 'Transformation'], tagsAr: ['رقمي', 'تحول'] },
      { id: 'cat-004-3', title: 'Operational Excellence Program', titleAr: 'برنامج التميز التشغيلي', description: 'Lean and Six Sigma-based process optimization to reduce costs and improve service delivery.', descriptionAr: 'تحسين العمليات القائم على لين وسيكس سيجما لخفض التكاليف وتحسين الخدمة.', category: 'Operations', categoryAr: 'عمليات', priceType: 'Negotiable', priceRange: 'AED 60,000–180,000', priceRangeAr: '60,000–180,000 درهم', deliveryTime: '8–16 weeks', deliveryTimeAr: '8–16 أسبوع', tags: ['Lean', 'Operations'], tagsAr: ['عمليات', 'تحسين'] },
    ],
  },
  {
    id: 'sup-005', companyName: 'ProFacility Group', companyNameAr: 'بروفاسيليتي جروب', sector: 'Facility Management', sectorAr: 'إدارة المرافق',
    description: 'Comprehensive facility management services including HVAC maintenance, cleaning, landscaping, and building management systems for commercial properties.',
    descriptionAr: 'خدمات إدارة مرافق شاملة تشمل صيانة التكييف والتنظيف والمناظر الطبيعية وأنظمة إدارة المباني.',
    isGoldenVendor: false, memberTier: 'Premium', location: 'Masdar City', locationAr: 'مدينة مصدر',
    establishedYear: 2011, employeeCount: '500–1000', rating: 4.5, reviewCount: 73,
    tags: ['FM', 'Maintenance', 'Cleaning', 'HVAC'], tagsAr: ['إدارة مرافق', 'صيانة', 'تنظيف'],
    contactEmail: 'services@profacility.ae', responseTime: 'Within 4 hours', responseTimeAr: 'خلال 4 ساعات', completedDeals: 185,
    catalogItems: [
      { id: 'cat-005-1', title: 'Integrated Facility Management', titleAr: 'إدارة المرافق المتكاملة', description: 'Full-spectrum FM covering mechanical, electrical, plumbing, cleaning, and security.', descriptionAr: 'إدارة مرافق شاملة تغطي الأنظمة الميكانيكية والكهربائية والسباكة والتنظيف والأمن.', category: 'FM', categoryAr: 'إدارة مرافق', priceType: 'Per Unit', priceRange: 'AED 8–18/sqm/month', priceRangeAr: '8–18 درهم/م²/شهر', deliveryTime: 'Immediate start', deliveryTimeAr: 'بدء فوري', tags: ['FM', 'Integrated'], tagsAr: ['إدارة مرافق'] },
      { id: 'cat-005-2', title: 'HVAC Maintenance Contract', titleAr: 'عقد صيانة التكييف', description: 'Preventive and corrective maintenance for all HVAC systems with 24/7 emergency support.', descriptionAr: 'صيانة وقائية وتصحيحية لجميع أنظمة التكييف مع دعم طوارئ على مدار الساعة.', category: 'Maintenance', categoryAr: 'صيانة', priceType: 'Fixed', priceRange: 'AED 2,000–8,000/month', priceRangeAr: '2,000–8,000 درهم/شهر', deliveryTime: '2–5 business days', deliveryTimeAr: '2–5 أيام عمل', tags: ['HVAC', 'Maintenance'], tagsAr: ['تكييف', 'صيانة'] },
    ],
  },
  {
    id: 'sup-006', companyName: 'MedSupply Gulf', companyNameAr: 'ميدسبلاي الخليج', sector: 'Healthcare Supplies', sectorAr: 'المستلزمات الطبية',
    description: 'Authorized distributor of medical devices, surgical instruments, and pharmaceutical supplies serving hospitals and clinics across the UAE.',
    descriptionAr: 'موزع معتمد للأجهزة الطبية والأدوات الجراحية والمستلزمات الصيدلانية لخدمة المستشفيات والعيادات.',
    isGoldenVendor: false, memberTier: 'Premium', location: 'Khalifa City', locationAr: 'مدينة خليفة',
    establishedYear: 2015, employeeCount: '50–100', rating: 4.7, reviewCount: 38,
    tags: ['Medical', 'Devices', 'Pharma', 'Hospital'], tagsAr: ['طبي', 'أجهزة', 'مستشفى'],
    contactEmail: 'orders@medsupplygulf.ae', responseTime: 'Within 24 hours', responseTimeAr: 'خلال 24 ساعة', completedDeals: 95,
    catalogItems: [
      { id: 'cat-006-1', title: 'Medical Equipment Supply', titleAr: 'توريد المعدات الطبية', description: 'Diagnostic and therapeutic equipment from leading global manufacturers.', descriptionAr: 'معدات تشخيصية وعلاجية من كبرى الشركات المصنعة العالمية.', category: 'Equipment', categoryAr: 'معدات', priceType: 'On Request', priceRange: 'On Request', priceRangeAr: 'عند الطلب', deliveryTime: '2–6 weeks', deliveryTimeAr: '2–6 أسابيع', tags: ['Medical', 'Equipment'], tagsAr: ['طبي', 'معدات'] },
      { id: 'cat-006-2', title: 'Surgical Consumables & PPE', titleAr: 'مستلزمات جراحية ومعدات الحماية', description: 'Bulk supply of surgical consumables, gloves, masks, and personal protective equipment.', descriptionAr: 'توريد بالجملة للمستهلكات الجراحية والقفازات والكمامات ومعدات الحماية.', category: 'Consumables', categoryAr: 'مستهلكات', priceType: 'Per Unit', priceRange: 'Varies by product', priceRangeAr: 'يختلف حسب المنتج', deliveryTime: '3–7 business days', deliveryTimeAr: '3–7 أيام عمل', tags: ['PPE', 'Consumables'], tagsAr: ['حماية', 'مستهلكات'] },
    ],
  },
  {
    id: 'sup-007', companyName: 'Tastemakers Catering', companyNameAr: 'تيست ميكرز للتموين', sector: 'Food & Beverage', sectorAr: 'الأغذية والمشروبات',
    description: 'Premium corporate catering and event food service company providing bespoke menus for business events, staff cafeterias, and executive dining.',
    descriptionAr: 'شركة تموين مؤسسي متميزة تقدم قوائم طعام مخصصة للفعاليات التجارية وكافتيريات الموظفين.',
    isGoldenVendor: false, memberTier: 'Standard', location: 'Mussafah', locationAr: 'المصفح',
    establishedYear: 2017, employeeCount: '100–200', rating: 4.6, reviewCount: 56,
    tags: ['Catering', 'Events', 'Corporate', 'Halal'], tagsAr: ['تموين', 'فعاليات', 'مؤسسي', 'حلال'],
    contactEmail: 'events@tastemakers.ae', responseTime: 'Within 12 hours', responseTimeAr: 'خلال 12 ساعة', completedDeals: 320,
    catalogItems: [
      { id: 'cat-007-1', title: 'Corporate Event Catering', titleAr: 'تموين الفعاليات المؤسسية', description: 'Full-service catering for conferences, gala dinners, and corporate events up to 1,000 guests.', descriptionAr: 'تموين شامل للمؤتمرات وحفلات العشاء والفعاليات المؤسسية.', category: 'Catering', categoryAr: 'تموين', priceType: 'Per Unit', priceRange: 'AED 120–350/person', priceRangeAr: '120–350 درهم/شخص', deliveryTime: '5–14 days notice', deliveryTimeAr: '5–14 يوم إشعار', tags: ['Events', 'Catering'], tagsAr: ['فعاليات', 'تموين'] },
      { id: 'cat-007-2', title: 'Staff Cafeteria Management', titleAr: 'إدارة كافتيريا الموظفين', description: 'Monthly cafeteria operation with daily rotating menus and dietary accommodation.', descriptionAr: 'تشغيل كافتيريا شهري مع قوائم يومية متنوعة ومراعاة الأنظمة الغذائية.', category: 'Cafeteria', categoryAr: 'كافتيريا', priceType: 'Per Unit', priceRange: 'AED 18–35/meal', priceRangeAr: '18–35 درهم/وجبة', deliveryTime: 'Contract basis', deliveryTimeAr: 'على أساس تعاقدي', tags: ['Cafeteria', 'Daily'], tagsAr: ['كافتيريا', 'يومي'] },
    ],
  },
  {
    id: 'sup-008', companyName: 'Sentinel Security', companyNameAr: 'سنتينل للأمن', sector: 'Security Services', sectorAr: 'خدمات الأمن',
    description: 'Licensed security solutions provider offering manned guarding, CCTV surveillance, access control systems, and risk assessment for commercial and government facilities.',
    descriptionAr: 'مزود حلول أمنية مرخص يقدم خدمات الحراسة والمراقبة بالكاميرات وأنظمة التحكم بالدخول.',
    isGoldenVendor: true, memberTier: 'Premium', location: 'Mussafah', locationAr: 'المصفح',
    establishedYear: 2009, employeeCount: '1000+', rating: 4.7, reviewCount: 49,
    tags: ['Security', 'CCTV', 'Guards', 'Access Control'], tagsAr: ['أمن', 'كاميرات', 'حراسة'],
    contactEmail: 'contracts@sentinel.ae', responseTime: 'Within 24 hours', responseTimeAr: 'خلال 24 ساعة', completedDeals: 156,
    catalogItems: [
      { id: 'cat-008-1', title: 'Manned Security Services', titleAr: 'خدمات الحراسة', description: 'Trained security personnel for offices, events, and residential compounds.', descriptionAr: 'أفراد أمن مدربون للمكاتب والفعاليات والمجمعات السكنية.', category: 'Guarding', categoryAr: 'حراسة', priceType: 'Per Unit', priceRange: 'AED 4,500–7,000/guard/month', priceRangeAr: '4,500–7,000 درهم/حارس/شهر', deliveryTime: '7–14 days', deliveryTimeAr: '7–14 يوم', tags: ['Guards', 'Manned'], tagsAr: ['حراسة'] },
      { id: 'cat-008-2', title: 'CCTV & Surveillance Systems', titleAr: 'أنظمة المراقبة بالكاميرات', description: 'IP camera installation, monitoring setup, and integration with building management systems.', descriptionAr: 'تركيب كاميرات IP وإعداد المراقبة والتكامل مع أنظمة إدارة المباني.', category: 'Surveillance', categoryAr: 'مراقبة', priceType: 'Fixed', priceRange: 'AED 15,000–80,000', priceRangeAr: '15,000–80,000 درهم', deliveryTime: '2–4 weeks', deliveryTimeAr: '2–4 أسابيع', tags: ['CCTV', 'Surveillance'], tagsAr: ['كاميرات', 'مراقبة'] },
      { id: 'cat-008-3', title: 'Risk Assessment & Security Audit', titleAr: 'تقييم المخاطر والتدقيق الأمني', description: 'Comprehensive threat assessment and security recommendations for facilities.', descriptionAr: 'تقييم شامل للتهديدات وتوصيات أمنية للمنشآت.', category: 'Consulting', categoryAr: 'استشارات', priceType: 'Fixed', priceRange: 'AED 8,000–25,000', priceRangeAr: '8,000–25,000 درهم', deliveryTime: '1–2 weeks', deliveryTimeAr: '1–2 أسبوع', tags: ['Risk', 'Audit'], tagsAr: ['مخاطر', 'تدقيق'] },
    ],
  },
  {
    id: 'sup-009', companyName: 'BrightSpark Media', companyNameAr: 'برايت سبارك ميديا', sector: 'Marketing & Media', sectorAr: 'التسويق والإعلام',
    description: 'Creative agency specializing in brand strategy, digital marketing, content production, and social media management for B2B and government clients.',
    descriptionAr: 'وكالة إبداعية متخصصة في استراتيجية العلامة التجارية والتسويق الرقمي وإنتاج المحتوى.',
    isGoldenVendor: false, memberTier: 'Standard', location: 'Al Maryah Island', locationAr: 'جزيرة المارية',
    establishedYear: 2018, employeeCount: '20–50', rating: 4.8, reviewCount: 33,
    tags: ['Marketing', 'Digital', 'Branding', 'Social Media'], tagsAr: ['تسويق', 'رقمي', 'علامة تجارية'],
    contactEmail: 'hello@brightspark.ae', responseTime: 'Within 24 hours', responseTimeAr: 'خلال 24 ساعة', completedDeals: 88,
    catalogItems: [
      { id: 'cat-009-1', title: 'Brand Identity & Strategy', titleAr: 'هوية واستراتيجية العلامة التجارية', description: 'Complete brand development including logo, guidelines, messaging, and launch strategy.', descriptionAr: 'تطوير شامل للعلامة التجارية يشمل الشعار والإرشادات والرسائل.', category: 'Branding', categoryAr: 'علامة تجارية', priceType: 'Fixed', priceRange: 'AED 25,000–80,000', priceRangeAr: '25,000–80,000 درهم', deliveryTime: '4–8 weeks', deliveryTimeAr: '4–8 أسابيع', tags: ['Brand', 'Identity'], tagsAr: ['علامة تجارية'] },
      { id: 'cat-009-2', title: 'Digital Marketing Campaign', titleAr: 'حملة تسويق رقمي', description: 'Multi-channel digital campaigns across Google, Meta, LinkedIn, and TikTok with analytics.', descriptionAr: 'حملات رقمية متعددة القنوات عبر جوجل وميتا ولينكد إن مع تحليلات.', category: 'Digital Marketing', categoryAr: 'تسويق رقمي', priceType: 'Per Unit', priceRange: 'AED 10,000–50,000/month', priceRangeAr: '10,000–50,000 درهم/شهر', deliveryTime: 'Monthly retainer', deliveryTimeAr: 'اشتراك شهري', tags: ['Digital', 'Campaigns'], tagsAr: ['رقمي', 'حملات'] },
      { id: 'cat-009-3', title: 'Video Production', titleAr: 'إنتاج الفيديو', description: 'Corporate video production including scripting, filming, editing, and motion graphics.', descriptionAr: 'إنتاج فيديو مؤسسي يشمل الكتابة والتصوير والمونتاج والرسوم المتحركة.', category: 'Production', categoryAr: 'إنتاج', priceType: 'Fixed', priceRange: 'AED 15,000–60,000', priceRangeAr: '15,000–60,000 درهم', deliveryTime: '2–6 weeks', deliveryTimeAr: '2–6 أسابيع', tags: ['Video', 'Production'], tagsAr: ['فيديو', 'إنتاج'] },
    ],
  },
  {
    id: 'sup-010', companyName: 'Apex Engineering', companyNameAr: 'أبكس للهندسة', sector: 'Engineering', sectorAr: 'الهندسة',
    description: 'Multi-disciplinary engineering consultancy providing structural, civil, and environmental engineering services for projects across Abu Dhabi.',
    descriptionAr: 'شركة استشارات هندسية متعددة التخصصات تقدم خدمات هندسية إنشائية ومدنية وبيئية.',
    isGoldenVendor: false, memberTier: 'Standard', location: 'Khalifa City', locationAr: 'مدينة خليفة',
    establishedYear: 2013, employeeCount: '50–100', rating: 4.5, reviewCount: 28,
    tags: ['Engineering', 'Structural', 'Civil', 'Environmental'], tagsAr: ['هندسة', 'إنشائي', 'مدني'],
    contactEmail: 'projects@apexeng.ae', responseTime: 'Within 48 hours', responseTimeAr: 'خلال 48 ساعة', completedDeals: 62,
    catalogItems: [
      { id: 'cat-010-1', title: 'Structural Engineering Design', titleAr: 'التصميم الهندسي الإنشائي', description: 'Structural analysis and design for buildings, bridges, and industrial facilities.', descriptionAr: 'تحليل وتصميم إنشائي للمباني والجسور والمنشآت الصناعية.', category: 'Structural', categoryAr: 'إنشائي', priceType: 'Negotiable', priceRange: 'AED 30,000–200,000', priceRangeAr: '30,000–200,000 درهم', deliveryTime: '4–12 weeks', deliveryTimeAr: '4–12 أسبوع', tags: ['Structural', 'Design'], tagsAr: ['إنشائي', 'تصميم'] },
      { id: 'cat-010-2', title: 'Environmental Impact Assessment', titleAr: 'تقييم الأثر البيئي', description: 'EIA studies and environmental compliance consulting for development projects.', descriptionAr: 'دراسات تقييم الأثر البيئي واستشارات الامتثال البيئي لمشاريع التطوير.', category: 'Environmental', categoryAr: 'بيئي', priceType: 'Fixed', priceRange: 'AED 20,000–60,000', priceRangeAr: '20,000–60,000 درهم', deliveryTime: '3–6 weeks', deliveryTimeAr: '3–6 أسابيع', tags: ['EIA', 'Environmental'], tagsAr: ['بيئي', 'تقييم'] },
    ],
  },
  {
    id: 'sup-011', companyName: 'Al Adl Legal Consultants', companyNameAr: 'العدل للاستشارات القانونية', sector: 'Legal Services', sectorAr: 'الخدمات القانونية',
    description: 'Boutique legal firm specializing in commercial law, corporate structuring, intellectual property, and dispute resolution for businesses in the UAE.',
    descriptionAr: 'مكتب قانوني متخصص في القانون التجاري وهيكلة الشركات والملكية الفكرية وحل النزاعات.',
    isGoldenVendor: false, memberTier: 'Premium', location: 'ADGM', locationAr: 'سوق أبوظبي العالمي',
    establishedYear: 2010, employeeCount: '20–50', rating: 4.8, reviewCount: 31,
    tags: ['Legal', 'Corporate', 'IP', 'Dispute Resolution'], tagsAr: ['قانوني', 'شركات', 'ملكية فكرية'],
    contactEmail: 'consult@aladl-legal.ae', responseTime: 'Within 24 hours', responseTimeAr: 'خلال 24 ساعة', completedDeals: 54,
    catalogItems: [
      { id: 'cat-011-1', title: 'Corporate Structuring & Setup', titleAr: 'هيكلة وتأسيس الشركات', description: 'Company formation, licensing, and corporate governance advisory for mainland and free zone entities.', descriptionAr: 'تأسيس الشركات والترخيص واستشارات الحوكمة المؤسسية.', category: 'Corporate', categoryAr: 'شركات', priceType: 'Fixed', priceRange: 'AED 10,000–35,000', priceRangeAr: '10,000–35,000 درهم', deliveryTime: '2–4 weeks', deliveryTimeAr: '2–4 أسابيع', tags: ['Corporate', 'Setup'], tagsAr: ['شركات', 'تأسيس'] },
      { id: 'cat-011-2', title: 'Contract Review & Drafting', titleAr: 'مراجعة وصياغة العقود', description: 'Review, drafting, and negotiation of commercial contracts, NDAs, and partnership agreements.', descriptionAr: 'مراجعة وصياغة والتفاوض على العقود التجارية واتفاقيات الشراكة.', category: 'Contracts', categoryAr: 'عقود', priceType: 'Fixed', priceRange: 'AED 3,000–15,000', priceRangeAr: '3,000–15,000 درهم', deliveryTime: '3–7 business days', deliveryTimeAr: '3–7 أيام عمل', tags: ['Contracts', 'Legal'], tagsAr: ['عقود', 'قانوني'] },
      { id: 'cat-011-3', title: 'IP Registration & Protection', titleAr: 'تسجيل وحماية الملكية الفكرية', description: 'Trademark registration, patent filing, and IP portfolio management across GCC jurisdictions.', descriptionAr: 'تسجيل العلامات التجارية وتقديم براءات الاختراع وإدارة محفظة الملكية الفكرية.', category: 'IP', categoryAr: 'ملكية فكرية', priceType: 'Fixed', priceRange: 'AED 5,000–20,000', priceRangeAr: '5,000–20,000 درهم', deliveryTime: '4–12 weeks', deliveryTimeAr: '4–12 أسبوع', tags: ['IP', 'Trademark'], tagsAr: ['ملكية فكرية', 'علامة تجارية'] },
    ],
  },
  {
    id: 'sup-012', companyName: 'CloudBridge Systems', companyNameAr: 'كلاود بريدج سيستمز', sector: 'IT Services', sectorAr: 'خدمات تقنية المعلومات',
    description: 'Managed IT services provider specializing in network infrastructure, help desk support, and IT outsourcing for small and medium enterprises.',
    descriptionAr: 'مزود خدمات تقنية معلومات مُدارة متخصص في البنية التحتية للشبكات ودعم مكتب المساعدة.',
    isGoldenVendor: false, memberTier: 'Standard', location: 'Masdar City', locationAr: 'مدينة مصدر',
    establishedYear: 2019, employeeCount: '20–50', rating: 4.4, reviewCount: 22,
    tags: ['IT Support', 'Network', 'Managed Services', 'SME'], tagsAr: ['دعم تقني', 'شبكات', 'خدمات مدارة'],
    contactEmail: 'support@cloudbridge.ae', responseTime: 'Within 4 hours', responseTimeAr: 'خلال 4 ساعات', completedDeals: 47,
    catalogItems: [
      { id: 'cat-012-1', title: 'Managed IT Support', titleAr: 'دعم تقنية معلومات مُدار', description: 'Monthly IT support packages with SLA-backed help desk, remote monitoring, and onsite support.', descriptionAr: 'باقات دعم تقني شهرية مع مكتب مساعدة ومراقبة عن بعد ودعم ميداني.', category: 'IT Support', categoryAr: 'دعم تقني', priceType: 'Per Unit', priceRange: 'AED 3,000–12,000/month', priceRangeAr: '3,000–12,000 درهم/شهر', deliveryTime: 'Immediate', deliveryTimeAr: 'فوري', tags: ['Support', 'SLA'], tagsAr: ['دعم'] },
      { id: 'cat-012-2', title: 'Network Infrastructure Setup', titleAr: 'إعداد البنية التحتية للشبكة', description: 'Design and deployment of LAN/WAN networks, Wi-Fi, and VPN infrastructure.', descriptionAr: 'تصميم ونشر شبكات LAN/WAN وWi-Fi والبنية التحتية لـ VPN.', category: 'Network', categoryAr: 'شبكات', priceType: 'Fixed', priceRange: 'AED 10,000–50,000', priceRangeAr: '10,000–50,000 درهم', deliveryTime: '1–3 weeks', deliveryTimeAr: '1–3 أسابيع', tags: ['Network', 'Infrastructure'], tagsAr: ['شبكات', 'بنية تحتية'] },
    ],
  },
  {
    id: 'sup-013', companyName: 'GreenBuild Contractors', companyNameAr: 'جرين بيلد للمقاولات', sector: 'Construction', sectorAr: 'البناء والتشييد',
    description: 'Sustainable construction company specializing in green building practices, LEED-certified projects, and solar installation for commercial and residential properties.',
    descriptionAr: 'شركة بناء مستدامة متخصصة في ممارسات البناء الأخضر والمشاريع المعتمدة من LEED.',
    isGoldenVendor: false, memberTier: 'Standard', location: 'Khalifa City', locationAr: 'مدينة خليفة',
    establishedYear: 2020, employeeCount: '50–100', rating: 4.3, reviewCount: 18,
    tags: ['Green Building', 'LEED', 'Solar', 'Sustainable'], tagsAr: ['بناء أخضر', 'مستدام', 'طاقة شمسية'],
    contactEmail: 'info@greenbuild.ae', responseTime: 'Within 48 hours', responseTimeAr: 'خلال 48 ساعة', completedDeals: 31,
    catalogItems: [
      { id: 'cat-013-1', title: 'LEED Certification Consulting', titleAr: 'استشارات شهادة LEED', description: 'End-to-end LEED certification support from design review to final certification.', descriptionAr: 'دعم شامل لشهادة LEED من مراجعة التصميم إلى الشهادة النهائية.', category: 'Sustainability', categoryAr: 'استدامة', priceType: 'Fixed', priceRange: 'AED 40,000–120,000', priceRangeAr: '40,000–120,000 درهم', deliveryTime: '12–24 weeks', deliveryTimeAr: '12–24 أسبوع', tags: ['LEED', 'Green'], tagsAr: ['شهادة LEED'] },
      { id: 'cat-013-2', title: 'Solar Panel Installation', titleAr: 'تركيب الألواح الشمسية', description: 'Commercial and residential solar PV system design, supply, and installation.', descriptionAr: 'تصميم وتوريد وتركيب أنظمة الطاقة الشمسية للمباني التجارية والسكنية.', category: 'Solar', categoryAr: 'طاقة شمسية', priceType: 'Per Unit', priceRange: 'AED 3,500–5,000/kW', priceRangeAr: '3,500–5,000 درهم/كيلوواط', deliveryTime: '4–8 weeks', deliveryTimeAr: '4–8 أسابيع', tags: ['Solar', 'Installation'], tagsAr: ['طاقة شمسية', 'تركيب'] },
    ],
  },
]

// ─── Procurement Requests (12) ──────────────────────────────────────────────

export const allProcurementRequests: ProcurementRequest[] = [
  {
    id: 'pr-001', title: 'Enterprise Cloud Migration & Managed Services', titleAr: 'ترحيل مؤسسي للسحابة وخدمات مُدارة',
    postedBy: 'Abu Dhabi Holding Company', postedByAr: 'شركة أبوظبي القابضة',
    sector: 'IT Services', sectorAr: 'خدمات تقنية المعلومات',
    description: 'Seeking a qualified IT vendor to migrate our legacy on-premise infrastructure to a hybrid cloud environment and provide ongoing managed services with 24/7 SLA support.',
    descriptionAr: 'نبحث عن مزود خدمات تقنية مؤهل لترحيل بنيتنا التحتية المحلية إلى بيئة سحابية هجينة وتقديم خدمات مُدارة مستمرة.',
    requirements: ['ISO 27001 certification', 'Minimum 5 years cloud migration experience', 'AWS or Azure Advanced Partner status', '24/7 NOC capability'],
    requirementsAr: ['شهادة ISO 27001', 'خبرة 5 سنوات في ترحيل السحابة', 'شريك متقدم AWS أو Azure', 'مركز عمليات شبكة 24/7'],
    budget: 'AED 500,000+', budgetAr: 'أكثر من 500,000 درهم', deadline: '2025-04-15', status: 'Open', proposalCount: 8, postedDate: '2025-02-20',
    tags: ['Cloud', 'Migration', 'Managed Services'], tagsAr: ['سحابة', 'ترحيل', 'خدمات مدارة'], isUrgent: true,
  },
  {
    id: 'pr-002', title: 'Office Interior Fit-out — New HQ (15,000 sqm)', titleAr: 'تشطيبات داخلية للمقر الجديد (15,000 م²)',
    postedBy: 'Gulf Capital Partners', postedByAr: 'شركاء الخليج كابيتال',
    sector: 'Construction', sectorAr: 'البناء والتشييد',
    description: 'Looking for experienced fit-out contractors to deliver a premium Grade A office interior for our new headquarters in Al Maryah Island, including furniture, AV systems, and smart office integration.',
    descriptionAr: 'نبحث عن مقاولي تشطيبات ذوي خبرة لتنفيذ تشطيبات داخلية متميزة من الدرجة الأولى لمقرنا الجديد.',
    requirements: ['Portfolio of 3+ similar projects', 'LEED-compliant materials', 'BIM coordination capability', 'AED 10M+ bonding capacity'],
    requirementsAr: ['ملف أعمال لـ 3+ مشاريع مماثلة', 'مواد متوافقة مع LEED', 'قدرة تنسيق BIM', 'قدرة ضمان 10+ مليون درهم'],
    budget: 'AED 100,000–500,000', budgetAr: '100,000–500,000 درهم', deadline: '2025-03-30', status: 'Open', proposalCount: 14, postedDate: '2025-02-15',
    tags: ['Fit-out', 'Office', 'Interior', 'Smart Office'], tagsAr: ['تشطيبات', 'مكتب', 'ذكي'], isUrgent: false,
  },
  {
    id: 'pr-003', title: 'Annual Corporate Catering Contract', titleAr: 'عقد تموين مؤسسي سنوي',
    postedBy: 'Etihad Credit Insurance', postedByAr: 'الاتحاد لائتمان الصادرات',
    sector: 'Food & Beverage', sectorAr: 'الأغذية والمشروبات',
    description: 'Seeking proposals for a 12-month corporate catering contract covering daily staff meals (200+ employees) and quarterly event catering at our Abu Dhabi office.',
    descriptionAr: 'نطلب عروضاً لعقد تموين مؤسسي لمدة 12 شهراً يغطي وجبات الموظفين اليومية (200+ موظف) وتموين الفعاليات الفصلية.',
    requirements: ['HACCP certified kitchen', 'Halal certification', 'Experience with 200+ daily meals', 'Menu diversity including dietary options'],
    requirementsAr: ['مطبخ حاصل على شهادة HACCP', 'شهادة حلال', 'خبرة في 200+ وجبة يومية', 'تنوع في القوائم'],
    budget: 'AED 50,000–100,000', budgetAr: '50,000–100,000 درهم', deadline: '2025-03-15', status: 'In Review', proposalCount: 6, postedDate: '2025-02-10',
    tags: ['Catering', 'Corporate', 'Annual', 'Halal'], tagsAr: ['تموين', 'مؤسسي', 'سنوي'], isUrgent: false,
  },
  {
    id: 'pr-004', title: 'Integrated Security System Upgrade', titleAr: 'تطوير نظام أمني متكامل',
    postedBy: 'ADNEC Group', postedByAr: 'مجموعة أدنيك',
    sector: 'Security Services', sectorAr: 'خدمات الأمن',
    description: 'Upgrading the security infrastructure across 3 exhibition halls and the surrounding campus, including AI-powered CCTV, biometric access control, and centralized command center.',
    descriptionAr: 'تطوير البنية التحتية الأمنية عبر 3 قاعات معارض والحرم المحيط بها بما في ذلك كاميرات بالذكاء الاصطناعي.',
    requirements: ['SIRA approved', 'AI-based video analytics experience', 'Integration with existing BMS', 'Project completion within 90 days'],
    requirementsAr: ['معتمد من سيرا', 'خبرة في تحليلات الفيديو بالذكاء الاصطناعي', 'تكامل مع نظام إدارة المبنى', 'إنجاز المشروع خلال 90 يوماً'],
    budget: 'AED 100,000–500,000', budgetAr: '100,000–500,000 درهم', deadline: '2025-04-01', status: 'Open', proposalCount: 5, postedDate: '2025-02-18',
    tags: ['Security', 'CCTV', 'AI', 'Access Control'], tagsAr: ['أمن', 'كاميرات', 'تحكم بالدخول'], isUrgent: true,
  },
  {
    id: 'pr-005', title: 'Digital Marketing Agency Retainer', titleAr: 'عقد وكالة تسويق رقمي',
    postedBy: 'Al Fahim Group', postedByAr: 'مجموعة الفهيم',
    sector: 'Marketing & Media', sectorAr: 'التسويق والإعلام',
    description: 'Looking for a full-service digital marketing agency to manage our online presence across 5 business units including SEO, paid media, content creation, and social media management.',
    descriptionAr: 'نبحث عن وكالة تسويق رقمي شاملة لإدارة حضورنا عبر الإنترنت عبر 5 وحدات أعمال.',
    requirements: ['Proven B2B marketing portfolio', 'Arabic and English content capability', 'Google Partner certified', 'Monthly reporting dashboard'],
    requirementsAr: ['ملف تسويق B2B مثبت', 'قدرة محتوى عربي وإنجليزي', 'شريك معتمد من جوجل', 'لوحة تقارير شهرية'],
    budget: 'AED 25,000–50,000', budgetAr: '25,000–50,000 درهم', deadline: '2025-03-25', status: 'Open', proposalCount: 11, postedDate: '2025-02-12',
    tags: ['Digital', 'Marketing', 'SEO', 'Social Media'], tagsAr: ['رقمي', 'تسويق', 'وسائل التواصل'], isUrgent: false,
  },
  {
    id: 'pr-006', title: 'Legal Advisory — Joint Venture Structuring', titleAr: 'استشارة قانونية — هيكلة مشروع مشترك',
    postedBy: 'Mubadala Investment Company', postedByAr: 'شركة مبادلة للاستثمار',
    sector: 'Legal Services', sectorAr: 'الخدمات القانونية',
    description: 'Require a law firm with UAE commercial law expertise to advise on the structuring of a joint venture between a UAE entity and an international partner in the renewable energy sector.',
    descriptionAr: 'نحتاج مكتب محاماة خبير في القانون التجاري الإماراتي لتقديم المشورة بشأن هيكلة مشروع مشترك.',
    requirements: ['10+ years UAE commercial law', 'JV structuring experience', 'Energy sector knowledge', 'ADGM and DIFC licensed'],
    requirementsAr: ['10+ سنوات في القانون التجاري الإماراتي', 'خبرة في هيكلة المشاريع المشتركة', 'معرفة بقطاع الطاقة'],
    budget: 'AED 50,000–100,000', budgetAr: '50,000–100,000 درهم', deadline: '2025-03-20', status: 'Open', proposalCount: 4, postedDate: '2025-02-22',
    tags: ['Legal', 'Joint Venture', 'Energy', 'Corporate'], tagsAr: ['قانوني', 'مشروع مشترك', 'طاقة'], isUrgent: false,
  },
  {
    id: 'pr-007', title: 'Warehouse & Logistics Services — E-commerce Fulfillment', titleAr: 'خدمات مستودعات ولوجستيات — تلبية التجارة الإلكترونية',
    postedBy: 'Noon.com', postedByAr: 'نون.كوم',
    sector: 'Logistics', sectorAr: 'الخدمات اللوجستية',
    description: 'Seeking a 3PL partner for warehousing and last-mile delivery of consumer electronics and FMCG products across Abu Dhabi, with real-time inventory management.',
    descriptionAr: 'نبحث عن شريك 3PL للتخزين والتوصيل للميل الأخير للإلكترونيات والسلع الاستهلاكية في أبوظبي.',
    requirements: ['5,000+ sqm warehouse capacity in Abu Dhabi', 'WMS integration (API-based)', 'Same-day delivery capability', 'Temperature-controlled storage'],
    requirementsAr: ['سعة مستودع 5,000+ م² في أبوظبي', 'تكامل WMS', 'قدرة التوصيل في نفس اليوم', 'تخزين بتحكم حراري'],
    budget: 'AED 100,000–500,000', budgetAr: '100,000–500,000 درهم', deadline: '2025-04-10', status: 'Open', proposalCount: 7, postedDate: '2025-02-25',
    tags: ['Logistics', 'E-commerce', 'Warehousing', '3PL'], tagsAr: ['لوجستيات', 'تجارة إلكترونية', 'تخزين'], isUrgent: true,
  },
  {
    id: 'pr-008', title: 'Facility Management — Mixed-Use Development', titleAr: 'إدارة مرافق — مشروع متعدد الاستخدامات',
    postedBy: 'Aldar Properties', postedByAr: 'الدار العقارية',
    sector: 'Facility Management', sectorAr: 'إدارة المرافق',
    description: 'Tender for integrated facility management services for a 120,000 sqm mixed-use development including residential towers, retail podium, and underground parking.',
    descriptionAr: 'مناقصة لخدمات إدارة مرافق متكاملة لمشروع متعدد الاستخدامات بمساحة 120,000 م².',
    requirements: ['ISO 41001 certified', '5+ years managing similar developments', 'Dedicated BMS team', '500+ FM staff deployment capacity'],
    requirementsAr: ['حاصل على ISO 41001', '5+ سنوات في إدارة مشاريع مماثلة', 'فريق BMS مخصص', 'قدرة نشر 500+ موظف'],
    budget: 'AED 500,000+', budgetAr: 'أكثر من 500,000 درهم', deadline: '2025-04-20', status: 'Open', proposalCount: 3, postedDate: '2025-02-26',
    tags: ['FM', 'Mixed-Use', 'Residential', 'Retail'], tagsAr: ['إدارة مرافق', 'متعدد الاستخدامات'], isUrgent: false,
  },
  {
    id: 'pr-009', title: 'Strategic Business Consulting — Market Expansion', titleAr: 'استشارات أعمال استراتيجية — التوسع في السوق',
    postedBy: 'Presight AI', postedByAr: 'بريسايت',
    sector: 'Consulting', sectorAr: 'الاستشارات',
    description: 'Engaging a strategy consulting firm to assess and develop a market expansion plan for our AI solutions across 3 new GCC markets.',
    descriptionAr: 'نبحث عن شركة استشارات استراتيجية لتقييم وتطوير خطة توسع سوقي لحلول الذكاء الاصطناعي عبر 3 أسواق خليجية جديدة.',
    requirements: ['GCC market expertise', 'Technology sector focus', 'C-suite advisory experience', 'Arabic-speaking team members'],
    requirementsAr: ['خبرة في أسواق الخليج', 'تركيز على قطاع التكنولوجيا', 'خبرة استشارية للإدارة العليا', 'أعضاء فريق ناطقون بالعربية'],
    budget: 'AED 100,000–500,000', budgetAr: '100,000–500,000 درهم', deadline: '2025-03-28', status: 'In Review', proposalCount: 9, postedDate: '2025-02-08',
    tags: ['Strategy', 'Expansion', 'GCC', 'AI'], tagsAr: ['استراتيجية', 'توسع', 'خليج', 'ذكاء اصطناعي'], isUrgent: false,
  },
  {
    id: 'pr-010', title: 'Medical Equipment Procurement — New Clinic Setup', titleAr: 'شراء معدات طبية — إعداد عيادة جديدة',
    postedBy: 'VPS Healthcare', postedByAr: 'في بي إس للرعاية الصحية',
    sector: 'Healthcare Supplies', sectorAr: 'المستلزمات الطبية',
    description: 'Procuring diagnostic imaging equipment, patient monitoring systems, and surgical instruments for a new 50-bed polyclinic opening in Khalifa City.',
    descriptionAr: 'شراء أجهزة تصوير تشخيصي وأنظمة مراقبة المرضى وأدوات جراحية لعيادة متعددة التخصصات جديدة.',
    requirements: ['FDA/CE approved equipment', 'Installation and training included', 'Minimum 2-year warranty', 'After-sales service agreement'],
    requirementsAr: ['معدات معتمدة من FDA/CE', 'التركيب والتدريب مشمول', 'ضمان سنتين كحد أدنى', 'اتفاقية خدمة ما بعد البيع'],
    budget: 'AED 500,000+', budgetAr: 'أكثر من 500,000 درهم', deadline: '2025-05-01', status: 'Open', proposalCount: 2, postedDate: '2025-02-24',
    tags: ['Medical', 'Equipment', 'Diagnostic', 'Clinic'], tagsAr: ['طبي', 'معدات', 'تشخيصي', 'عيادة'], isUrgent: false,
  },
  {
    id: 'pr-011', title: 'Corporate Branding & Website Redesign', titleAr: 'إعادة تصميم العلامة التجارية والموقع الإلكتروني',
    postedBy: 'Abu Dhabi Ports', postedByAr: 'موانئ أبوظبي',
    sector: 'Marketing & Media', sectorAr: 'التسويق والإعلام',
    description: 'Complete corporate rebrand including visual identity refresh, brand guidelines, and responsive website redesign with Arabic/English CMS.',
    descriptionAr: 'إعادة تسمية مؤسسية كاملة تشمل تحديث الهوية البصرية وإرشادات العلامة التجارية وإعادة تصميم الموقع الإلكتروني.',
    requirements: ['10+ years branding experience', 'Bilingual design capability', 'CMS development (headless preferred)', 'Brand launch event support'],
    requirementsAr: ['10+ سنوات خبرة في العلامات التجارية', 'قدرة تصميم ثنائية اللغة', 'تطوير CMS', 'دعم فعالية إطلاق العلامة'],
    budget: 'AED 100,000–500,000', budgetAr: '100,000–500,000 درهم', deadline: '2025-04-30', status: 'Closed', proposalCount: 16, postedDate: '2025-01-15',
    tags: ['Branding', 'Website', 'CMS', 'Design'], tagsAr: ['علامة تجارية', 'موقع', 'تصميم'], isUrgent: false,
  },
  {
    id: 'pr-012', title: 'Engineering Consultancy — Solar Farm EIA', titleAr: 'استشارات هندسية — تقييم أثر بيئي لمزرعة شمسية',
    postedBy: 'Masdar', postedByAr: 'مصدر',
    sector: 'Engineering', sectorAr: 'الهندسة',
    description: 'Require an environmental engineering consultancy to conduct a full Environmental Impact Assessment for a planned 200MW solar PV farm in the Al Dhafra region.',
    descriptionAr: 'نحتاج استشارات هندسية بيئية لإجراء تقييم أثر بيئي كامل لمزرعة طاقة شمسية مخططة بقدرة 200 ميجاواط.',
    requirements: ['EAD-accredited assessors', 'Solar project EIA experience', 'Ecological survey capability', 'Report in English and Arabic'],
    requirementsAr: ['مقيمون معتمدون من هيئة البيئة', 'خبرة في تقييمات المشاريع الشمسية', 'قدرة المسح البيئي', 'تقرير بالإنجليزية والعربية'],
    budget: 'AED 50,000–100,000', budgetAr: '50,000–100,000 درهم', deadline: '2025-04-05', status: 'Open', proposalCount: 3, postedDate: '2025-02-27',
    tags: ['EIA', 'Solar', 'Environmental', 'Engineering'], tagsAr: ['تقييم بيئي', 'طاقة شمسية', 'هندسة'], isUrgent: false,
  },
]
