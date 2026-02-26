// ─── Market Directory Seed Data ──────────────────────────────────────────────
// AI-driven business intelligence: companies, area stats, sector stats

export interface Company {
  id: string
  name: string
  nameAr: string
  sector: string
  sectorAr: string
  subSector: string
  subSectorAr: string
  area: string
  areaAr: string
  lat: number
  lng: number
  establishedYear: number
  employeeRange: '1–10' | '11–50' | '51–200' | '200+'
  legalType: 'LLC' | 'Branch' | 'Free Zone' | 'Sole Proprietor'
  status: 'Active' | 'Inactive'
  isGoldenVendor: boolean
  description: string
  descriptionAr: string
  tags: string[]
  tagsAr: string[]
}

export interface AreaStat {
  area: string
  areaAr: string
  lat: number
  lng: number
  totalCompanies: number
  topSectors: string[]
  topSectorsAr: string[]
  saturationLevel: 'Low' | 'Medium' | 'High' | 'Very High'
  growthTrend: 'Growing' | 'Stable' | 'Declining'
  averageRent: string
  averageRentAr: string
  keyInfrastructure: string[]
  keyInfrastructureAr: string[]
}

export interface SectorStat {
  sector: string
  sectorAr: string
  totalCompanies: number
  growthRate: string
  topAreas: string[]
  topAreasAr: string[]
  saturationLevel: 'Low' | 'Medium' | 'High' | 'Very High'
  opportunityScore: number
  keyDrivers: string[]
  keyDriversAr: string[]
}

// ─── Sectors ────────────────────────────────────────────────────────────────

export const sectors = [
  'Technology', 'Real Estate', 'Healthcare', 'Retail', 'F&B',
  'Logistics', 'Construction', 'Finance', 'Education', 'Consulting',
  'Manufacturing', 'Tourism',
]

export const sectorsAr: Record<string, string> = {
  Technology: 'التكنولوجيا', 'Real Estate': 'العقارات', Healthcare: 'الرعاية الصحية',
  Retail: 'التجزئة', 'F&B': 'الأغذية والمشروبات', Logistics: 'الخدمات اللوجستية',
  Construction: 'البناء والتشييد', Finance: 'المالية', Education: 'التعليم',
  Consulting: 'الاستشارات', Manufacturing: 'التصنيع', Tourism: 'السياحة',
}

