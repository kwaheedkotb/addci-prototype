// ─── Data Hub Seed Data ─────────────────────────────────────────────────────
// Datasets, chart data, and key metrics for the ADCCI Data Hub service

export interface ChartDataPoint {
  [key: string]: string | number | undefined
  label: string
  value: number
  value2?: number // for multi-series
}

export interface Dataset {
  id: string
  title: string
  titleAr: string
  description: string
  descriptionAr: string
  category: string
  categoryAr: string
  dataSource: 'ADCCI Member Data' | 'Open Government Data' | 'Aggregated' | 'Third Party'
  dataSourceAr: string
  lastUpdated: string
  frequency: 'Monthly' | 'Quarterly' | 'Annual'
  frequencyAr: string
  recordCount: string
  tags: string[]
  tagsAr: string[]
  isFeatured: boolean
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'mixed'
  unit: string
  unitAr: string
  chartData: ChartDataPoint[]
  chartColors?: string[]
}

export interface KeyMetric {
  id: string
  label: string
  labelAr: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
  period: string
  periodAr: string
  category: string
}

// ─── Lookup Maps ────────────────────────────────────────────────────────────

export const categories = [
  'Trade & Exports',
  'Business Formation',
  'Economic Indicators',
  'Real Estate',
  'Labor Market',
  'SME Activity',
  'Energy',
  'Tourism',
]

export const categoriesAr: Record<string, string> = {
  'Trade & Exports': 'التجارة والصادرات',
  'Business Formation': 'تأسيس الأعمال',
  'Economic Indicators': 'المؤشرات الاقتصادية',
  'Real Estate': 'العقارات',
  'Labor Market': 'سوق العمل',
  'SME Activity': 'نشاط المنشآت الصغيرة والمتوسطة',
  'Energy': 'الطاقة',
  'Tourism': 'السياحة',
}

export const dataSources = [
  'ADCCI Member Data',
  'Open Government Data',
  'Aggregated',
  'Third Party',
]

export const dataSourcesAr: Record<string, string> = {
  'ADCCI Member Data': 'بيانات أعضاء الغرفة',
  'Open Government Data': 'بيانات حكومية مفتوحة',
  'Aggregated': 'بيانات مجمّعة',
  'Third Party': 'طرف ثالث',
}

export const frequencies = ['Monthly', 'Quarterly', 'Annual']

export const frequenciesAr: Record<string, string> = {
  Monthly: 'شهري',
  Quarterly: 'ربع سنوي',
  Annual: 'سنوي',
}

export const chartTypes: Dataset['chartType'][] = ['bar', 'line', 'pie', 'area', 'mixed']

export const chartTypesAr: Record<string, string> = {
  bar: 'أعمدة',
  line: 'خطي',
  pie: 'دائري',
  area: 'مساحة',
  mixed: 'مختلط',
}

export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'Trade & Exports': {
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-500/30',
  },
  'Business Formation': {
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-500/30',
  },
  'Economic Indicators': {
    bg: 'bg-purple-100 dark:bg-purple-500/20',
    text: 'text-purple-800 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-500/30',
  },
  'Real Estate': {
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-500/30',
  },
  'Labor Market': {
    bg: 'bg-cyan-100 dark:bg-cyan-500/20',
    text: 'text-cyan-800 dark:text-cyan-300',
    border: 'border-cyan-200 dark:border-cyan-500/30',
  },
  'SME Activity': {
    bg: 'bg-rose-100 dark:bg-rose-500/20',
    text: 'text-rose-800 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-500/30',
  },
  Energy: {
    bg: 'bg-teal-100 dark:bg-teal-500/20',
    text: 'text-teal-800 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-500/30',
  },
  Tourism: {
    bg: 'bg-indigo-100 dark:bg-indigo-500/20',
    text: 'text-indigo-800 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-500/30',
  },
}

