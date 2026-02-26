// ─── Flagship & Sectorial Reports Seed Data ────────────────────────────────
// ADCCI-authored reports: annual flagship publications and sector-specific deep dives

export interface FlagshipReport {
  id: string
  type: 'Flagship'
  title: string
  titleAr: string
  edition: string
  editionAr: string
  coverImageUrl: string
  summary: string
  summaryAr: string
  keyFindings: string[]
  keyFindingsAr: string[]
  publishedDate: string
  pageCount: number
  fileSize: string
  downloadUrl: string
  language: 'English' | 'Arabic' | 'Bilingual'
  isFeatured: true
  tags: string[]
  tagsAr: string[]
  downloads: number
}

export interface SectorialReport {
  id: string
  type: 'Sectorial'
  sector: string
  sectorAr: string
  title: string
  titleAr: string
  edition: string
  editionAr: string
  coverImageUrl: string
  summary: string
  summaryAr: string
  keyFindings: string[]
  keyFindingsAr: string[]
  publishedDate: string
  pageCount: number
  fileSize: string
  downloadUrl: string
  language: 'English' | 'Arabic' | 'Bilingual'
  isFeatured: boolean
  tags: string[]
  tagsAr: string[]
  downloads: number
}

export type Report = FlagshipReport | SectorialReport

// ─── Sectors ────────────────────────────────────────────────────────────────

export const sectors = [
  'Energy & Utilities',
  'Real Estate & Construction',
  'Financial Services',
  'Healthcare & Life Sciences',
  'Technology & Innovation',
  'Tourism & Hospitality',
  'Manufacturing & Industry',
  'Transportation & Logistics',
  'Agriculture & Food Security',
  'Education & Human Capital',
]

export const sectorsAr: Record<string, string> = {
  'Energy & Utilities': 'الطاقة والمرافق',
  'Real Estate & Construction': 'العقارات والبناء',
  'Financial Services': 'الخدمات المالية',
  'Healthcare & Life Sciences': 'الرعاية الصحية وعلوم الحياة',
  'Technology & Innovation': 'التكنولوجيا والابتكار',
  'Tourism & Hospitality': 'السياحة والضيافة',
  'Manufacturing & Industry': 'التصنيع والصناعة',
  'Transportation & Logistics': 'النقل والخدمات اللوجستية',
  'Agriculture & Food Security': 'الزراعة والأمن الغذائي',
  'Education & Human Capital': 'التعليم ورأس المال البشري',
}

export const sectorIcons: Record<string, string> = {
  'Energy & Utilities': '⚡',
  'Real Estate & Construction': '🏗️',
  'Financial Services': '🏦',
  'Healthcare & Life Sciences': '🏥',
  'Technology & Innovation': '💻',
  'Tourism & Hospitality': '✈️',
  'Manufacturing & Industry': '🏭',
  'Transportation & Logistics': '🚢',
  'Agriculture & Food Security': '🌾',
  'Education & Human Capital': '🎓',
}

export const sectorColors: Record<string, { bg: string; text: string; border: string }> = {
  'Energy & Utilities': {
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-500/30',
  },
  'Real Estate & Construction': {
    bg: 'bg-purple-100 dark:bg-purple-500/20',
    text: 'text-purple-800 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-500/30',
  },
  'Financial Services': {
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-500/30',
  },
  'Healthcare & Life Sciences': {
    bg: 'bg-rose-100 dark:bg-rose-500/20',
    text: 'text-rose-800 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-500/30',
  },
  'Technology & Innovation': {
    bg: 'bg-cyan-100 dark:bg-cyan-500/20',
    text: 'text-cyan-800 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-500/30',
  },
  'Tourism & Hospitality': {
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-500/30',
  },
  'Manufacturing & Industry': {
    bg: 'bg-orange-100 dark:bg-orange-500/20',
    text: 'text-orange-800 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-500/30',
  },
  'Transportation & Logistics': {
    bg: 'bg-indigo-100 dark:bg-indigo-500/20',
    text: 'text-indigo-800 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-500/30',
  },
  'Agriculture & Food Security': {
    bg: 'bg-lime-100 dark:bg-lime-500/20',
    text: 'text-lime-800 dark:text-lime-300',
    border: 'border-lime-200 dark:border-lime-500/30',
  },
  'Education & Human Capital': {
    bg: 'bg-teal-100 dark:bg-teal-500/20',
    text: 'text-teal-800 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-500/30',
  },
}

// ─── Language Helpers ───────────────────────────────────────────────────────

export const languages: ('English' | 'Arabic' | 'Bilingual')[] = ['English', 'Arabic', 'Bilingual']

export const languagesAr: Record<string, string> = {
  English: 'إنجليزي',
  Arabic: 'عربي',
  Bilingual: 'ثنائي اللغة',
}

// ─── Year Helpers ───────────────────────────────────────────────────────────

export const years: string[] = ['2025', '2024', '2023']

// ─── Flagship Reports (5) ───────────────────────────────────────────────────