export const sectorColors: Record<string, { bg: string; text: string; border: string }> = {
  Technology: { bg: 'bg-cyan-100 dark:bg-cyan-500/20', text: 'text-cyan-800 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-500/30' },
  'Real Estate': { bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-800 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-500/30' },
  Healthcare: { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-800 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-500/30' },
  Retail: { bg: 'bg-purple-100 dark:bg-purple-500/20', text: 'text-purple-800 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-500/30' },
  'F&B': { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-500/30' },
  Logistics: { bg: 'bg-indigo-100 dark:bg-indigo-500/20', text: 'text-indigo-800 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-500/30' },
  Construction: { bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-500/30' },
  Finance: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/30' },
  Education: { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-800 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-500/30' },
  Consulting: { bg: 'bg-teal-100 dark:bg-teal-500/20', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-500/30' },
  Manufacturing: { bg: 'bg-slate-100 dark:bg-slate-500/20', text: 'text-slate-800 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-500/30' },
  Tourism: { bg: 'bg-pink-100 dark:bg-pink-500/20', text: 'text-pink-800 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-500/30' },
}

export const sectorHexColors: Record<string, string> = {
  Technology: '#06b6d4', 'Real Estate': '#f97316', Healthcare: '#f43f5e',
  Retail: '#a855f7', 'F&B': '#f59e0b', Logistics: '#6366f1',
  Construction: '#eab308', Finance: '#10b981', Education: '#3b82f6',
  Consulting: '#14b8a6', Manufacturing: '#64748b', Tourism: '#ec4899',
}

// ─── Areas ──────────────────────────────────────────────────────────────────

export const areas = [
  'Al Maryah Island', 'Khalifa City', 'ADGM', 'Masdar City', 'Mussafah',
  'Al Reem Island', 'Downtown Abu Dhabi', 'Saadiyat Island', 'Al Ain',
  'Yas Island', 'Corniche', 'Al Zahiyah',
]

export const areasAr: Record<string, string> = {
  'Al Maryah Island': 'جزيرة الماريه', 'Khalifa City': 'مدينة خليفة',
  ADGM: 'سوق أبوظبي العالمي', 'Masdar City': 'مدينة مصدر',
  Mussafah: 'مصفح', 'Al Reem Island': 'جزيرة الريم',
  'Downtown Abu Dhabi': 'وسط أبوظبي', 'Saadiyat Island': 'جزيرة السعديات',
  'Al Ain': 'العين', 'Yas Island': 'جزيرة ياس',
  Corniche: 'الكورنيش', 'Al Zahiyah': 'الزاهية',
}

export const areaCoordinates: Record<string, { lat: number; lng: number }> = {
  'Al Maryah Island': { lat: 24.5025, lng: 54.3942 },
  'Khalifa City': { lat: 24.4200, lng: 54.5800 },
  ADGM: { lat: 24.5018, lng: 54.3940 },
  'Masdar City': { lat: 24.4267, lng: 54.6150 },
  Mussafah: { lat: 24.3500, lng: 54.4800 },
  'Al Reem Island': { lat: 24.4950, lng: 54.4050 },
  'Downtown Abu Dhabi': { lat: 24.4870, lng: 54.3570 },
  'Saadiyat Island': { lat: 24.5400, lng: 54.4350 },
  'Al Ain': { lat: 24.2075, lng: 55.7447 },
  'Yas Island': { lat: 24.4900, lng: 54.6000 },
  Corniche: { lat: 24.4730, lng: 54.3450 },
  'Al Zahiyah': { lat: 24.4850, lng: 54.3650 },
}

// ─── Lookups ────────────────────────────────────────────────────────────────

export const employeeRanges = ['1–10', '11–50', '51–200', '200+'] as const
export const employeeRangesAr: Record<string, string> = { '1–10': '١–١٠', '11–50': '١١–٥٠', '51–200': '٥١–٢٠٠', '200+': '+٢٠٠' }

export const legalTypes = ['LLC', 'Branch', 'Free Zone', 'Sole Proprietor'] as const
export const legalTypesAr: Record<string, string> = { LLC: 'شركة ذات مسؤولية محدودة', Branch: 'فرع', 'Free Zone': 'منطقة حرة', 'Sole Proprietor': 'مؤسسة فردية' }

export const statusesAr: Record<string, string> = { Active: 'نشط', Inactive: 'غير نشط' }

export const budgetOptions = ['Under AED 50K', 'AED 50K–150K', 'AED 150K–500K', 'Above AED 500K'] as const
export const budgetOptionsAr: Record<string, string> = {
  'Under AED 50K': 'أقل من 50 ألف درهم', 'AED 50K–150K': '50–150 ألف درهم',
  'AED 150K–500K': '150–500 ألف درهم', 'Above AED 500K': 'أكثر من 500 ألف درهم',
}

export const priorityOptions = [
  'Low Competition', 'Talent Availability', 'Proximity to Clients',
  'Logistics & Port Access', 'Prestige Address', 'Free Zone Benefits',
  'Affordable Rent', 'Government Proximity',
] as const

export const priorityOptionsAr: Record<string, string> = {
  'Low Competition': 'منافسة منخفضة', 'Talent Availability': 'توفر الكفاءات',
  'Proximity to Clients': 'قرب العملاء', 'Logistics & Port Access': 'وصول لوجستي وميناء',
  'Prestige Address': 'عنوان مرموق', 'Free Zone Benefits': 'مزايا المنطقة الحرة',
  'Affordable Rent': 'إيجار معقول', 'Government Proximity': 'قرب الجهات الحكومية',
}

export const saturationColors: Record<string, string> = {
  Low: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  Medium: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-500/30',
  High: 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-500/30',
  'Very High': 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30',
}

export const saturationHexColors: Record<string, string> = {
  Low: '#3b82f6', Medium: '#eab308', High: '#f97316', 'Very High': '#ef4444',
}

export const growthColors: Record<string, string> = {
  Growing: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  Stable: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  Declining: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30',
}

export const saturationAr: Record<string, string> = { Low: 'منخفض', Medium: 'متوسط', High: 'مرتفع', 'Very High': 'مرتفع جداً' }
export const growthAr: Record<string, string> = { Growing: 'نمو', Stable: 'مستقر', Declining: 'تراجع' }

// ─── Companies (45) ─────────────────────────────────────────────────────────

export const allCompanies: Company[] = [
  // Technology (5)
  { id: 'c-001', name: 'NovaTech Solutions', nameAr: 'حلول نوفاتك', sector: 'Technology', sectorAr: 'التكنولوجيا', subSector: 'Cloud Computing', subSectorAr: 'الحوسبة السحابية', area: 'Masdar City', areaAr: 'مدينة مصدر', lat: 24.4280, lng: 54.6140, establishedYear: 2018, employeeRange: '51–200', legalType: 'Free Zone', status: 'Active', isGoldenVendor: true, description: 'Enterprise cloud infrastructure and managed services for government and private sector.', descriptionAr: 'بنية تحتية سحابية مؤسسية وخدمات مُدارة للقطاعين الحكومي والخاص.', tags: ['cloud', 'SaaS', 'enterprise', 'infrastructure'], tagsAr: ['سحابة', 'برمجيات', 'مؤسسات', 'بنية تحتية'] },
  { id: 'c-002', name: 'Datamind Analytics', nameAr: 'داتامايند للتحليلات', sector: 'Technology', sectorAr: 'التكنولوجيا', subSector: 'AI & Data', subSectorAr: 'الذكاء الاصطناعي والبيانات', area: 'ADGM', areaAr: 'سوق أبوظبي العالمي', lat: 24.5020, lng: 54.3935, establishedYear: 2020, employeeRange: '11–50', legalType: 'Free Zone', status: 'Active', isGoldenVendor: false, description: 'AI-powered data analytics platform serving financial institutions across the GCC.', descriptionAr: 'منصة تحليلات بيانات مدعومة بالذكاء الاصطناعي تخدم المؤسسات المالية في الخليج.', tags: ['AI', 'analytics', 'fintech', 'data'], tagsAr: ['ذكاء اصطناعي', 'تحليلات', 'تقنية مالية', 'بيانات'] },
  { id: 'c-003', name: 'CyberFort Security', nameAr: 'سايبرفورت للأمن', sector: 'Technology', sectorAr: 'التكنولوجيا', subSector: 'Cybersecurity', subSectorAr: 'الأمن السيبراني', area: 'Al Reem Island', areaAr: 'جزيرة الريم', lat: 24.4960, lng: 54.4070, establishedYear: 2016, employeeRange: '51–200', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Comprehensive cybersecurity services including SOC operations and penetration testing.', descriptionAr: 'خدمات أمن سيبراني شاملة تشمل عمليات مركز العمليات الأمنية واختبار الاختراق.', tags: ['cybersecurity', 'SOC', 'compliance'], tagsAr: ['أمن سيبراني', 'مركز عمليات', 'امتثال'] },
  { id: 'c-004', name: 'AppForge Studio', nameAr: 'آب فورج ستوديو', sector: 'Technology', sectorAr: 'التكنولوجيا', subSector: 'Mobile Development', subSectorAr: 'تطوير التطبيقات', area: 'Downtown Abu Dhabi', areaAr: 'وسط أبوظبي', lat: 24.4880, lng: 54.3560, establishedYear: 2019, employeeRange: '11–50', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Mobile and web application development for startups and enterprises.', descriptionAr: 'تطوير تطبيقات الهاتف والويب للشركات الناشئة والمؤسسات.', tags: ['mobile', 'apps', 'web', 'startups'], tagsAr: ['تطبيقات', 'هاتف', 'ويب', 'شركات ناشئة'] },
  { id: 'c-005', name: 'GreenByte IoT', nameAr: 'جرين بايت لإنترنت الأشياء', sector: 'Technology', sectorAr: 'التكنولوجيا', subSector: 'IoT Solutions', subSectorAr: 'حلول إنترنت الأشياء', area: 'Masdar City', areaAr: 'مدينة مصدر', lat: 24.4255, lng: 54.6160, establishedYear: 2021, employeeRange: '1–10', legalType: 'Free Zone', status: 'Active', isGoldenVendor: false, description: 'Smart building and environmental monitoring IoT solutions for sustainable cities.', descriptionAr: 'حلول إنترنت الأشياء للمباني الذكية ومراقبة البيئة للمدن المستدامة.', tags: ['IoT', 'smart city', 'sensors', 'sustainability'], tagsAr: ['إنترنت الأشياء', 'مدينة ذكية', 'أجهزة استشعار', 'استدامة'] },
  // Real Estate (4)
  { id: 'c-006', name: 'Horizon Properties', nameAr: 'هوريزون العقارية', sector: 'Real Estate', sectorAr: 'العقارات', subSector: 'Commercial Leasing', subSectorAr: 'التأجير التجاري', area: 'Al Maryah Island', areaAr: 'جزيرة الماريه', lat: 24.5030, lng: 54.3950, establishedYear: 2012, employeeRange: '51–200', legalType: 'LLC', status: 'Active', isGoldenVendor: true, description: 'Premium commercial real estate leasing and property management in prime locations.', descriptionAr: 'تأجير عقارات تجارية متميزة وإدارة ممتلكات في مواقع رئيسية.', tags: ['commercial', 'leasing', 'property management'], tagsAr: ['تجاري', 'تأجير', 'إدارة ممتلكات'] },
  { id: 'c-007', name: 'Desert Rose Developers', nameAr: 'ديزرت روز للتطوير', sector: 'Real Estate', sectorAr: 'العقارات', subSector: 'Residential Development', subSectorAr: 'التطوير السكني', area: 'Saadiyat Island', areaAr: 'جزيرة السعديات', lat: 24.5410, lng: 54.4340, establishedYear: 2015, employeeRange: '200+', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Luxury residential development specializing in waterfront and island properties.', descriptionAr: 'تطوير سكني فاخر متخصص في العقارات المطلة على البحر والجزر.', tags: ['luxury', 'residential', 'waterfront'], tagsAr: ['فاخر', 'سكني', 'واجهة بحرية'] },
  { id: 'c-008', name: 'UrbanEdge Realty', nameAr: 'أوربان إيدج العقارية', sector: 'Real Estate', sectorAr: 'العقارات', subSector: 'Property Valuation', subSectorAr: 'تقييم العقارات', area: 'Corniche', areaAr: 'الكورنيش', lat: 24.4740, lng: 54.3440, establishedYear: 2017, employeeRange: '11–50', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Professional property valuation and real estate advisory services.', descriptionAr: 'خدمات تقييم عقاري واستشارات عقارية احترافية.', tags: ['valuation', 'advisory', 'real estate'], tagsAr: ['تقييم', 'استشارات', 'عقارات'] },
  { id: 'c-009', name: 'Capital Land Investments', nameAr: 'كابيتال لاند للاستثمارات', sector: 'Real Estate', sectorAr: 'العقارات', subSector: 'Investment', subSectorAr: 'الاستثمار العقاري', area: 'Al Reem Island', areaAr: 'جزيرة الريم', lat: 24.4940, lng: 54.4060, establishedYear: 2014, employeeRange: '11–50', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Real estate investment and portfolio management across UAE markets.', descriptionAr: 'إدارة الاستثمارات والمحافظ العقارية عبر أسواق الإمارات.', tags: ['investment', 'portfolio', 'UAE markets'], tagsAr: ['استثمار', 'محفظة', 'أسواق الإمارات'] },
  // Healthcare (4)
  { id: 'c-010', name: 'MedGulf Clinics', nameAr: 'عيادات ميدغلف', sector: 'Healthcare', sectorAr: 'الرعاية الصحية', subSector: 'Primary Care', subSectorAr: 'الرعاية الأولية', area: 'Khalifa City', areaAr: 'مدينة خليفة', lat: 24.4210, lng: 54.5790, establishedYear: 2013, employeeRange: '51–200', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Network of primary healthcare clinics providing family medicine and diagnostics.', descriptionAr: 'شبكة عيادات رعاية صحية أولية تقدم طب الأسرة والتشخيص.', tags: ['clinics', 'family medicine', 'diagnostics'], tagsAr: ['عيادات', 'طب أسرة', 'تشخيص'] },
  { id: 'c-011', name: 'BioVita Pharmaceuticals', nameAr: 'بيوفيتا للأدوية', sector: 'Healthcare', sectorAr: 'الرعاية الصحية', subSector: 'Pharmaceuticals', subSectorAr: 'الأدوية', area: 'Mussafah', areaAr: 'مصفح', lat: 24.3520, lng: 54.4790, establishedYear: 2010, employeeRange: '200+', legalType: 'LLC', status: 'Active', isGoldenVendor: true, description: 'Pharmaceutical manufacturing and distribution serving the MENA healthcare sector.', descriptionAr: 'تصنيع وتوزيع الأدوية لقطاع الرعاية الصحية في الشرق الأوسط وشمال أفريقيا.', tags: ['pharma', 'manufacturing', 'MENA'], tagsAr: ['أدوية', 'تصنيع', 'الشرق الأوسط'] },
  { id: 'c-012', name: 'HealthTech Innovations', nameAr: 'هيلث تك للابتكارات', sector: 'Healthcare', sectorAr: 'الرعاية الصحية', subSector: 'HealthTech', subSectorAr: 'التقنية الصحية', area: 'Masdar City', areaAr: 'مدينة مصدر', lat: 24.4270, lng: 54.6145, establishedYear: 2022, employeeRange: '11–50', legalType: 'Free Zone', status: 'Active', isGoldenVendor: false, description: 'Digital health platforms including telemedicine and patient management systems.', descriptionAr: 'منصات صحية رقمية تشمل التطبيب عن بُعد وأنظمة إدارة المرضى.', tags: ['healthtech', 'telemedicine', 'digital health'], tagsAr: ['تقنية صحية', 'طب عن بعد', 'صحة رقمية'] },
  { id: 'c-013', name: 'Al Noor Medical Supplies', nameAr: 'النور للمستلزمات الطبية', sector: 'Healthcare', sectorAr: 'الرعاية الصحية', subSector: 'Medical Equipment', subSectorAr: 'المعدات الطبية', area: 'Mussafah', areaAr: 'مصفح', lat: 24.3510, lng: 54.4810, establishedYear: 2008, employeeRange: '51–200', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Distributor of medical equipment and hospital supplies across the UAE.', descriptionAr: 'موزع للمعدات الطبية ومستلزمات المستشفيات في جميع أنحاء الإمارات.', tags: ['medical equipment', 'hospital supplies', 'distribution'], tagsAr: ['معدات طبية', 'مستلزمات مستشفيات', 'توزيع'] },
  // Retail (4)
  { id: 'c-014', name: 'Luxe Avenue', nameAr: 'لوكس أفنيو', sector: 'Retail', sectorAr: 'التجزئة', subSector: 'Luxury Retail', subSectorAr: 'التجزئة الفاخرة', area: 'Al Maryah Island', areaAr: 'جزيرة الماريه', lat: 24.5028, lng: 54.3935, establishedYear: 2016, employeeRange: '51–200', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Multi-brand luxury retail concept store featuring international fashion and lifestyle brands.', descriptionAr: 'متجر مفاهيم تجزئة فاخر متعدد العلامات يضم ماركات أزياء وأسلوب حياة عالمية.', tags: ['luxury', 'fashion', 'lifestyle', 'brands'], tagsAr: ['فاخر', 'أزياء', 'أسلوب حياة', 'ماركات'] },
  { id: 'c-015', name: 'TechMart Electronics', nameAr: 'تك مارت للإلكترونيات', sector: 'Retail', sectorAr: 'التجزئة', subSector: 'Electronics', subSectorAr: 'الإلكترونيات', area: 'Yas Island', areaAr: 'جزيرة ياس', lat: 24.4910, lng: 54.5990, establishedYear: 2019, employeeRange: '11–50', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Consumer electronics retailer with smart home and gaming technology focus.', descriptionAr: 'متجر إلكترونيات استهلاكية يركز على تقنيات المنزل الذكي والألعاب.', tags: ['electronics', 'smart home', 'gaming'], tagsAr: ['إلكترونيات', 'منزل ذكي', 'ألعاب'] },
  { id: 'c-016', name: 'Souq Al Bahar Trading', nameAr: 'سوق البحر للتجارة', sector: 'Retail', sectorAr: 'التجزئة', subSector: 'General Trading', subSectorAr: 'التجارة العامة', area: 'Al Zahiyah', areaAr: 'الزاهية', lat: 24.4860, lng: 54.3640, establishedYear: 2005, employeeRange: '11–50', legalType: 'Sole Proprietor', status: 'Active', isGoldenVendor: false, description: 'Traditional and modern general trading with wholesale and retail operations.', descriptionAr: 'تجارة عامة تقليدية وحديثة مع عمليات جملة وتجزئة.', tags: ['trading', 'wholesale', 'retail'], tagsAr: ['تجارة', 'جملة', 'تجزئة'] },
  { id: 'c-017', name: 'FreshMart Organics', nameAr: 'فريش مارت للعضوية', sector: 'Retail', sectorAr: 'التجزئة', subSector: 'Organic Foods', subSectorAr: 'الأغذية العضوية', area: 'Khalifa City', areaAr: 'مدينة خليفة', lat: 24.4220, lng: 54.5810, establishedYear: 2020, employeeRange: '11–50', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Premium organic grocery store with locally sourced and imported products.', descriptionAr: 'متجر بقالة عضوي متميز بمنتجات محلية ومستوردة.', tags: ['organic', 'grocery', 'healthy'], tagsAr: ['عضوي', 'بقالة', 'صحي'] },
  // F&B (4)
  { id: 'c-018', name: 'Spice Route Kitchen', nameAr: 'مطبخ طريق التوابل', sector: 'F&B', sectorAr: 'الأغذية والمشروبات', subSector: 'Cloud Kitchen', subSectorAr: 'المطبخ السحابي', area: 'Mussafah', areaAr: 'مصفح', lat: 24.3530, lng: 54.4800, establishedYear: 2021, employeeRange: '11–50', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Multi-brand cloud kitchen operating 5 delivery-only restaurant concepts.', descriptionAr: 'مطبخ سحابي متعدد العلامات يدير 5 مفاهيم مطاعم للتوصيل فقط.', tags: ['cloud kitchen', 'delivery', 'food tech'], tagsAr: ['مطبخ سحابي', 'توصيل', 'تقنية غذائية'] },
  { id: 'c-019', name: 'Arabica Coffee House', nameAr: 'أرابيكا كوفي هاوس', sector: 'F&B', sectorAr: 'الأغذية والمشروبات', subSector: 'Specialty Coffee', subSectorAr: 'القهوة المختصة', area: 'Corniche', areaAr: 'الكورنيش', lat: 24.4720, lng: 54.3460, establishedYear: 2018, employeeRange: '11–50', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Specialty third-wave coffee chain with 8 locations across Abu Dhabi.', descriptionAr: 'سلسلة قهوة مختصة بالموجة الثالثة مع 8 فروع في أبوظبي.', tags: ['coffee', 'specialty', 'chain'], tagsAr: ['قهوة', 'مختصة', 'سلسلة'] },
  { id: 'c-020', name: 'Gulf Catering Co.', nameAr: 'شركة الخليج للتموين', sector: 'F&B', sectorAr: 'الأغذية والمشروبات', subSector: 'Catering', subSectorAr: 'التموين', area: 'Mussafah', areaAr: 'مصفح', lat: 24.3540, lng: 54.4780, establishedYear: 2009, employeeRange: '200+', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Large-scale industrial and event catering for corporates and government entities.', descriptionAr: 'تموين صناعي وفعاليات واسع النطاق للشركات والجهات الحكومية.', tags: ['catering', 'corporate', 'events'], tagsAr: ['تموين', 'شركات', 'فعاليات'] },
  { id: 'c-021', name: 'Zafran Restaurant Group', nameAr: 'مجموعة مطاعم زعفران', sector: 'F&B', sectorAr: 'الأغذية والمشروبات', subSector: 'Fine Dining', subSectorAr: 'المطاعم الراقية', area: 'Saadiyat Island', areaAr: 'جزيرة السعديات', lat: 24.5390, lng: 54.4360, establishedYear: 2017, employeeRange: '51–200', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Award-winning fine dining restaurant group with Emirati-fusion cuisine.', descriptionAr: 'مجموعة مطاعم راقية حائزة على جوائز بمطبخ إماراتي مدمج.', tags: ['fine dining', 'Emirati', 'fusion'], tagsAr: ['مطاعم راقية', 'إماراتي', 'مدمج'] },
  // Logistics (3)
  { id: 'c-022', name: 'SwiftCargo Logistics', nameAr: 'سويفت كارجو للخدمات اللوجستية', sector: 'Logistics', sectorAr: 'الخدمات اللوجستية', subSector: 'Freight Forwarding', subSectorAr: 'شحن البضائع', area: 'Mussafah', areaAr: 'مصفح', lat: 24.3490, lng: 54.4820, establishedYear: 2011, employeeRange: '200+', legalType: 'LLC', status: 'Active', isGoldenVendor: true, description: 'Full-service freight forwarding and customs brokerage with global network.', descriptionAr: 'شحن بضائع وتخليص جمركي متكامل مع شبكة عالمية.', tags: ['freight', 'customs', 'shipping', 'global'], tagsAr: ['شحن', 'جمارك', 'شحن بحري', 'عالمي'] },
  { id: 'c-023', name: 'LastMile Express', nameAr: 'لاست مايل إكسبريس', sector: 'Logistics', sectorAr: 'الخدمات اللوجستية', subSector: 'Last-Mile Delivery', subSectorAr: 'التوصيل المحلي', area: 'Khalifa City', areaAr: 'مدينة خليفة', lat: 24.4190, lng: 54.5820, establishedYear: 2020, employeeRange: '51–200', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Technology-driven last-mile delivery service for e-commerce and retail.', descriptionAr: 'خدمة توصيل الميل الأخير مدعومة بالتكنولوجيا للتجارة الإلكترونية والتجزئة.', tags: ['delivery', 'e-commerce', 'last mile'], tagsAr: ['توصيل', 'تجارة إلكترونية', 'الميل الأخير'] },
  { id: 'c-024', name: 'Khalij Warehousing', nameAr: 'الخليج للتخزين', sector: 'Logistics', sectorAr: 'الخدمات اللوجستية', subSector: 'Warehousing', subSectorAr: 'التخزين', area: 'Mussafah', areaAr: 'مصفح', lat: 24.3480, lng: 54.4850, establishedYear: 2007, employeeRange: '51–200', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Temperature-controlled warehousing and distribution facilities in KIZAD.', descriptionAr: 'مرافق تخزين وتوزيع مبردة في كيزاد.', tags: ['warehousing', 'cold storage', 'KIZAD'], tagsAr: ['تخزين', 'تبريد', 'كيزاد'] },
  // Construction (3)
  { id: 'c-025', name: 'Pinnacle Builders', nameAr: 'بيناكل للبناء', sector: 'Construction', sectorAr: 'البناء والتشييد', subSector: 'General Contracting', subSectorAr: 'المقاولات العامة', area: 'Mussafah', areaAr: 'مصفح', lat: 24.3550, lng: 54.4770, establishedYear: 2006, employeeRange: '200+', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Tier-1 general contractor for large-scale commercial and infrastructure projects.', descriptionAr: 'مقاول عام من الدرجة الأولى للمشاريع التجارية والبنية التحتية الكبيرة.', tags: ['contracting', 'infrastructure', 'commercial'], tagsAr: ['مقاولات', 'بنية تحتية', 'تجاري'] },
  { id: 'c-026', name: 'GreenBuild Contractors', nameAr: 'جرين بيلد للمقاولات', sector: 'Construction', sectorAr: 'البناء والتشييد', subSector: 'Green Building', subSectorAr: 'البناء الأخضر', area: 'Masdar City', areaAr: 'مدينة مصدر', lat: 24.4260, lng: 54.6155, establishedYear: 2015, employeeRange: '51–200', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Sustainable construction specializing in LEED-certified green buildings.', descriptionAr: 'بناء مستدام متخصص في المباني الخضراء المعتمدة من LEED.', tags: ['green building', 'LEED', 'sustainable'], tagsAr: ['بناء أخضر', 'LEED', 'مستدام'] },
  { id: 'c-027', name: 'Al Safar Interiors', nameAr: 'السفر للديكور الداخلي', sector: 'Construction', sectorAr: 'البناء والتشييد', subSector: 'Interior Fit-Out', subSectorAr: 'التشطيبات الداخلية', area: 'Downtown Abu Dhabi', areaAr: 'وسط أبوظبي', lat: 24.4875, lng: 54.3575, establishedYear: 2014, employeeRange: '11–50', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Commercial and hospitality interior fit-out and design services.', descriptionAr: 'خدمات التشطيبات الداخلية والتصميم للقطاع التجاري والضيافة.', tags: ['interior', 'fit-out', 'design', 'hospitality'], tagsAr: ['ديكور', 'تشطيبات', 'تصميم', 'ضيافة'] },
  // Finance (4)
  { id: 'c-028', name: 'Falcon Capital Advisors', nameAr: 'فالكون كابيتال للاستشارات', sector: 'Finance', sectorAr: 'المالية', subSector: 'Wealth Management', subSectorAr: 'إدارة الثروات', area: 'ADGM', areaAr: 'سوق أبوظبي العالمي', lat: 24.5015, lng: 54.3945, establishedYear: 2016, employeeRange: '11–50', legalType: 'Free Zone', status: 'Active', isGoldenVendor: false, description: 'Boutique wealth management and investment advisory for HNWI clients.', descriptionAr: 'إدارة ثروات واستشارات استثمارية لعملاء الأثرياء.', tags: ['wealth', 'investment', 'HNWI', 'advisory'], tagsAr: ['ثروات', 'استثمار', 'أثرياء', 'استشارات'] },
  { id: 'c-029', name: 'PayFlow Fintech', nameAr: 'باي فلو للتقنية المالية', sector: 'Finance', sectorAr: 'المالية', subSector: 'FinTech', subSectorAr: 'التقنية المالية', area: 'ADGM', areaAr: 'سوق أبوظبي العالمي', lat: 24.5022, lng: 54.3938, establishedYear: 2021, employeeRange: '11–50', legalType: 'Free Zone', status: 'Active', isGoldenVendor: false, description: 'Digital payment solutions and cross-border remittance platform.', descriptionAr: 'حلول دفع رقمية ومنصة تحويلات دولية.', tags: ['fintech', 'payments', 'remittance', 'digital'], tagsAr: ['تقنية مالية', 'مدفوعات', 'تحويلات', 'رقمي'] },
  { id: 'c-030', name: 'Takaful Shield Insurance', nameAr: 'تكافل شيلد للتأمين', sector: 'Finance', sectorAr: 'المالية', subSector: 'Islamic Insurance', subSectorAr: 'التأمين التكافلي', area: 'Al Zahiyah', areaAr: 'الزاهية', lat: 24.4845, lng: 54.3660, establishedYear: 2012, employeeRange: '51–200', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Sharia-compliant takaful insurance products for individuals and businesses.', descriptionAr: 'منتجات تأمين تكافلي متوافقة مع الشريعة للأفراد والشركات.', tags: ['takaful', 'insurance', 'sharia', 'Islamic'], tagsAr: ['تكافل', 'تأمين', 'شريعة', 'إسلامي'] },
  { id: 'c-031', name: 'Gulf Audit Partners', nameAr: 'شركاء تدقيق الخليج', sector: 'Finance', sectorAr: 'المالية', subSector: 'Audit & Accounting', subSectorAr: 'التدقيق والمحاسبة', area: 'Downtown Abu Dhabi', areaAr: 'وسط أبوظبي', lat: 24.4865, lng: 54.3580, establishedYear: 2009, employeeRange: '51–200', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Full-service audit, tax advisory, and accounting firm serving the GCC.', descriptionAr: 'شركة تدقيق واستشارات ضريبية ومحاسبة شاملة تخدم دول الخليج.', tags: ['audit', 'tax', 'accounting', 'GCC'], tagsAr: ['تدقيق', 'ضرائب', 'محاسبة', 'الخليج'] },
  // Education (3)
  { id: 'c-032', name: 'EduStar Academy', nameAr: 'أكاديمية إيدو ستار', sector: 'Education', sectorAr: 'التعليم', subSector: 'K-12 Education', subSectorAr: 'التعليم المدرسي', area: 'Khalifa City', areaAr: 'مدينة خليفة', lat: 24.4230, lng: 54.5780, establishedYear: 2011, employeeRange: '200+', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'International curriculum school offering IB and British programs from KG to Grade 12.', descriptionAr: 'مدرسة منهج دولي تقدم برامج IB والبريطانية من الروضة إلى الصف 12.', tags: ['school', 'IB', 'British', 'K-12'], tagsAr: ['مدرسة', 'IB', 'بريطاني', 'تعليم مدرسي'] },
  { id: 'c-033', name: 'SkillBridge Training', nameAr: 'سكيل بريدج للتدريب', sector: 'Education', sectorAr: 'التعليم', subSector: 'Professional Training', subSectorAr: 'التدريب المهني', area: 'Al Reem Island', areaAr: 'جزيرة الريم', lat: 24.4945, lng: 54.4045, establishedYear: 2019, employeeRange: '11–50', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Corporate training and professional development programs in leadership and technology.', descriptionAr: 'برامج تدريب مؤسسي وتطوير مهني في القيادة والتكنولوجيا.', tags: ['training', 'corporate', 'leadership', 'professional'], tagsAr: ['تدريب', 'مؤسسي', 'قيادة', 'مهني'] },
  { id: 'c-034', name: 'CodeCamp UAE', nameAr: 'كود كامب الإمارات', sector: 'Education', sectorAr: 'التعليم', subSector: 'EdTech', subSectorAr: 'التعليم التقني', area: 'Masdar City', areaAr: 'مدينة مصدر', lat: 24.4275, lng: 54.6148, establishedYear: 2022, employeeRange: '1–10', legalType: 'Free Zone', status: 'Active', isGoldenVendor: false, description: 'Coding bootcamp and tech education platform for youth and career changers.', descriptionAr: 'معسكر برمجة ومنصة تعليم تقني للشباب والمتحولين مهنياً.', tags: ['coding', 'bootcamp', 'edtech', 'youth'], tagsAr: ['برمجة', 'معسكر', 'تعليم تقني', 'شباب'] },
  // Consulting (4)
  { id: 'c-035', name: 'Stratagem Advisory', nameAr: 'ستراتيجيم للاستشارات', sector: 'Consulting', sectorAr: 'الاستشارات', subSector: 'Management Consulting', subSectorAr: 'الاستشارات الإدارية', area: 'Al Maryah Island', areaAr: 'جزيرة الماريه', lat: 24.5035, lng: 54.3945, establishedYear: 2014, employeeRange: '51–200', legalType: 'LLC', status: 'Active', isGoldenVendor: true, description: 'Top-tier management consulting firm advising government and Fortune 500 clients.', descriptionAr: 'شركة استشارات إدارية رائدة تقدم خدماتها للحكومات وشركات فورتشن 500.', tags: ['consulting', 'management', 'strategy', 'government'], tagsAr: ['استشارات', 'إدارة', 'استراتيجية', 'حكومة'] },
  { id: 'c-036', name: 'ESG Compass', nameAr: 'بوصلة ESG', sector: 'Consulting', sectorAr: 'الاستشارات', subSector: 'ESG Advisory', subSectorAr: 'استشارات الاستدامة', area: 'ADGM', areaAr: 'سوق أبوظبي العالمي', lat: 24.5016, lng: 54.3942, establishedYear: 2020, employeeRange: '1–10', legalType: 'Free Zone', status: 'Active', isGoldenVendor: false, description: 'Specialized ESG strategy and sustainability reporting consultancy.', descriptionAr: 'استشارات متخصصة في استراتيجية ESG وتقارير الاستدامة.', tags: ['ESG', 'sustainability', 'reporting', 'climate'], tagsAr: ['ESG', 'استدامة', 'تقارير', 'مناخ'] },
  { id: 'c-037', name: 'LegalEdge Consultants', nameAr: 'ليجال إيدج للاستشارات', sector: 'Consulting', sectorAr: 'الاستشارات', subSector: 'Legal Advisory', subSectorAr: 'الاستشارات القانونية', area: 'Downtown Abu Dhabi', areaAr: 'وسط أبوظبي', lat: 24.4878, lng: 54.3568, establishedYear: 2013, employeeRange: '11–50', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Business setup and regulatory compliance advisory for foreign investors.', descriptionAr: 'استشارات تأسيس الأعمال والامتثال التنظيمي للمستثمرين الأجانب.', tags: ['legal', 'business setup', 'compliance', 'investors'], tagsAr: ['قانون', 'تأسيس أعمال', 'امتثال', 'مستثمرين'] },
  { id: 'c-038', name: 'MarketPulse Research', nameAr: 'ماركت بالس للأبحاث', sector: 'Consulting', sectorAr: 'الاستشارات', subSector: 'Market Research', subSectorAr: 'أبحاث السوق', area: 'Al Reem Island', areaAr: 'جزيرة الريم', lat: 24.4955, lng: 54.4055, establishedYear: 2018, employeeRange: '11–50', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Market research, consumer insights, and competitive intelligence agency.', descriptionAr: 'وكالة أبحاث سوق ورؤى المستهلك واستخبارات تنافسية.', tags: ['research', 'insights', 'competitive intelligence'], tagsAr: ['أبحاث', 'رؤى', 'استخبارات تنافسية'] },
  // Manufacturing (4)
  { id: 'c-039', name: 'Gulf Polymers', nameAr: 'الخليج للبوليمرات', sector: 'Manufacturing', sectorAr: 'التصنيع', subSector: 'Plastics & Packaging', subSectorAr: 'البلاستيك والتغليف', area: 'Mussafah', areaAr: 'مصفح', lat: 24.3460, lng: 54.4830, establishedYear: 2003, employeeRange: '200+', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Industrial plastics manufacturing and sustainable packaging solutions.', descriptionAr: 'تصنيع بلاستيك صناعي وحلول تغليف مستدامة.', tags: ['plastics', 'packaging', 'manufacturing', 'industrial'], tagsAr: ['بلاستيك', 'تغليف', 'تصنيع', 'صناعي'] },
  { id: 'c-040', name: 'SolarTech Manufacturing', nameAr: 'سولار تك للتصنيع', sector: 'Manufacturing', sectorAr: 'التصنيع', subSector: 'Solar Equipment', subSectorAr: 'معدات الطاقة الشمسية', area: 'Masdar City', areaAr: 'مدينة مصدر', lat: 24.4250, lng: 54.6165, establishedYear: 2017, employeeRange: '51–200', legalType: 'Free Zone', status: 'Active', isGoldenVendor: false, description: 'Solar panel and renewable energy equipment manufacturing facility.', descriptionAr: 'منشأة تصنيع الألواح الشمسية ومعدات الطاقة المتجددة.', tags: ['solar', 'renewable', 'manufacturing', 'energy'], tagsAr: ['شمسي', 'متجدد', 'تصنيع', 'طاقة'] },
  { id: 'c-041', name: 'Al Emarat Steel Works', nameAr: 'الإمارات للأعمال الفولاذية', sector: 'Manufacturing', sectorAr: 'التصنيع', subSector: 'Steel Fabrication', subSectorAr: 'تصنيع الفولاذ', area: 'Mussafah', areaAr: 'مصفح', lat: 24.3470, lng: 54.4840, establishedYear: 2001, employeeRange: '200+', legalType: 'LLC', status: 'Inactive', isGoldenVendor: false, description: 'Structural steel fabrication for construction and oil & gas sectors.', descriptionAr: 'تصنيع الفولاذ الإنشائي لقطاعي البناء والنفط والغاز.', tags: ['steel', 'fabrication', 'oil & gas', 'construction'], tagsAr: ['فولاذ', 'تصنيع', 'نفط وغاز', 'بناء'] },
  { id: 'c-042', name: 'AquaPure Filtration', nameAr: 'أكوا بيور للتنقية', sector: 'Manufacturing', sectorAr: 'التصنيع', subSector: 'Water Treatment', subSectorAr: 'معالجة المياه', area: 'Al Ain', areaAr: 'العين', lat: 24.2080, lng: 55.7440, establishedYear: 2014, employeeRange: '51–200', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Water filtration and desalination equipment manufacturer for industrial use.', descriptionAr: 'مصنع معدات تنقية المياه وتحلية المياه للاستخدام الصناعي.', tags: ['water', 'filtration', 'desalination', 'industrial'], tagsAr: ['مياه', 'تنقية', 'تحلية', 'صناعي'] },
  // Tourism (4)
  { id: 'c-043', name: 'Desert Safari Experiences', nameAr: 'تجارب سفاري الصحراء', sector: 'Tourism', sectorAr: 'السياحة', subSector: 'Adventure Tourism', subSectorAr: 'السياحة المغامرة', area: 'Yas Island', areaAr: 'جزيرة ياس', lat: 24.4905, lng: 54.6010, establishedYear: 2015, employeeRange: '11–50', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Desert safari tours, dune bashing, and cultural camp experiences.', descriptionAr: 'جولات سفاري صحراوية ورحلات الكثبان وتجارب المخيمات الثقافية.', tags: ['safari', 'desert', 'adventure', 'cultural'], tagsAr: ['سفاري', 'صحراء', 'مغامرة', 'ثقافة'] },
  { id: 'c-044', name: 'AbuDhabi Travel Hub', nameAr: 'مركز أبوظبي للسفر', sector: 'Tourism', sectorAr: 'السياحة', subSector: 'Travel Agency', subSectorAr: 'وكالة سفر', area: 'Corniche', areaAr: 'الكورنيش', lat: 24.4735, lng: 54.3445, establishedYear: 2012, employeeRange: '11–50', legalType: 'LLC', status: 'Active', isGoldenVendor: false, description: 'Full-service travel agency specializing in luxury and business travel packages.', descriptionAr: 'وكالة سفر متكاملة متخصصة في باقات السفر الفاخرة والتجارية.', tags: ['travel', 'luxury', 'business travel', 'packages'], tagsAr: ['سفر', 'فاخر', 'سفر تجاري', 'باقات'] },
  { id: 'c-045', name: 'Heritage Cultural Tours', nameAr: 'جولات التراث الثقافي', sector: 'Tourism', sectorAr: 'السياحة', subSector: 'Cultural Tourism', subSectorAr: 'السياحة الثقافية', area: 'Saadiyat Island', areaAr: 'جزيرة السعديات', lat: 24.5395, lng: 54.4355, establishedYear: 2019, employeeRange: '1–10', legalType: 'Sole Proprietor', status: 'Active', isGoldenVendor: false, description: 'Guided cultural tours covering Louvre Abu Dhabi, heritage sites, and local traditions.', descriptionAr: 'جولات ثقافية مصحوبة بمرشدين تشمل متحف اللوفر أبوظبي والمواقع التراثية والتقاليد المحلية.', tags: ['cultural', 'tours', 'Louvre', 'heritage'], tagsAr: ['ثقافة', 'جولات', 'اللوفر', 'تراث'] },
  { id: 'c-046', name: 'Oasis Hospitality Management', nameAr: 'واحة لإدارة الضيافة', sector: 'Tourism', sectorAr: 'السياحة', subSector: 'Hotel Management', subSectorAr: 'إدارة الفنادق', area: 'Yas Island', areaAr: 'جزيرة ياس', lat: 24.4895, lng: 54.5995, establishedYear: 2016, employeeRange: '200+', legalType: 'LLC', status: 'Active', isGoldenVendor: true, description: 'Hotel and resort management company operating 5 properties in Abu Dhabi.', descriptionAr: 'شركة إدارة فنادق ومنتجعات تدير 5 عقارات في أبوظبي.', tags: ['hotel', 'hospitality', 'resort', 'management'], tagsAr: ['فندق', 'ضيافة', 'منتجع', 'إدارة'] },
]

// ─── Area Stats (12) ────────────────────────────────────────────────────────

export const allAreaStats: AreaStat[] = [
  { area: 'Al Maryah Island', areaAr: 'جزيرة الماريه', lat: 24.5025, lng: 54.3942, totalCompanies: 48, topSectors: ['Finance', 'Consulting', 'Retail'], topSectorsAr: ['المالية', 'الاستشارات', 'التجزئة'], saturationLevel: 'Very High', growthTrend: 'Growing', averageRent: 'AED 185,000/yr', averageRentAr: '185,000 درهم/سنة', keyInfrastructure: ['Metro Access', 'Luxury Mall', 'Financial Centre'], keyInfrastructureAr: ['مترو', 'مول فاخر', 'مركز مالي'] },
  { area: 'Khalifa City', areaAr: 'مدينة خليفة', lat: 24.4200, lng: 54.5800, totalCompanies: 35, topSectors: ['Healthcare', 'Education', 'Retail'], topSectorsAr: ['الرعاية الصحية', 'التعليم', 'التجزئة'], saturationLevel: 'Medium', growthTrend: 'Growing', averageRent: 'AED 65,000/yr', averageRentAr: '65,000 درهم/سنة', keyInfrastructure: ['Airport Nearby', 'Residential Hub', 'Schools'], keyInfrastructureAr: ['قرب المطار', 'مركز سكني', 'مدارس'] },
  { area: 'ADGM', areaAr: 'سوق أبوظبي العالمي', lat: 24.5018, lng: 54.3940, totalCompanies: 62, topSectors: ['Finance', 'Technology', 'Consulting'], topSectorsAr: ['المالية', 'التكنولوجيا', 'الاستشارات'], saturationLevel: 'Very High', growthTrend: 'Growing', averageRent: 'AED 220,000/yr', averageRentAr: '220,000 درهم/سنة', keyInfrastructure: ['Free Zone', 'Financial Centre', 'Regulatory Hub'], keyInfrastructureAr: ['منطقة حرة', 'مركز مالي', 'مركز تنظيمي'] },
  { area: 'Masdar City', areaAr: 'مدينة مصدر', lat: 24.4267, lng: 54.6150, totalCompanies: 28, topSectors: ['Technology', 'Manufacturing', 'Education'], topSectorsAr: ['التكنولوجيا', 'التصنيع', 'التعليم'], saturationLevel: 'Low', growthTrend: 'Growing', averageRent: 'AED 95,000/yr', averageRentAr: '95,000 درهم/سنة', keyInfrastructure: ['Free Zone', 'Sustainability Hub', 'Research Centre'], keyInfrastructureAr: ['منطقة حرة', 'مركز استدامة', 'مركز أبحاث'] },
  { area: 'Mussafah', areaAr: 'مصفح', lat: 24.3500, lng: 54.4800, totalCompanies: 85, topSectors: ['Manufacturing', 'Logistics', 'Construction'], topSectorsAr: ['التصنيع', 'الخدمات اللوجستية', 'البناء والتشييد'], saturationLevel: 'High', growthTrend: 'Stable', averageRent: 'AED 45,000/yr', averageRentAr: '45,000 درهم/سنة', keyInfrastructure: ['Port Proximity', 'Industrial Zone', 'KIZAD'], keyInfrastructureAr: ['قرب الميناء', 'منطقة صناعية', 'كيزاد'] },
  { area: 'Al Reem Island', areaAr: 'جزيرة الريم', lat: 24.4950, lng: 54.4050, totalCompanies: 42, topSectors: ['Technology', 'Consulting', 'Education'], topSectorsAr: ['التكنولوجيا', 'الاستشارات', 'التعليم'], saturationLevel: 'Medium', growthTrend: 'Growing', averageRent: 'AED 110,000/yr', averageRentAr: '110,000 درهم/سنة', keyInfrastructure: ['Residential Hub', 'Office Towers', 'Waterfront'], keyInfrastructureAr: ['مركز سكني', 'أبراج مكتبية', 'واجهة بحرية'] },
  { area: 'Downtown Abu Dhabi', areaAr: 'وسط أبوظبي', lat: 24.4870, lng: 54.3570, totalCompanies: 55, topSectors: ['Consulting', 'Finance', 'Construction'], topSectorsAr: ['الاستشارات', 'المالية', 'البناء والتشييد'], saturationLevel: 'High', growthTrend: 'Stable', averageRent: 'AED 130,000/yr', averageRentAr: '130,000 درهم/سنة', keyInfrastructure: ['Government Proximity', 'Metro Access', 'Commercial Hub'], keyInfrastructureAr: ['قرب الحكومة', 'مترو', 'مركز تجاري'] },
  { area: 'Saadiyat Island', areaAr: 'جزيرة السعديات', lat: 24.5400, lng: 54.4350, totalCompanies: 22, topSectors: ['Tourism', 'Real Estate', 'F&B'], topSectorsAr: ['السياحة', 'العقارات', 'الأغذية والمشروبات'], saturationLevel: 'Low', growthTrend: 'Growing', averageRent: 'AED 160,000/yr', averageRentAr: '160,000 درهم/سنة', keyInfrastructure: ['Cultural District', 'Beach Access', 'Louvre Museum'], keyInfrastructureAr: ['حي ثقافي', 'شاطئ', 'متحف اللوفر'] },
  { area: 'Al Ain', areaAr: 'العين', lat: 24.2075, lng: 55.7447, totalCompanies: 30, topSectors: ['Manufacturing', 'Healthcare', 'Education'], topSectorsAr: ['التصنيع', 'الرعاية الصحية', 'التعليم'], saturationLevel: 'Low', growthTrend: 'Stable', averageRent: 'AED 35,000/yr', averageRentAr: '35,000 درهم/سنة', keyInfrastructure: ['University City', 'Agriculture Zone', 'Affordable Rent'], keyInfrastructureAr: ['مدينة جامعية', 'منطقة زراعية', 'إيجار معقول'] },
  { area: 'Yas Island', areaAr: 'جزيرة ياس', lat: 24.4900, lng: 54.6000, totalCompanies: 25, topSectors: ['Tourism', 'Retail', 'F&B'], topSectorsAr: ['السياحة', 'التجزئة', 'الأغذية والمشروبات'], saturationLevel: 'Medium', growthTrend: 'Growing', averageRent: 'AED 140,000/yr', averageRentAr: '140,000 درهم/سنة', keyInfrastructure: ['Theme Parks', 'Entertainment Hub', 'Airport Nearby'], keyInfrastructureAr: ['حدائق ترفيهية', 'مركز ترفيه', 'قرب المطار'] },
  { area: 'Corniche', areaAr: 'الكورنيش', lat: 24.4730, lng: 54.3450, totalCompanies: 38, topSectors: ['Tourism', 'F&B', 'Real Estate'], topSectorsAr: ['السياحة', 'الأغذية والمشروبات', 'العقارات'], saturationLevel: 'Medium', growthTrend: 'Stable', averageRent: 'AED 120,000/yr', averageRentAr: '120,000 درهم/سنة', keyInfrastructure: ['Waterfront', 'Hotels', 'Government Proximity'], keyInfrastructureAr: ['واجهة بحرية', 'فنادق', 'قرب الحكومة'] },
  { area: 'Al Zahiyah', areaAr: 'الزاهية', lat: 24.4850, lng: 54.3650, totalCompanies: 32, topSectors: ['Retail', 'Finance', 'F&B'], topSectorsAr: ['التجزئة', 'المالية', 'الأغذية والمشروبات'], saturationLevel: 'Medium', growthTrend: 'Stable', averageRent: 'AED 75,000/yr', averageRentAr: '75,000 درهم/سنة', keyInfrastructure: ['Commercial District', 'Retail Hub', 'Central Location'], keyInfrastructureAr: ['منطقة تجارية', 'مركز تجزئة', 'موقع مركزي'] },
]

// ─── Sector Stats (12) ──────────────────────────────────────────────────────

export const allSectorStats: SectorStat[] = [
  { sector: 'Technology', sectorAr: 'التكنولوجيا', totalCompanies: 45, growthRate: '+18% YoY', topAreas: ['Masdar City', 'ADGM', 'Al Reem Island'], topAreasAr: ['مدينة مصدر', 'سوق أبوظبي العالمي', 'جزيرة الريم'], saturationLevel: 'Medium', opportunityScore: 9, keyDrivers: ['Government digital transformation', 'AI adoption mandates', 'Startup ecosystem growth'], keyDriversAr: ['التحول الرقمي الحكومي', 'تبني الذكاء الاصطناعي', 'نمو بيئة الشركات الناشئة'] },
  { sector: 'Real Estate', sectorAr: 'العقارات', totalCompanies: 38, growthRate: '+8% YoY', topAreas: ['Al Maryah Island', 'Saadiyat Island', 'Al Reem Island'], topAreasAr: ['جزيرة الماريه', 'جزيرة السعديات', 'جزيرة الريم'], saturationLevel: 'High', opportunityScore: 6, keyDrivers: ['Population growth', 'Golden Visa program', 'Tourism expansion'], keyDriversAr: ['النمو السكاني', 'برنامج الإقامة الذهبية', 'توسع السياحة'] },
  { sector: 'Healthcare', sectorAr: 'الرعاية الصحية', totalCompanies: 32, growthRate: '+14% YoY', topAreas: ['Khalifa City', 'Mussafah', 'Al Reem Island'], topAreasAr: ['مدينة خليفة', 'مصفح', 'جزيرة الريم'], saturationLevel: 'Medium', opportunityScore: 8, keyDrivers: ['Aging population', 'Medical tourism', 'HealthTech innovation'], keyDriversAr: ['شيخوخة السكان', 'السياحة العلاجية', 'ابتكار التقنية الصحية'] },
  { sector: 'Retail', sectorAr: 'التجزئة', totalCompanies: 52, growthRate: '+6% YoY', topAreas: ['Al Maryah Island', 'Yas Island', 'Al Zahiyah'], topAreasAr: ['جزيرة الماريه', 'جزيرة ياس', 'الزاهية'], saturationLevel: 'Very High', opportunityScore: 4, keyDrivers: ['E-commerce growth', 'Consumer spending recovery', 'Tourist footfall'], keyDriversAr: ['نمو التجارة الإلكترونية', 'تعافي الإنفاق الاستهلاكي', 'تدفق السياح'] },
  { sector: 'F&B', sectorAr: 'الأغذية والمشروبات', totalCompanies: 65, growthRate: '+10% YoY', topAreas: ['Corniche', 'Saadiyat Island', 'Yas Island'], topAreasAr: ['الكورنيش', 'جزيرة السعديات', 'جزيرة ياس'], saturationLevel: 'High', opportunityScore: 5, keyDrivers: ['Tourism growth', 'Cloud kitchen trend', 'Specialty dining demand'], keyDriversAr: ['نمو السياحة', 'اتجاه المطابخ السحابية', 'الطلب على المطاعم المتخصصة'] },
  { sector: 'Logistics', sectorAr: 'الخدمات اللوجستية', totalCompanies: 28, growthRate: '+12% YoY', topAreas: ['Mussafah', 'Khalifa City', 'Al Ain'], topAreasAr: ['مصفح', 'مدينة خليفة', 'العين'], saturationLevel: 'Medium', opportunityScore: 8, keyDrivers: ['E-commerce boom', 'Port expansion', 'Regional hub positioning'], keyDriversAr: ['طفرة التجارة الإلكترونية', 'توسع الموانئ', 'مكانة المركز الإقليمي'] },
  { sector: 'Construction', sectorAr: 'البناء والتشييد', totalCompanies: 42, growthRate: '+5% YoY', topAreas: ['Mussafah', 'Downtown Abu Dhabi', 'Masdar City'], topAreasAr: ['مصفح', 'وسط أبوظبي', 'مدينة مصدر'], saturationLevel: 'High', opportunityScore: 5, keyDrivers: ['Infrastructure spending', 'Green building mandates', 'Expo legacy projects'], keyDriversAr: ['الإنفاق على البنية التحتية', 'متطلبات البناء الأخضر', 'مشاريع إرث إكسبو'] },
  { sector: 'Finance', sectorAr: 'المالية', totalCompanies: 55, growthRate: '+15% YoY', topAreas: ['ADGM', 'Al Maryah Island', 'Downtown Abu Dhabi'], topAreasAr: ['سوق أبوظبي العالمي', 'جزيرة الماريه', 'وسط أبوظبي'], saturationLevel: 'High', opportunityScore: 7, keyDrivers: ['ADGM fintech licenses', 'Islamic finance growth', 'Wealth management demand'], keyDriversAr: ['تراخيص التقنية المالية من ADGM', 'نمو التمويل الإسلامي', 'الطلب على إدارة الثروات'] },
  { sector: 'Education', sectorAr: 'التعليم', totalCompanies: 25, growthRate: '+11% YoY', topAreas: ['Khalifa City', 'Al Reem Island', 'Al Ain'], topAreasAr: ['مدينة خليفة', 'جزيرة الريم', 'العين'], saturationLevel: 'Low', opportunityScore: 8, keyDrivers: ['Emiratisation programs', 'EdTech adoption', 'International school demand'], keyDriversAr: ['برامج التوطين', 'تبني التعليم التقني', 'الطلب على المدارس الدولية'] },
  { sector: 'Consulting', sectorAr: 'الاستشارات', totalCompanies: 35, growthRate: '+9% YoY', topAreas: ['Al Maryah Island', 'ADGM', 'Downtown Abu Dhabi'], topAreasAr: ['جزيرة الماريه', 'سوق أبوظبي العالمي', 'وسط أبوظبي'], saturationLevel: 'Medium', opportunityScore: 7, keyDrivers: ['ESG compliance demand', 'Digital transformation', 'Foreign investment advisory'], keyDriversAr: ['الطلب على امتثال ESG', 'التحول الرقمي', 'استشارات الاستثمار الأجنبي'] },
  { sector: 'Manufacturing', sectorAr: 'التصنيع', totalCompanies: 30, growthRate: '+7% YoY', topAreas: ['Mussafah', 'Masdar City', 'Al Ain'], topAreasAr: ['مصفح', 'مدينة مصدر', 'العين'], saturationLevel: 'Medium', opportunityScore: 7, keyDrivers: ['In-country value program', 'Clean energy manufacturing', 'Supply chain localisation'], keyDriversAr: ['برنامج القيمة المحلية المضافة', 'تصنيع الطاقة النظيفة', 'توطين سلاسل التوريد'] },
  { sector: 'Tourism', sectorAr: 'السياحة', totalCompanies: 22, growthRate: '+20% YoY', topAreas: ['Yas Island', 'Saadiyat Island', 'Corniche'], topAreasAr: ['جزيرة ياس', 'جزيرة السعديات', 'الكورنيش'], saturationLevel: 'Low', opportunityScore: 9, keyDrivers: ['Visitor number records', 'Cultural attractions', 'Event hosting expansion'], keyDriversAr: ['أرقام قياسية للزوار', 'معالم ثقافية', 'توسع استضافة الفعاليات'] },
]