export const dataSourceColors: Record<string, { bg: string; text: string; border: string }> = {
  'ADCCI Member Data': {
    bg: 'bg-violet-100 dark:bg-violet-500/20',
    text: 'text-violet-800 dark:text-violet-300',
    border: 'border-violet-200 dark:border-violet-500/30',
  },
  'Open Government Data': {
    bg: 'bg-green-100 dark:bg-green-500/20',
    text: 'text-green-800 dark:text-green-300',
    border: 'border-green-200 dark:border-green-500/30',
  },
  Aggregated: {
    bg: 'bg-sky-100 dark:bg-sky-500/20',
    text: 'text-sky-800 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-500/30',
  },
  'Third Party': {
    bg: 'bg-orange-100 dark:bg-orange-500/20',
    text: 'text-orange-800 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-500/30',
  },
}

// Chart color palette for Recharts
export const CHART_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
]

// ─── Key Metrics ────────────────────────────────────────────────────────────

export const keyMetrics: KeyMetric[] = [
  {
    id: 'km-001',
    label: 'Active Businesses in Abu Dhabi',
    labelAr: 'الأعمال النشطة في أبوظبي',
    value: '48,320',
    change: '+12.4%',
    trend: 'up',
    period: 'vs. last year',
    periodAr: 'مقارنة بالعام الماضي',
    category: 'Business Formation',
  },
  {
    id: 'km-002',
    label: 'Non-Oil GDP Growth',
    labelAr: 'نمو الناتج غير النفطي',
    value: '6.2%',
    change: '+0.8pp',
    trend: 'up',
    period: 'Q4 2025 YoY',
    periodAr: 'الربع الرابع 2025 سنوياً',
    category: 'Economic Indicators',
  },
  {
    id: 'km-003',
    label: 'Total Non-Oil Exports',
    labelAr: 'إجمالي الصادرات غير النفطية',
    value: 'AED 98.7B',
    change: '+18.3%',
    trend: 'up',
    period: '2025 cumulative',
    periodAr: 'تراكمي 2025',
    category: 'Trade & Exports',
  },
  {
    id: 'km-004',
    label: 'SME Contribution to GDP',
    labelAr: 'مساهمة المنشآت الصغيرة في الناتج',
    value: '33.5%',
    change: '+2.1pp',
    trend: 'up',
    period: 'vs. 2024',
    periodAr: 'مقارنة بـ 2024',
    category: 'SME Activity',
  },
  {
    id: 'km-005',
    label: 'Real Estate Transactions',
    labelAr: 'المعاملات العقارية',
    value: '14,820',
    change: '-3.2%',
    trend: 'down',
    period: 'H2 2025',
    periodAr: 'النصف الثاني 2025',
    category: 'Real Estate',
  },
  {
    id: 'km-006',
    label: 'Total Workforce',
    labelAr: 'إجمالي القوى العاملة',
    value: '1.42M',
    change: '+5.7%',
    trend: 'up',
    period: 'vs. last year',
    periodAr: 'مقارنة بالعام الماضي',
    category: 'Labor Market',
  },
  {
    id: 'km-007',
    label: 'Clean Energy Capacity',
    labelAr: 'قدرة الطاقة النظيفة',
    value: '5.6 GW',
    change: '+22.1%',
    trend: 'up',
    period: 'cumulative installed',
    periodAr: 'مثبّتة تراكمياً',
    category: 'Energy',
  },
  {
    id: 'km-008',
    label: 'International Visitors',
    labelAr: 'الزوار الدوليون',
    value: '6.8M',
    change: '+9.4%',
    trend: 'up',
    period: '2025 full year',
    periodAr: 'السنة الكاملة 2025',
    category: 'Tourism',
  },
]

// ─── Datasets ───────────────────────────────────────────────────────────────