export const flagshipReports: FlagshipReport[] = [
  {
    id: 'fr-001',
    type: 'Flagship',
    title: 'Abu Dhabi Economic Competitiveness Report 2025',
    titleAr: 'تقرير التنافسية الاقتصادية لأبوظبي 2025',
    edition: '2025 Annual Edition',
    editionAr: 'الإصدار السنوي 2025',
    coverImageUrl: '',
    summary: 'A comprehensive assessment of Abu Dhabi\'s economic competitiveness across 12 pillars, benchmarking against 45 global cities. The report examines productivity growth, institutional quality, innovation capacity, and human capital development as key drivers of long-term competitiveness.',
    summaryAr: 'تقييم شامل للتنافسية الاقتصادية لأبوظبي عبر 12 محوراً، مقارنةً بـ 45 مدينة عالمية. يدرس التقرير نمو الإنتاجية وجودة المؤسسات والقدرة على الابتكار وتنمية رأس المال البشري كمحركات رئيسية للتنافسية طويلة المدى.',
    keyFindings: [
      'Abu Dhabi ranks 7th globally for ease of doing business among peer cities',
      'Non-oil GDP contribution reached 52% in 2024, up from 47% in 2022',
      'Foreign direct investment inflows increased 28% year-over-year',
      'Digital infrastructure scored in the top 10 globally for 5G coverage and broadband speed',
      'Talent attraction index improved by 15 points driven by visa reforms and quality-of-life investments',
    ],
    keyFindingsAr: [
      'تحتل أبوظبي المرتبة السابعة عالمياً في سهولة ممارسة الأعمال بين المدن المماثلة',
      'وصلت مساهمة الناتج المحلي غير النفطي إلى 52٪ في 2024، مقارنة بـ 47٪ في 2022',
      'زادت تدفقات الاستثمار الأجنبي المباشر بنسبة 28٪ على أساس سنوي',
      'حصلت البنية التحتية الرقمية على مرتبة ضمن أفضل 10 عالمياً في تغطية 5G وسرعة النطاق العريض',
      'تحسن مؤشر جذب المواهب بمقدار 15 نقطة مدفوعاً بإصلاحات التأشيرات واستثمارات جودة الحياة',
    ],
    publishedDate: '2025-02-15',
    pageCount: 112,
    fileSize: '8.2 MB',
    downloadUrl: '/reports/fr-001.pdf',
    language: 'Bilingual',
    isFeatured: true,
    tags: ['Competitiveness', 'Economic Growth', 'Benchmarking', 'FDI', 'Innovation'],
    tagsAr: ['التنافسية', 'النمو الاقتصادي', 'المقارنة المعيارية', 'الاستثمار الأجنبي', 'الابتكار'],
    downloads: 2340,
  },
  {
    id: 'fr-002',
    type: 'Flagship',
    title: 'ADCCI Annual ESG & Sustainability Landscape Report',
    titleAr: 'تقرير المشهد السنوي للحوكمة البيئية والاجتماعية والمؤسسية والاستدامة',
    edition: '2025 Edition',
    editionAr: 'إصدار 2025',
    coverImageUrl: '',
    summary: 'The definitive guide to ESG adoption across Abu Dhabi\'s private sector. This flagship report maps sustainability practices, measures ESG maturity levels, and provides actionable recommendations for businesses transitioning toward sustainable operations aligned with the UAE Net Zero 2050 strategy.',
    summaryAr: 'الدليل الشامل لتبني الحوكمة البيئية والاجتماعية والمؤسسية عبر القطاع الخاص في أبوظبي. يرسم هذا التقرير الرئيسي خريطة ممارسات الاستدامة ويقيس مستويات نضج ESG ويقدم توصيات عملية للشركات.',
    keyFindings: [
      '67% of surveyed Abu Dhabi firms now have a formal ESG policy, up from 41% in 2022',
      'Carbon reporting adoption doubled among mid-sized companies',
      'Green finance instruments grew 45% reaching AED 12.8 billion in issuances',
      'Supply chain sustainability remains the weakest ESG pillar across all sectors',
    ],
    keyFindingsAr: [
      '67٪ من شركات أبوظبي المستطلعة لديها الآن سياسة ESG رسمية، مقارنة بـ 41٪ في 2022',
      'تضاعف اعتماد الإبلاغ عن الكربون بين الشركات المتوسطة',
      'نمت أدوات التمويل الأخضر بنسبة 45٪ لتصل إلى 12.8 مليار درهم',
      'تظل استدامة سلسلة التوريد أضعف ركيزة ESG عبر جميع القطاعات',
    ],
    publishedDate: '2025-01-20',
    pageCount: 96,
    fileSize: '6.8 MB',
    downloadUrl: '/reports/fr-002.pdf',
    language: 'English',
    isFeatured: true,
    tags: ['ESG', 'Sustainability', 'Net Zero', 'Green Finance', 'Private Sector'],
    tagsAr: ['الحوكمة', 'الاستدامة', 'صافي الصفر', 'التمويل الأخضر', 'القطاع الخاص'],
    downloads: 1890,
  },
  {
    id: 'fr-003',
    type: 'Flagship',
    title: 'State of Abu Dhabi Private Sector Report 2025',
    titleAr: 'تقرير حالة القطاع الخاص في أبوظبي 2025',
    edition: '2025 Annual Edition',
    editionAr: 'الإصدار السنوي 2025',
    coverImageUrl: '',
    summary: 'An in-depth analysis of the private sector ecosystem in Abu Dhabi, covering business formation trends, sectoral employment, revenue growth patterns, and challenges facing SMEs and large enterprises alike. The report draws on ADCCI member survey data and government statistics.',
    summaryAr: 'تحليل معمق لمنظومة القطاع الخاص في أبوظبي، يغطي اتجاهات تأسيس الأعمال والتوظيف القطاعي وأنماط نمو الإيرادات والتحديات التي تواجه المؤسسات الصغيرة والمتوسطة والكبيرة.',
    keyFindings: [
      'Private sector GDP contribution exceeded AED 420 billion for the first time',
      'New business registrations increased 22% with technology sector leading growth',
      'SMEs account for 94% of registered businesses but only 38% of GDP',
      'Workforce nationalization in private sector reached 8.2%, above the 7% target',
      'Access to finance remains the top challenge cited by 62% of SMEs surveyed',
    ],
    keyFindingsAr: [
      'تجاوزت مساهمة القطاع الخاص في الناتج المحلي 420 مليار درهم لأول مرة',
      'زادت تسجيلات الأعمال الجديدة بنسبة 22٪ مع قيادة قطاع التكنولوجيا للنمو',
      'تمثل الشركات الصغيرة والمتوسطة 94٪ من الشركات المسجلة لكن 38٪ فقط من الناتج المحلي',
      'بلغ التوطين في القطاع الخاص 8.2٪ متجاوزاً هدف 7٪',
      'يظل الوصول للتمويل التحدي الأول الذي ذكره 62٪ من الشركات الصغيرة والمتوسطة',
    ],
    publishedDate: '2024-12-10',
    pageCount: 84,
    fileSize: '5.4 MB',
    downloadUrl: '/reports/fr-003.pdf',
    language: 'Bilingual',
    isFeatured: true,
    tags: ['Private Sector', 'SMEs', 'Business Formation', 'Employment', 'GDP'],
    tagsAr: ['القطاع الخاص', 'الشركات الصغيرة والمتوسطة', 'تأسيس الأعمال', 'التوظيف', 'الناتج المحلي'],
    downloads: 1650,
  },
  {
    id: 'fr-004',
    type: 'Flagship',
    title: 'Abu Dhabi Trade & Investment Attractiveness Index',
    titleAr: 'مؤشر جاذبية التجارة والاستثمار في أبوظبي',
    edition: '2024 Edition',
    editionAr: 'إصدار 2024',
    coverImageUrl: '',
    summary: 'The ADCCI Trade & Investment Attractiveness Index measures Abu Dhabi\'s positioning as a global trade and investment hub across 8 dimensions. This edition features enhanced methodology and expanded coverage of bilateral trade corridors with emerging markets.',
    summaryAr: 'يقيس مؤشر جاذبية التجارة والاستثمار مكانة أبوظبي كمركز عالمي للتجارة والاستثمار عبر 8 أبعاد. يتميز هذا الإصدار بمنهجية محسنة وتغطية موسعة لممرات التجارة الثنائية مع الأسواق الناشئة.',
    keyFindings: [
      'Abu Dhabi attracted AED 47 billion in FDI across 340+ projects in 2024',
      'Trade corridors with India, South Korea, and Sub-Saharan Africa expanded by 35%',
      'Free zone occupancy rates averaged 91% across ADGM, KIZAD, and Masdar City',
      'Re-export activity grew 18%, reinforcing Abu Dhabi\'s role as a regional logistics hub',
    ],
    keyFindingsAr: [
      'استقطبت أبوظبي 47 مليار درهم من الاستثمار الأجنبي عبر أكثر من 340 مشروعاً في 2024',
      'توسعت ممرات التجارة مع الهند وكوريا الجنوبية وأفريقيا جنوب الصحراء بنسبة 35٪',
      'بلغ متوسط معدلات إشغال المناطق الحرة 91٪ عبر سوق أبوظبي العالمي وكيزاد ومدينة مصدر',
      'نمت أنشطة إعادة التصدير بنسبة 18٪ مما يعزز دور أبوظبي كمركز لوجستي إقليمي',
    ],
    publishedDate: '2024-11-05',
    pageCount: 72,
    fileSize: '4.9 MB',
    downloadUrl: '/reports/fr-004.pdf',
    language: 'English',
    isFeatured: true,
    tags: ['Trade', 'Investment', 'FDI', 'Free Zones', 'Exports'],
    tagsAr: ['التجارة', 'الاستثمار', 'الاستثمار الأجنبي', 'المناطق الحرة', 'الصادرات'],
    downloads: 1420,
  },
  {
    id: 'fr-005',
    type: 'Flagship',
    title: 'Abu Dhabi SME Competitiveness & Innovation Report 2025',
    titleAr: 'تقرير تنافسية وابتكار الشركات الصغيرة والمتوسطة في أبوظبي 2025',
    edition: '2025 Edition',
    editionAr: 'إصدار 2025',
    coverImageUrl: '',
    summary: 'This flagship report examines the innovation capacity and competitiveness of SMEs in Abu Dhabi. It covers digital adoption rates, R&D spending, access to venture capital, and the effectiveness of government support programs for small businesses.',
    summaryAr: 'يدرس هذا التقرير الرئيسي القدرة الابتكارية والتنافسية للشركات الصغيرة والمتوسطة في أبوظبي. يغطي معدلات التحول الرقمي والإنفاق على البحث والتطوير والوصول لرأس المال المخاطر وفعالية برامج الدعم الحكومية.',
    keyFindings: [
      '78% of SMEs adopted at least one digital solution in 2024, up from 54% in 2021',
      'Venture capital funding for Abu Dhabi startups reached AED 3.2 billion',
      'Government procurement from SMEs increased to 20% of total public contracts',
      'Innovation-active SMEs showed 2.3x higher revenue growth than non-innovators',
    ],
    keyFindingsAr: [
      'تبنت 78٪ من الشركات الصغيرة والمتوسطة حلاً رقمياً واحداً على الأقل في 2024',
      'وصل تمويل رأس المال المخاطر للشركات الناشئة في أبوظبي إلى 3.2 مليار درهم',
      'زادت المشتريات الحكومية من الشركات الصغيرة والمتوسطة إلى 20٪ من إجمالي العقود العامة',
      'أظهرت الشركات النشطة في الابتكار نمواً في الإيرادات أعلى بمقدار 2.3 مرة',
    ],
    publishedDate: '2024-09-18',
    pageCount: 68,
    fileSize: '4.1 MB',
    downloadUrl: '/reports/fr-005.pdf',
    language: 'Arabic',
    isFeatured: true,
    tags: ['SMEs', 'Innovation', 'Digital Transformation', 'Startups', 'Venture Capital'],
    tagsAr: ['الشركات الصغيرة والمتوسطة', 'الابتكار', 'التحول الرقمي', 'الشركات الناشئة', 'رأس المال المخاطر'],
    downloads: 980,
  },
]