export const datasets: Dataset[] = [
  {
    id: 'ds-001',
    title: 'Non-Oil Foreign Trade by Partner Country',
    titleAr: 'التجارة الخارجية غير النفطية حسب الدولة الشريكة',
    description: 'Quarterly breakdown of Abu Dhabi\'s non-oil imports, exports, and re-exports by top 15 trading partners. Covers commodity groups, value trends, and trade balance.',
    descriptionAr: 'تحليل ربع سنوي للواردات والصادرات وإعادة التصدير غير النفطية لأبوظبي حسب أكبر 15 شريكاً تجارياً. يشمل مجموعات السلع واتجاهات القيمة.',
    category: 'Trade & Exports',
    categoryAr: 'التجارة والصادرات',
    dataSource: 'Open Government Data',
    dataSourceAr: 'بيانات حكومية مفتوحة',
    lastUpdated: '2026-01-15',
    frequency: 'Quarterly',
    frequencyAr: 'ربع سنوي',
    recordCount: '18,400 records',
    tags: ['trade', 'exports', 'imports', 'trade balance'],
    tagsAr: ['تجارة', 'صادرات', 'واردات', 'ميزان تجاري'],
    isFeatured: true,
    chartType: 'bar',
    unit: 'AED Billions',
    unitAr: 'مليار درهم',
    chartData: [
      { label: 'Q1 2024', value: 21.3, value2: 16.8 },
      { label: 'Q2 2024', value: 23.1, value2: 17.4 },
      { label: 'Q3 2024', value: 22.5, value2: 18.1 },
      { label: 'Q4 2024', value: 25.8, value2: 19.6 },
      { label: 'Q1 2025', value: 24.2, value2: 20.3 },
      { label: 'Q2 2025', value: 26.4, value2: 21.7 },
      { label: 'Q3 2025', value: 25.9, value2: 22.1 },
      { label: 'Q4 2025', value: 28.7, value2: 23.5 },
    ],
    chartColors: ['#3b82f6', '#10b981'],
  },
  {
    id: 'ds-002',
    title: 'New Business Registrations by Sector',
    titleAr: 'تسجيلات الأعمال الجديدة حسب القطاع',
    description: 'Monthly count of new trade licenses issued in Abu Dhabi, segmented by economic sector. Tracks formation rates, sector concentration, and year-over-year growth.',
    descriptionAr: 'عدد شهري للرخص التجارية الجديدة الصادرة في أبوظبي، مقسمة حسب القطاع الاقتصادي. يتتبع معدلات التأسيس وتركيز القطاعات.',
    category: 'Business Formation',
    categoryAr: 'تأسيس الأعمال',
    dataSource: 'Open Government Data',
    dataSourceAr: 'بيانات حكومية مفتوحة',
    lastUpdated: '2026-02-01',
    frequency: 'Monthly',
    frequencyAr: 'شهري',
    recordCount: '12,400 records',
    tags: ['business formation', 'trade licenses', 'startups', 'sectors'],
    tagsAr: ['تأسيس أعمال', 'رخص تجارية', 'شركات ناشئة', 'قطاعات'],
    isFeatured: true,
    chartType: 'bar',
    unit: 'Number of Companies',
    unitAr: 'عدد الشركات',
    chartData: [
      { label: 'Jan 2025', value: 1240 },
      { label: 'Feb 2025', value: 1380 },
      { label: 'Mar 2025', value: 1190 },
      { label: 'Apr 2025', value: 1450 },
      { label: 'May 2025', value: 1520 },
      { label: 'Jun 2025', value: 1340 },
      { label: 'Jul 2025', value: 1280 },
      { label: 'Aug 2025', value: 1160 },
      { label: 'Sep 2025', value: 1390 },
      { label: 'Oct 2025', value: 1570 },
      { label: 'Nov 2025', value: 1640 },
      { label: 'Dec 2025', value: 1480 },
    ],
  },
  {
    id: 'ds-003',
    title: 'GDP Composition & Non-Oil Growth Trajectory',
    titleAr: 'تكوين الناتج المحلي ومسار النمو غير النفطي',
    description: 'Annual GDP breakdown by oil vs. non-oil sectors with growth projections. Includes government, manufacturing, services, and financial contributions to the Abu Dhabi economy.',
    descriptionAr: 'تحليل سنوي لتكوين الناتج المحلي حسب القطاعات النفطية وغير النفطية مع توقعات النمو. يشمل مساهمات الحكومة والتصنيع والخدمات.',
    category: 'Economic Indicators',
    categoryAr: 'المؤشرات الاقتصادية',
    dataSource: 'Open Government Data',
    dataSourceAr: 'بيانات حكومية مفتوحة',
    lastUpdated: '2026-01-28',
    frequency: 'Annual',
    frequencyAr: 'سنوي',
    recordCount: '2,800 records',
    tags: ['GDP', 'economic growth', 'non-oil', 'diversification'],
    tagsAr: ['الناتج المحلي', 'النمو الاقتصادي', 'غير نفطي', 'تنويع'],
    isFeatured: true,
    chartType: 'area',
    unit: 'AED Billions',
    unitAr: 'مليار درهم',
    chartData: [
      { label: '2018', value: 386, value2: 476 },
      { label: '2019', value: 401, value2: 458 },
      { label: '2020', value: 372, value2: 320 },
      { label: '2021', value: 410, value2: 502 },
      { label: '2022', value: 458, value2: 680 },
      { label: '2023', value: 492, value2: 595 },
      { label: '2024', value: 528, value2: 610 },
      { label: '2025', value: 561, value2: 642 },
    ],
    chartColors: ['#3b82f6', '#f59e0b'],
  },
  {
    id: 'ds-004',
    title: 'Residential & Commercial Property Transactions',
    titleAr: 'المعاملات العقارية السكنية والتجارية',
    description: 'Monthly real estate transaction volumes and average values across Abu Dhabi\'s key zones. Covers sales, mortgages, and lease registrations with price-per-sqft trends.',
    descriptionAr: 'أحجام المعاملات العقارية الشهرية ومتوسط القيم عبر المناطق الرئيسية في أبوظبي. يشمل المبيعات والرهون العقارية وتسجيلات الإيجار.',
    category: 'Real Estate',
    categoryAr: 'العقارات',
    dataSource: 'Open Government Data',
    dataSourceAr: 'بيانات حكومية مفتوحة',
    lastUpdated: '2026-02-10',
    frequency: 'Monthly',
    frequencyAr: 'شهري',
    recordCount: '9,200 records',
    tags: ['property', 'real estate', 'housing', 'prices'],
    tagsAr: ['عقارات', 'سكني', 'إسكان', 'أسعار'],
    isFeatured: false,
    chartType: 'line',
    unit: 'Number of Transactions',
    unitAr: 'عدد المعاملات',
    chartData: [
      { label: 'Jan 2025', value: 1180 },
      { label: 'Feb 2025', value: 1240 },
      { label: 'Mar 2025', value: 1350 },
      { label: 'Apr 2025', value: 1420 },
      { label: 'May 2025', value: 1310 },
      { label: 'Jun 2025', value: 1190 },
      { label: 'Jul 2025', value: 1050 },
      { label: 'Aug 2025', value: 980 },
      { label: 'Sep 2025', value: 1120 },
      { label: 'Oct 2025', value: 1280 },
      { label: 'Nov 2025', value: 1350 },
      { label: 'Dec 2025', value: 1300 },
    ],
  },
  {
    id: 'ds-005',
    title: 'Private Sector Employment by Nationality & Skill Level',
    titleAr: 'التوظيف في القطاع الخاص حسب الجنسية ومستوى المهارة',
    description: 'Quarterly snapshot of private sector workforce composition including nationality distribution, skill level breakdown, and emiratization progress across key industries.',
    descriptionAr: 'لقطة ربع سنوية لتكوين القوى العاملة في القطاع الخاص بما في ذلك توزيع الجنسيات ومستويات المهارات وتقدم التوطين عبر الصناعات.',
    category: 'Labor Market',
    categoryAr: 'سوق العمل',
    dataSource: 'Aggregated',
    dataSourceAr: 'بيانات مجمّعة',
    lastUpdated: '2025-12-15',
    frequency: 'Quarterly',
    frequencyAr: 'ربع سنوي',
    recordCount: '34,600 records',
    tags: ['employment', 'workforce', 'emiratization', 'labor'],
    tagsAr: ['توظيف', 'قوى عاملة', 'توطين', 'عمالة'],
    isFeatured: false,
    chartType: 'pie',
    unit: 'Percentage',
    unitAr: 'نسبة مئوية',
    chartData: [
      { label: 'Professional & Managerial', value: 28 },
      { label: 'Technical & Associate', value: 22 },
      { label: 'Clerical & Service', value: 31 },
      { label: 'Skilled Manual', value: 14 },
      { label: 'Elementary', value: 5 },
    ],
    chartColors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
  },
  {
    id: 'ds-006',
    title: 'SME Revenue Distribution & Growth Index',
    titleAr: 'توزيع إيرادات المنشآت الصغيرة ومؤشر النمو',
    description: 'Aggregated revenue bands and growth trajectories for ADCCI member SMEs. Includes sector performance, survival rates, and financing access indicators.',
    descriptionAr: 'شرائح الإيرادات المجمّعة ومسارات النمو للمنشآت الصغيرة والمتوسطة الأعضاء في الغرفة. يشمل أداء القطاعات ومعدلات البقاء.',
    category: 'SME Activity',
    categoryAr: 'نشاط المنشآت الصغيرة والمتوسطة',
    dataSource: 'ADCCI Member Data',
    dataSourceAr: 'بيانات أعضاء الغرفة',
    lastUpdated: '2026-01-20',
    frequency: 'Quarterly',
    frequencyAr: 'ربع سنوي',
    recordCount: '8,750 records',
    tags: ['SME', 'revenue', 'growth', 'member data'],
    tagsAr: ['منشآت صغيرة', 'إيرادات', 'نمو', 'بيانات الأعضاء'],
    isFeatured: false,
    chartType: 'bar',
    unit: 'Number of SMEs',
    unitAr: 'عدد المنشآت',
    chartData: [
      { label: '<AED 1M', value: 3420 },
      { label: '1M–5M', value: 2810 },
      { label: '5M–10M', value: 1240 },
      { label: '10M–50M', value: 860 },
      { label: '50M–100M', value: 290 },
      { label: '>100M', value: 130 },
    ],
  },
  {
    id: 'ds-007',
    title: 'Renewable Energy Generation & Carbon Intensity',
    titleAr: 'توليد الطاقة المتجددة وكثافة الكربون',
    description: 'Monthly renewable energy generation output from solar, nuclear, and waste-to-energy facilities. Tracks capacity utilization, grid share, and carbon intensity reduction progress.',
    descriptionAr: 'إنتاج الطاقة المتجددة الشهري من مرافق الطاقة الشمسية والنووية وتحويل النفايات إلى طاقة. يتتبع استغلال القدرة وحصة الشبكة.',
    category: 'Energy',
    categoryAr: 'الطاقة',
    dataSource: 'Open Government Data',
    dataSourceAr: 'بيانات حكومية مفتوحة',
    lastUpdated: '2026-02-05',
    frequency: 'Monthly',
    frequencyAr: 'شهري',
    recordCount: '5,400 records',
    tags: ['renewable energy', 'solar', 'nuclear', 'carbon'],
    tagsAr: ['طاقة متجددة', 'شمسية', 'نووية', 'كربون'],
    isFeatured: false,
    chartType: 'area',
    unit: 'GWh',
    unitAr: 'جيجاواط ساعة',
    chartData: [
      { label: 'Jan 2025', value: 1820 },
      { label: 'Feb 2025', value: 1940 },
      { label: 'Mar 2025', value: 2150 },
      { label: 'Apr 2025', value: 2480 },
      { label: 'May 2025', value: 2810 },
      { label: 'Jun 2025', value: 3120 },
      { label: 'Jul 2025', value: 3350 },
      { label: 'Aug 2025', value: 3280 },
      { label: 'Sep 2025', value: 2940 },
      { label: 'Oct 2025', value: 2560 },
      { label: 'Nov 2025', value: 2100 },
      { label: 'Dec 2025', value: 1890 },
    ],
  },
  {
    id: 'ds-008',
    title: 'International Tourism Arrivals & Hotel Performance',
    titleAr: 'وصول السياح الدوليين وأداء الفنادق',
    description: 'Monthly international visitor arrivals to Abu Dhabi with hotel occupancy rates, average daily rates (ADR), and revenue per available room (RevPAR) across hotel categories.',
    descriptionAr: 'وصول الزوار الدوليين الشهري إلى أبوظبي مع معدلات إشغال الفنادق ومتوسط الأسعار اليومية والإيرادات لكل غرفة متاحة.',
    category: 'Tourism',
    categoryAr: 'السياحة',
    dataSource: 'Third Party',
    dataSourceAr: 'طرف ثالث',
    lastUpdated: '2026-01-30',
    frequency: 'Monthly',
    frequencyAr: 'شهري',
    recordCount: '7,300 records',
    tags: ['tourism', 'hospitality', 'hotel', 'visitors'],
    tagsAr: ['سياحة', 'ضيافة', 'فنادق', 'زوار'],
    isFeatured: false,
    chartType: 'mixed',
    unit: 'Thousands / Percentage',
    unitAr: 'آلاف / نسبة مئوية',
    chartData: [
      { label: 'Jan 2025', value: 520, value2: 78 },
      { label: 'Feb 2025', value: 580, value2: 82 },
      { label: 'Mar 2025', value: 640, value2: 85 },
      { label: 'Apr 2025', value: 590, value2: 79 },
      { label: 'May 2025', value: 480, value2: 68 },
      { label: 'Jun 2025', value: 410, value2: 58 },
      { label: 'Jul 2025', value: 380, value2: 54 },
      { label: 'Aug 2025', value: 420, value2: 56 },
      { label: 'Sep 2025', value: 510, value2: 72 },
      { label: 'Oct 2025', value: 620, value2: 83 },
      { label: 'Nov 2025', value: 680, value2: 88 },
      { label: 'Dec 2025', value: 710, value2: 91 },
    ],
    chartColors: ['#3b82f6', '#f59e0b'],
  },
  {
    id: 'ds-009',
    title: 'Consumer Price Index & Inflation Drivers',
    titleAr: 'مؤشر أسعار المستهلك ومحركات التضخم',
    description: 'Monthly CPI tracking across 12 expenditure categories for Abu Dhabi. Identifies core vs. headline inflation trends and key price pressure points affecting businesses.',
    descriptionAr: 'تتبع شهري لمؤشر أسعار المستهلك عبر 12 فئة إنفاق في أبوظبي. يحدد اتجاهات التضخم الأساسي ونقاط ضغط الأسعار.',
    category: 'Economic Indicators',
    categoryAr: 'المؤشرات الاقتصادية',
    dataSource: 'Open Government Data',
    dataSourceAr: 'بيانات حكومية مفتوحة',
    lastUpdated: '2026-02-12',
    frequency: 'Monthly',
    frequencyAr: 'شهري',
    recordCount: '4,200 records',
    tags: ['CPI', 'inflation', 'prices', 'consumer'],
    tagsAr: ['مؤشر الأسعار', 'تضخم', 'أسعار', 'مستهلك'],
    isFeatured: false,
    chartType: 'line',
    unit: 'Index (2021 = 100)',
    unitAr: 'مؤشر (2021 = 100)',
    chartData: [
      { label: 'Jan 2025', value: 104.2 },
      { label: 'Feb 2025', value: 104.5 },
      { label: 'Mar 2025', value: 104.8 },
      { label: 'Apr 2025', value: 105.1 },
      { label: 'May 2025', value: 105.3 },
      { label: 'Jun 2025', value: 105.0 },
      { label: 'Jul 2025', value: 105.2 },
      { label: 'Aug 2025', value: 105.6 },
      { label: 'Sep 2025', value: 105.4 },
      { label: 'Oct 2025', value: 105.8 },
      { label: 'Nov 2025', value: 106.1 },
      { label: 'Dec 2025', value: 106.4 },
    ],
  },
  {
    id: 'ds-010',
    title: 'Member Trade Activity & Industry Concentration',
    titleAr: 'النشاط التجاري للأعضاء وتركيز الصناعة',
    description: 'Aggregated and anonymized ADCCI member activity data showing industry concentration, trade volume distribution, and sector-level business confidence indicators.',
    descriptionAr: 'بيانات نشاط أعضاء الغرفة المجمّعة والمجهولة الهوية تُظهر تركيز الصناعة وتوزيع حجم التجارة ومؤشرات ثقة الأعمال القطاعية.',
    category: 'Trade & Exports',
    categoryAr: 'التجارة والصادرات',
    dataSource: 'ADCCI Member Data',
    dataSourceAr: 'بيانات أعضاء الغرفة',
    lastUpdated: '2026-02-08',
    frequency: 'Quarterly',
    frequencyAr: 'ربع سنوي',
    recordCount: '15,600 records',
    tags: ['member data', 'trade activity', 'industry', 'confidence'],
    tagsAr: ['بيانات الأعضاء', 'نشاط تجاري', 'صناعة', 'ثقة'],
    isFeatured: false,
    chartType: 'pie',
    unit: 'Percentage',
    unitAr: 'نسبة مئوية',
    chartData: [
      { label: 'Trading & Commerce', value: 35 },
      { label: 'Professional Services', value: 18 },
      { label: 'Construction', value: 15 },
      { label: 'Manufacturing', value: 12 },
      { label: 'Technology', value: 10 },
      { label: 'Other', value: 10 },
    ],
    chartColors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#9ca3af'],
  },
  {
    id: 'ds-011',
    title: 'Abu Dhabi Real Estate Price Index by Zone',
    titleAr: 'مؤشر أسعار العقارات في أبوظبي حسب المنطقة',
    description: 'Quarterly price index for residential and commercial properties across Abu Dhabi\'s investment zones. Tracks price movements in Saadiyat, Reem, Yas, Al Raha, and Downtown.',
    descriptionAr: 'مؤشر ربع سنوي لأسعار العقارات السكنية والتجارية عبر مناطق الاستثمار في أبوظبي. يتتبع تحركات الأسعار في السعديات والريم وياس.',
    category: 'Real Estate',
    categoryAr: 'العقارات',
    dataSource: 'Third Party',
    dataSourceAr: 'طرف ثالث',
    lastUpdated: '2026-01-25',
    frequency: 'Quarterly',
    frequencyAr: 'ربع سنوي',
    recordCount: '6,100 records',
    tags: ['real estate', 'price index', 'zones', 'investment'],
    tagsAr: ['عقارات', 'مؤشر الأسعار', 'مناطق', 'استثمار'],
    isFeatured: false,
    chartType: 'line',
    unit: 'AED per sqft',
    unitAr: 'درهم لكل قدم مربع',
    chartData: [
      { label: 'Q1 2023', value: 1120, value2: 980 },
      { label: 'Q2 2023', value: 1150, value2: 1010 },
      { label: 'Q3 2023', value: 1180, value2: 1040 },
      { label: 'Q4 2023', value: 1220, value2: 1080 },
      { label: 'Q1 2024', value: 1280, value2: 1120 },
      { label: 'Q2 2024', value: 1340, value2: 1160 },
      { label: 'Q3 2024', value: 1380, value2: 1190 },
      { label: 'Q4 2024', value: 1420, value2: 1210 },
      { label: 'Q1 2025', value: 1460, value2: 1240 },
      { label: 'Q2 2025', value: 1490, value2: 1260 },
      { label: 'Q3 2025', value: 1510, value2: 1280 },
      { label: 'Q4 2025', value: 1540, value2: 1300 },
    ],
    chartColors: ['#3b82f6', '#f59e0b'],
  },
]