// ─── Sectorial Reports (11) ─────────────────────────────────────────────────

export const sectorialReports: SectorialReport[] = [
  {
    id: 'sr-001',
    type: 'Sectorial',
    sector: 'Energy & Utilities',
    sectorAr: 'الطاقة والمرافق',
    title: 'Abu Dhabi Energy Sector Outlook: Transition & Opportunity',
    titleAr: 'نظرة على قطاع الطاقة في أبوظبي: التحول والفرص',
    edition: 'H2 2024',
    editionAr: 'النصف الثاني 2024',
    coverImageUrl: '',
    summary: 'A deep dive into Abu Dhabi\'s energy sector transformation, covering the accelerated shift toward renewables, hydrogen economy investments, and the strategic balance between hydrocarbon revenues and clean energy commitments.',
    summaryAr: 'دراسة معمقة لتحول قطاع الطاقة في أبوظبي، تغطي التحول المتسارع نحو مصادر الطاقة المتجددة واستثمارات اقتصاد الهيدروجين والتوازن الاستراتيجي بين إيرادات الهيدروكربون والتزامات الطاقة النظيفة.',
    keyFindings: [
      'Renewable energy capacity reached 5.6 GW, exceeding the 2025 target ahead of schedule',
      'Hydrogen pilot projects attracted AED 8.5 billion in committed investments',
      'ADNOC\'s downstream diversification added 12,000 new private sector jobs',
      'Utility sector smart grid coverage expanded to 78% of Abu Dhabi households',
      'Energy efficiency programs saved an estimated AED 2.1 billion in consumption costs',
    ],
    keyFindingsAr: [
      'وصلت قدرة الطاقة المتجددة إلى 5.6 جيجاواط متجاوزة هدف 2025 قبل الموعد',
      'استقطبت مشاريع الهيدروجين التجريبية 8.5 مليار درهم من الاستثمارات الملتزمة',
      'أضاف تنويع أدنوك في المصب 12,000 وظيفة جديدة في القطاع الخاص',
      'توسعت تغطية الشبكة الذكية للمرافق لتشمل 78٪ من منازل أبوظبي',
      'وفرت برامج كفاءة الطاقة ما يقدر بـ 2.1 مليار درهم من تكاليف الاستهلاك',
    ],
    publishedDate: '2025-02-01',
    pageCount: 52,
    fileSize: '3.8 MB',
    downloadUrl: '/reports/sr-001.pdf',
    language: 'English',
    isFeatured: true,
    tags: ['Energy', 'Renewables', 'Hydrogen', 'ADNOC', 'Net Zero'],
    tagsAr: ['الطاقة', 'المتجددة', 'الهيدروجين', 'أدنوك', 'صافي الصفر'],
    downloads: 870,
  },
  {
    id: 'sr-002',
    type: 'Sectorial',
    sector: 'Real Estate & Construction',
    sectorAr: 'العقارات والبناء',
    title: 'Abu Dhabi Real Estate & Construction Market Review 2025',
    titleAr: 'مراجعة سوق العقارات والبناء في أبوظبي 2025',
    edition: 'Annual 2025',
    editionAr: 'سنوي 2025',
    coverImageUrl: '',
    summary: 'A comprehensive review of Abu Dhabi\'s real estate market performance covering residential, commercial, and industrial segments. Analyzes pricing trends, transaction volumes, new project pipelines, and the impact of regulatory reforms on investor confidence.',
    summaryAr: 'مراجعة شاملة لأداء سوق العقارات في أبوظبي تغطي القطاعات السكنية والتجارية والصناعية. يحلل اتجاهات الأسعار وأحجام المعاملات وخطوط المشاريع الجديدة وتأثير الإصلاحات التنظيمية على ثقة المستثمرين.',
    keyFindings: [
      'Residential property transactions increased 34% with average prices rising 12%',
      'Grade A office occupancy reached 94%, the highest level in five years',
      'Industrial land leasing in KIZAD grew 41% driven by manufacturing demand',
      'Foreign ownership reforms boosted non-citizen property purchases by 58%',
    ],
    keyFindingsAr: [
      'زادت معاملات العقارات السكنية بنسبة 34٪ مع ارتفاع متوسط الأسعار بنسبة 12٪',
      'بلغ إشغال المكاتب من الدرجة الأولى 94٪ وهو أعلى مستوى في خمس سنوات',
      'نمى تأجير الأراضي الصناعية في كيزاد بنسبة 41٪ مدفوعاً بالطلب الصناعي',
      'عززت إصلاحات الملكية الأجنبية مشتريات غير المواطنين للعقارات بنسبة 58٪',
    ],
    publishedDate: '2025-01-10',
    pageCount: 48,
    fileSize: '3.2 MB',
    downloadUrl: '/reports/sr-002.pdf',
    language: 'Bilingual',
    isFeatured: true,
    tags: ['Real Estate', 'Construction', 'Property', 'Investment', 'Housing'],
    tagsAr: ['العقارات', 'البناء', 'الملكية', 'الاستثمار', 'الإسكان'],
    downloads: 760,
  },
  {
    id: 'sr-003',
    type: 'Sectorial',
    sector: 'Financial Services',
    sectorAr: 'الخدمات المالية',
    title: 'Financial Services Sector Performance & Digital Banking Trends',
    titleAr: 'أداء قطاع الخدمات المالية واتجاهات الخدمات المصرفية الرقمية',
    edition: 'Q4 2024',
    editionAr: 'الربع الرابع 2024',
    coverImageUrl: '',
    summary: 'An examination of Abu Dhabi\'s financial services sector, focusing on banking profitability, insurance market growth, capital markets activity, and the rapid adoption of digital banking and fintech solutions by consumers and businesses.',
    summaryAr: 'دراسة لقطاع الخدمات المالية في أبوظبي، تركز على ربحية البنوك ونمو سوق التأمين ونشاط أسواق المال والتبني السريع للخدمات المصرفية الرقمية وحلول التكنولوجيا المالية.',
    keyFindings: [
      'Banking sector total assets grew 9.2% to reach AED 1.4 trillion',
      'Digital banking adoption reached 82% among retail customers',
      'ADX market capitalization crossed AED 2.8 trillion with 15 new listings',
      'Fintech licenses issued by ADGM doubled year-over-year to 64',
      'Insurance sector premiums grew 11% driven by health and motor segments',
    ],
    keyFindingsAr: [
      'نمت إجمالي أصول القطاع المصرفي بنسبة 9.2٪ لتصل إلى 1.4 تريليون درهم',
      'بلغ تبني الخدمات المصرفية الرقمية 82٪ بين عملاء التجزئة',
      'تجاوزت القيمة السوقية لسوق أبوظبي للأوراق المالية 2.8 تريليون درهم مع 15 إدراجاً جديداً',
      'تضاعفت تراخيص التكنولوجيا المالية الصادرة عن سوق أبوظبي العالمي إلى 64',
      'نمت أقساط قطاع التأمين بنسبة 11٪ مدفوعة بقطاعي الصحة والسيارات',
    ],
    publishedDate: '2024-12-22',
    pageCount: 44,
    fileSize: '2.9 MB',
    downloadUrl: '/reports/sr-003.pdf',
    language: 'English',
    isFeatured: false,
    tags: ['Banking', 'Fintech', 'Capital Markets', 'Insurance', 'Digital Banking'],
    tagsAr: ['الخدمات المصرفية', 'التكنولوجيا المالية', 'أسواق المال', 'التأمين', 'الخدمات المصرفية الرقمية'],
    downloads: 620,
  },
  {
    id: 'sr-004',
    type: 'Sectorial',
    sector: 'Healthcare & Life Sciences',
    sectorAr: 'الرعاية الصحية وعلوم الحياة',
    title: 'Healthcare & Life Sciences Investment Landscape in Abu Dhabi',
    titleAr: 'المشهد الاستثماري للرعاية الصحية وعلوم الحياة في أبوظبي',
    edition: 'Annual 2024',
    editionAr: 'سنوي 2024',
    coverImageUrl: '',
    summary: 'This sector report maps the healthcare and life sciences investment landscape in Abu Dhabi, covering hospital infrastructure, pharmaceutical manufacturing, biotech startups, and the expanding medical tourism segment.',
    summaryAr: 'يرسم هذا التقرير القطاعي خريطة المشهد الاستثماري للرعاية الصحية وعلوم الحياة في أبوظبي، ويغطي البنية التحتية للمستشفيات وتصنيع الأدوية والشركات الناشئة في مجال التكنولوجيا الحيوية وقطاع السياحة العلاجية المتنامي.',
    keyFindings: [
      'Healthcare spending reached AED 28.5 billion with 68% from private sources',
      'Abu Dhabi attracted 142,000 medical tourists in 2024, a 25% increase',
      'Pharmaceutical manufacturing capacity doubled with 4 new GMP-certified facilities',
      'Telehealth consultations exceeded 3.8 million, accounting for 22% of primary care visits',
    ],
    keyFindingsAr: [
      'بلغ الإنفاق الصحي 28.5 مليار درهم بنسبة 68٪ من مصادر خاصة',
      'استقطبت أبوظبي 142,000 سائح علاجي في 2024 بزيادة 25٪',
      'تضاعفت قدرة تصنيع الأدوية مع 4 منشآت جديدة حاصلة على شهادة GMP',
      'تجاوزت استشارات الطب عن بعد 3.8 مليون تمثل 22٪ من زيارات الرعاية الأولية',
    ],
    publishedDate: '2024-12-05',
    pageCount: 40,
    fileSize: '2.6 MB',
    downloadUrl: '/reports/sr-004.pdf',
    language: 'English',
    isFeatured: false,
    tags: ['Healthcare', 'Life Sciences', 'Medical Tourism', 'Pharma', 'Biotech'],
    tagsAr: ['الرعاية الصحية', 'علوم الحياة', 'السياحة العلاجية', 'الأدوية', 'التكنولوجيا الحيوية'],
    downloads: 530,
  },
  {
    id: 'sr-005',
    type: 'Sectorial',
    sector: 'Technology & Innovation',
    sectorAr: 'التكنولوجيا والابتكار',
    title: 'Technology & Innovation Ecosystem Report: Abu Dhabi',
    titleAr: 'تقرير منظومة التكنولوجيا والابتكار: أبوظبي',
    edition: 'Q3 2024',
    editionAr: 'الربع الثالث 2024',
    coverImageUrl: '',
    summary: 'An analysis of Abu Dhabi\'s rapidly growing technology and innovation ecosystem, examining AI strategy implementation, startup funding trends, cloud infrastructure investments, and the emerging semiconductor and advanced technology manufacturing sector.',
    summaryAr: 'تحليل لمنظومة التكنولوجيا والابتكار سريعة النمو في أبوظبي، يدرس تنفيذ استراتيجية الذكاء الاصطناعي واتجاهات تمويل الشركات الناشئة واستثمارات البنية التحتية السحابية وقطاع تصنيع أشباه الموصلات والتكنولوجيا المتقدمة الناشئ.',
    keyFindings: [
      'Abu Dhabi\'s tech sector grew 18% year-over-year, contributing AED 42 billion to GDP',
      'AI-related investments exceeded AED 6 billion including Technology Innovation Institute expansions',
      '320 new tech startups registered, with 45% focused on AI/ML applications',
      'Cloud computing adoption among enterprises reached 71%, up from 52% in 2022',
      'Cybersecurity spending increased 34% as digital transformation accelerated',
    ],
    keyFindingsAr: [
      'نما قطاع التكنولوجيا في أبوظبي بنسبة 18٪ سنوياً ليساهم بـ 42 مليار درهم في الناتج المحلي',
      'تجاوزت الاستثمارات المتعلقة بالذكاء الاصطناعي 6 مليارات درهم',
      'تم تسجيل 320 شركة تقنية ناشئة جديدة مع تركيز 45٪ منها على تطبيقات الذكاء الاصطناعي',
      'بلغ تبني الحوسبة السحابية بين الشركات 71٪ مقارنة بـ 52٪ في 2022',
      'زاد الإنفاق على الأمن السيبراني بنسبة 34٪ مع تسارع التحول الرقمي',
    ],
    publishedDate: '2024-11-20',
    pageCount: 56,
    fileSize: '3.5 MB',
    downloadUrl: '/reports/sr-005.pdf',
    language: 'Bilingual',
    isFeatured: true,
    tags: ['Technology', 'AI', 'Startups', 'Cloud', 'Innovation', 'Cybersecurity'],
    tagsAr: ['التكنولوجيا', 'الذكاء الاصطناعي', 'الشركات الناشئة', 'السحابة', 'الابتكار', 'الأمن السيبراني'],
    downloads: 910,
  },
  {
    id: 'sr-006',
    type: 'Sectorial',
    sector: 'Tourism & Hospitality',
    sectorAr: 'السياحة والضيافة',
    title: 'Abu Dhabi Tourism & Hospitality Sector Performance Review',
    titleAr: 'مراجعة أداء قطاع السياحة والضيافة في أبوظبي',
    edition: 'Annual 2024',
    editionAr: 'سنوي 2024',
    coverImageUrl: '',
    summary: 'A performance review of Abu Dhabi\'s tourism and hospitality sector covering visitor arrivals, hotel occupancy rates, MICE events, cultural tourism assets, and the strategic initiatives driving Abu Dhabi\'s positioning as a world-class tourism destination.',
    summaryAr: 'مراجعة أداء قطاع السياحة والضيافة في أبوظبي تغطي أعداد الزوار ومعدلات إشغال الفنادق وفعاليات المؤتمرات والسياحة الثقافية والمبادرات الاستراتيجية لتعزيز مكانة أبوظبي كوجهة سياحية عالمية.',
    keyFindings: [
      'International visitor arrivals reached 6.2 million, a 19% increase over 2023',
      'Hotel occupancy averaged 79% with luxury segment outperforming at 85%',
      'Cultural tourism revenue grew 28% driven by Louvre Abu Dhabi and Saadiyat Island attractions',
      'MICE events generated AED 4.8 billion in economic impact across 380+ events',
    ],
    keyFindingsAr: [
      'بلغت أعداد الزوار الدوليين 6.2 مليون بزيادة 19٪ عن 2023',
      'بلغ متوسط إشغال الفنادق 79٪ مع تفوق قطاع الفخامة عند 85٪',
      'نمت إيرادات السياحة الثقافية بنسبة 28٪ مدفوعة بمتحف اللوفر ومعالم جزيرة السعديات',
      'حققت فعاليات المؤتمرات أثراً اقتصادياً بقيمة 4.8 مليار درهم عبر أكثر من 380 فعالية',
    ],
    publishedDate: '2024-11-01',
    pageCount: 36,
    fileSize: '2.4 MB',
    downloadUrl: '/reports/sr-006.pdf',
    language: 'Bilingual',
    isFeatured: false,
    tags: ['Tourism', 'Hospitality', 'Hotels', 'MICE', 'Cultural Tourism'],
    tagsAr: ['السياحة', 'الضيافة', 'الفنادق', 'المؤتمرات', 'السياحة الثقافية'],
    downloads: 480,
  },
  {
    id: 'sr-007',
    type: 'Sectorial',
    sector: 'Manufacturing & Industry',
    sectorAr: 'التصنيع والصناعة',
    title: 'Manufacturing & Industrial Development Report: Abu Dhabi',
    titleAr: 'تقرير التطوير الصناعي والتصنيع: أبوظبي',
    edition: 'H1 2024',
    editionAr: 'النصف الأول 2024',
    coverImageUrl: '',
    summary: 'This report analyzes Abu Dhabi\'s manufacturing sector growth trajectory, examining the expansion of industrial zones, the \'Make it in the Emirates\' program impact, advanced manufacturing adoption, and opportunities in defense, aerospace, and food processing.',
    summaryAr: 'يحلل هذا التقرير مسار نمو قطاع التصنيع في أبوظبي، ويدرس توسع المناطق الصناعية وتأثير برنامج \'اصنع في الإمارات\' وتبني التصنيع المتقدم والفرص في الدفاع والفضاء وتصنيع الأغذية.',
    keyFindings: [
      'Manufacturing sector GDP contribution grew 14% to reach AED 56 billion',
      '\'Make it in the Emirates\' attracted 85 new manufacturing commitments worth AED 22 billion',
      'Industry 4.0 adoption among manufacturers increased to 38% from 21% in 2022',
      'Defense and aerospace manufacturing contracts totaled AED 9.3 billion',
    ],
    keyFindingsAr: [
      'نمت مساهمة قطاع التصنيع في الناتج المحلي بنسبة 14٪ لتصل إلى 56 مليار درهم',
      'استقطب برنامج اصنع في الإمارات 85 التزاماً تصنيعياً جديداً بقيمة 22 مليار درهم',
      'ارتفع تبني الصناعة 4.0 بين المصنعين إلى 38٪ مقارنة بـ 21٪ في 2022',
      'بلغت عقود تصنيع الدفاع والفضاء 9.3 مليار درهم',
    ],
    publishedDate: '2024-10-15',
    pageCount: 42,
    fileSize: '2.8 MB',
    downloadUrl: '/reports/sr-007.pdf',
    language: 'English',
    isFeatured: false,
    tags: ['Manufacturing', 'Industry 4.0', 'Industrial Zones', 'Aerospace', 'Defense'],
    tagsAr: ['التصنيع', 'الصناعة 4.0', 'المناطق الصناعية', 'الفضاء', 'الدفاع'],
    downloads: 350,
  },
  {
    id: 'sr-008',
    type: 'Sectorial',
    sector: 'Transportation & Logistics',
    sectorAr: 'النقل والخدمات اللوجستية',
    title: 'Transportation & Logistics Infrastructure Assessment',
    titleAr: 'تقييم البنية التحتية للنقل والخدمات اللوجستية',
    edition: 'Annual 2024',
    editionAr: 'سنوي 2024',
    coverImageUrl: '',
    summary: 'An assessment of Abu Dhabi\'s transportation and logistics infrastructure, covering port capacity expansions, aviation hub development, Etihad Rail progress, and last-mile delivery innovations supporting e-commerce growth.',
    summaryAr: 'تقييم للبنية التحتية للنقل والخدمات اللوجستية في أبوظبي، يغطي توسعات سعة الموانئ وتطوير مركز الطيران وتقدم الاتحاد للقطارات وابتكارات التوصيل للميل الأخير.',
    keyFindings: [
      'Khalifa Port container throughput increased 23% with Phase 2 expansion completed',
      'Abu Dhabi International Airport handled 25.4 million passengers post-terminal expansion',
      'Etihad Rail freight operations commenced on the Abu Dhabi-Dubai corridor',
      'Logistics sector employment grew 16% with 4,200 new jobs created',
      'E-commerce last-mile delivery capacity expanded 3x through fulfillment center investments',
    ],
    keyFindingsAr: [
      'زادت حركة الحاويات في ميناء خليفة بنسبة 23٪ مع اكتمال توسعة المرحلة الثانية',
      'استقبل مطار أبوظبي الدولي 25.4 مليون مسافر بعد توسعة المبنى',
      'بدأت عمليات الشحن بالقطارات على ممر أبوظبي-دبي',
      'نما توظيف قطاع الخدمات اللوجستية بنسبة 16٪ مع خلق 4,200 وظيفة جديدة',
      'توسعت قدرة التوصيل للميل الأخير 3 أضعاف من خلال استثمارات مراكز التنفيذ',
    ],
    publishedDate: '2024-09-28',
    pageCount: 38,
    fileSize: '2.5 MB',
    downloadUrl: '/reports/sr-008.pdf',
    language: 'Arabic',
    isFeatured: false,
    tags: ['Logistics', 'Transportation', 'Ports', 'Aviation', 'Etihad Rail'],
    tagsAr: ['الخدمات اللوجستية', 'النقل', 'الموانئ', 'الطيران', 'الاتحاد للقطارات'],
    downloads: 310,
  },
  {
    id: 'sr-009',
    type: 'Sectorial',
    sector: 'Agriculture & Food Security',
    sectorAr: 'الزراعة والأمن الغذائي',
    title: 'Agriculture & Food Security Strategic Assessment',
    titleAr: 'التقييم الاستراتيجي للزراعة والأمن الغذائي',
    edition: 'Annual 2024',
    editionAr: 'سنوي 2024',
    coverImageUrl: '',
    summary: 'This report evaluates Abu Dhabi\'s agriculture and food security strategy, covering agritech investments, local food production capacity, strategic reserves, and the emirate\'s approach to building resilient and sustainable food supply chains.',
    summaryAr: 'يقيم هذا التقرير استراتيجية الزراعة والأمن الغذائي في أبوظبي، ويغطي استثمارات التكنولوجيا الزراعية والقدرة الإنتاجية المحلية والاحتياطيات الاستراتيجية ونهج الإمارة في بناء سلاسل توريد غذائية مرنة ومستدامة.',
    keyFindings: [
      'Local food production increased 31% through vertical farming and controlled environment agriculture',
      'Agritech startups received AED 890 million in funding across 28 ventures',
      'Strategic food reserves expanded to cover 6 months of essential commodities',
      'Water-efficient irrigation adoption saved 18% of agricultural water consumption',
    ],
    keyFindingsAr: [
      'زاد الإنتاج الغذائي المحلي بنسبة 31٪ من خلال الزراعة العمودية والبيئة المتحكم بها',
      'حصلت الشركات الناشئة في التكنولوجيا الزراعية على 890 مليون درهم عبر 28 مشروعاً',
      'توسعت الاحتياطيات الغذائية الاستراتيجية لتغطية 6 أشهر من السلع الأساسية',
      'وفر تبني الري الموفر للمياه 18٪ من استهلاك المياه الزراعية',
    ],
    publishedDate: '2024-09-10',
    pageCount: 34,
    fileSize: '2.1 MB',
    downloadUrl: '/reports/sr-009.pdf',
    language: 'Bilingual',
    isFeatured: false,
    tags: ['Agriculture', 'Food Security', 'Agritech', 'Vertical Farming', 'Supply Chain'],
    tagsAr: ['الزراعة', 'الأمن الغذائي', 'التكنولوجيا الزراعية', 'الزراعة العمودية', 'سلسلة التوريد'],
    downloads: 280,
  },
  {
    id: 'sr-010',
    type: 'Sectorial',
    sector: 'Education & Human Capital',
    sectorAr: 'التعليم ورأس المال البشري',
    title: 'Education & Human Capital Development Report',
    titleAr: 'تقرير تطوير التعليم ورأس المال البشري',
    edition: 'Annual 2024',
    editionAr: 'سنوي 2024',
    coverImageUrl: '',
    summary: 'An assessment of Abu Dhabi\'s education sector and human capital development initiatives, covering K-12 quality improvements, higher education rankings, vocational training programs, and workforce skills alignment with economic diversification goals.',
    summaryAr: 'تقييم لقطاع التعليم ومبادرات تنمية رأس المال البشري في أبوظبي، يغطي تحسينات جودة التعليم المدرسي وتصنيفات التعليم العالي وبرامج التدريب المهني ومواءمة مهارات القوى العاملة مع أهداف التنويع الاقتصادي.',
    keyFindings: [
      'Three Abu Dhabi universities ranked among global top 300 in QS World Rankings',
      'STEM enrollment increased 42% with targeted scholarship programs',
      'Vocational training graduates employment rate reached 87% within 6 months',
      'EdTech adoption in K-12 schools reached 94% with AI-assisted learning platforms',
      'Private sector training investment grew 28% to AED 1.8 billion',
    ],
    keyFindingsAr: [
      'صنفت ثلاث جامعات في أبوظبي ضمن أفضل 300 عالمياً في تصنيفات QS',
      'زاد الالتحاق بتخصصات STEM بنسبة 42٪ مع برامج المنح المستهدفة',
      'بلغ معدل توظيف خريجي التدريب المهني 87٪ خلال 6 أشهر',
      'بلغ تبني تكنولوجيا التعليم في المدارس 94٪ مع منصات التعلم بالذكاء الاصطناعي',
      'نما استثمار القطاع الخاص في التدريب بنسبة 28٪ ليصل إلى 1.8 مليار درهم',
    ],
    publishedDate: '2024-08-20',
    pageCount: 46,
    fileSize: '2.7 MB',
    downloadUrl: '/reports/sr-010.pdf',
    language: 'Arabic',
    isFeatured: false,
    tags: ['Education', 'Human Capital', 'STEM', 'Vocational Training', 'EdTech'],
    tagsAr: ['التعليم', 'رأس المال البشري', 'العلوم والتكنولوجيا', 'التدريب المهني', 'تكنولوجيا التعليم'],
    downloads: 340,
  },
  {
    id: 'sr-011',
    type: 'Sectorial',
    sector: 'Financial Services',
    sectorAr: 'الخدمات المالية',
    title: 'Islamic Finance & Fintech Deep Dive: Abu Dhabi',
    titleAr: 'دراسة معمقة للتمويل الإسلامي والتكنولوجيا المالية: أبوظبي',
    edition: 'Q2 2024',
    editionAr: 'الربع الثاني 2024',
    coverImageUrl: '',
    summary: 'A specialized deep dive into Abu Dhabi\'s Islamic finance market and fintech landscape, covering sukuk issuances, Shariah-compliant fund performance, regulatory sandbox innovations, and the convergence of Islamic finance with fintech solutions.',
    summaryAr: 'دراسة متخصصة لسوق التمويل الإسلامي ومشهد التكنولوجيا المالية في أبوظبي، تغطي إصدارات الصكوك وأداء الصناديق المتوافقة مع الشريعة وابتكارات البيئة التنظيمية التجريبية وتقاطع التمويل الإسلامي مع حلول التكنولوجيا المالية.',
    keyFindings: [
      'Abu Dhabi sukuk issuances totaled AED 38 billion, a 22% increase year-over-year',
      'Shariah-compliant assets under management grew to AED 185 billion',
      'ADGM regulatory sandbox graduated 12 Islamic fintech firms to full licensing',
      'Digital Islamic banking users increased 67% with 3 new neo-bank launches',
    ],
    keyFindingsAr: [
      'بلغت إصدارات الصكوك في أبوظبي 38 مليار درهم بزيادة 22٪ سنوياً',
      'نمت الأصول المتوافقة مع الشريعة المدارة لتصل إلى 185 مليار درهم',
      'تخرجت 12 شركة تكنولوجيا مالية إسلامية من البيئة التنظيمية التجريبية للترخيص الكامل',
      'زاد مستخدمو الخدمات المصرفية الإسلامية الرقمية بنسبة 67٪ مع إطلاق 3 بنوك رقمية جديدة',
    ],
    publishedDate: '2024-07-15',
    pageCount: 32,
    fileSize: '1.8 MB',
    downloadUrl: '/reports/sr-011.pdf',
    language: 'Bilingual',
    isFeatured: false,
    tags: ['Islamic Finance', 'Fintech', 'Sukuk', 'Shariah', 'Regulatory Sandbox'],
    tagsAr: ['التمويل الإسلامي', 'التكنولوجيا المالية', 'الصكوك', 'الشريعة', 'البيئة التنظيمية'],
    downloads: 420,
  },
]

// ─── Combined Reports Array ─────────────────────────────────────────────────

export const allReports: Report[] = [...flagshipReports, ...sectorialReports]
