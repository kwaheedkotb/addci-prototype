'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

interface FormData {
  // Step 1: Basic Info
  applicantName: string
  organizationName: string
  email: string
  phoneNumber: string
  tradeLicenseNumber: string
  sector: string
  subSector: string
  country: string

  // Step 2: ESG Profile
  environmentalProfile: {
    description: string
    carbonEmissions: string
    energyReduction: string
    wasteManagement: string
    waterConservation: string
  }
  socialProfile: {
    description: string
    workforceDiversity: string
    communityPrograms: string
    healthAndSafety: string
    employeeWellbeing: string
  }
  governanceProfile: {
    description: string
    boardStructure: string
    complianceFrameworks: string
    riskManagement: string
    transparency: string
  }

  // Step 3: Documents
  documents: {
    file: File | null
    type: string
    fileName: string
    ocrStatus: 'pending' | 'processing' | 'complete' | 'error'
    ocrResult?: string
    aiReview?: string
  }[]
}

const initialFormData: FormData = {
  applicantName: '',
  organizationName: '',
  email: '',
  phoneNumber: '',
  tradeLicenseNumber: '',
  sector: '',
  subSector: '',
  country: '',
  environmentalProfile: {
    description: '',
    carbonEmissions: '',
    energyReduction: '',
    wasteManagement: '',
    waterConservation: '',
  },
  socialProfile: {
    description: '',
    workforceDiversity: '',
    communityPrograms: '',
    healthAndSafety: '',
    employeeWellbeing: '',
  },
  governanceProfile: {
    description: '',
    boardStructure: '',
    complianceFrameworks: '',
    riskManagement: '',
    transparency: '',
  },
  documents: [],
}

const sectors = [
  'energy', 'manufacturing', 'construction', 'utilities', 'agriculture',
  'technology', 'healthcare', 'finance', 'retail', 'transportation', 'chemicals', 'other'
]

const countries = [
  'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Jordan', 'Egypt', 'Other'
]

const documentTypes = [
  { value: 'ESG_POLICY', label: 'ESG Policy Document' },
  { value: 'SUSTAINABILITY_REPORT', label: 'Sustainability Report' },
  { value: 'CARBON_AUDIT', label: 'Carbon Audit Report' },
  { value: 'ISO_CERTIFICATE', label: 'ISO Certification' },
  { value: 'FINANCIAL_REPORT', label: 'Annual Financial Report' },
  { value: 'GOVERNANCE_CHARTER', label: 'Governance Charter' },
  { value: 'OTHER', label: 'Other Supporting Document' },
]

interface ESGHints {
  suggestions: string[]
  missingAreas: string[]
  improvementTips: string[]
  sampleKpis: string[]
}

interface CompletenessCheck {
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export default function ESGApplicationWizard() {
  const params = useParams()
  const router = useRouter()
  const { locale, t } = useI18n()
  const isRtl = locale === 'ar'

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [service, setService] = useState<{ name: string; nameAr: string } | null>(null)

  // AI Hints state
  const [esgHints, setEsgHints] = useState<{ type: string; hints: ESGHints } | null>(null)
  const [loadingHints, setLoadingHints] = useState(false)
  const [showHintsPanel, setShowHintsPanel] = useState(false)

  // Completeness check state
  const [completenessCheck, setCompletenessCheck] = useState<CompletenessCheck | null>(null)
  const [loadingCompleteness, setLoadingCompleteness] = useState(false)

  useEffect(() => {
    // Fetch service details
    fetch(`/api/services/${params.id}`)
      .then(res => res.json())
      .then(data => setService(data))
      .catch(() => {})
  }, [params.id])

  const fetchESGHints = async (type: 'environmental' | 'social' | 'governance') => {
    setLoadingHints(true)
    setShowHintsPanel(true)
    try {
      const profile = type === 'environmental'
        ? formData.environmentalProfile
        : type === 'social'
          ? formData.socialProfile
          : formData.governanceProfile

      const response = await fetch('/api/ai/esg-hints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, profile }),
      })
      const data = await response.json()
      if (data.success) {
        setEsgHints({ type, hints: data.hints })
      }
    } catch (error) {
      console.error('Failed to fetch ESG hints:', error)
    } finally {
      setLoadingHints(false)
    }
  }

  const runCompletenessCheck = async () => {
    setLoadingCompleteness(true)
    try {
      // Build a comprehensive description for the precheck
      const fullDescription = `
Organization: ${formData.organizationName}
Sector: ${formData.sector}
Country: ${formData.country}

ENVIRONMENTAL:
${formData.environmentalProfile.description}
KPIs: Carbon=${formData.environmentalProfile.carbonEmissions || 'N/A'}, Energy=${formData.environmentalProfile.energyReduction || 'N/A'}, Waste=${formData.environmentalProfile.wasteManagement || 'N/A'}, Water=${formData.environmentalProfile.waterConservation || 'N/A'}

SOCIAL:
${formData.socialProfile.description}
KPIs: Diversity=${formData.socialProfile.workforceDiversity || 'N/A'}, Community=${formData.socialProfile.communityPrograms || 'N/A'}, Safety=${formData.socialProfile.healthAndSafety || 'N/A'}, Wellbeing=${formData.socialProfile.employeeWellbeing || 'N/A'}

GOVERNANCE:
${formData.governanceProfile.description}
KPIs: Board=${formData.governanceProfile.boardStructure || 'N/A'}, Compliance=${formData.governanceProfile.complianceFrameworks || 'N/A'}, Risk=${formData.governanceProfile.riskManagement || 'N/A'}, Transparency=${formData.governanceProfile.transparency || 'N/A'}

DOCUMENTS ATTACHED: ${formData.documents.length}
Document Types: ${formData.documents.map(d => d.type).join(', ') || 'None'}
      `.trim()

      const response = await fetch('/api/ai/precheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: formData.applicantName,
          organizationName: formData.organizationName,
          sector: formData.sector,
          description: fullDescription,
        }),
      })
      const data = await response.json()

      // Parse the AI response into structured completeness check
      const check: CompletenessCheck = parseCompletenessResponse(data.result || '')
      setCompletenessCheck(check)
    } catch (error) {
      console.error('Failed to run completeness check:', error)
    } finally {
      setLoadingCompleteness(false)
    }
  }

  const parseCompletenessResponse = (result: string): CompletenessCheck => {
    // Extract score from result if mentioned, otherwise calculate based on content
    const hasEnvDescription = formData.environmentalProfile.description.length > 50
    const hasSocialDescription = formData.socialProfile.description.length > 50
    const hasGovDescription = formData.governanceProfile.description.length > 50
    const hasDocuments = formData.documents.length > 0
    const hasKpis = !!(formData.environmentalProfile.carbonEmissions || formData.socialProfile.workforceDiversity || formData.governanceProfile.boardStructure)

    let score = 0
    if (hasEnvDescription) score += 20
    if (hasSocialDescription) score += 20
    if (hasGovDescription) score += 20
    if (hasDocuments) score += 25
    if (hasKpis) score += 15

    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []

    if (hasEnvDescription) strengths.push('Environmental profile is well-documented')
    else weaknesses.push('Environmental description is too brief')

    if (hasSocialDescription) strengths.push('Social initiatives are clearly described')
    else weaknesses.push('Social profile needs more detail')

    if (hasGovDescription) strengths.push('Governance practices are documented')
    else weaknesses.push('Governance description is insufficient')

    if (hasDocuments) {
      strengths.push(`${formData.documents.length} supporting document(s) attached`)
      if (formData.documents.some(d => d.type === 'ESG_POLICY')) strengths.push('ESG Policy document included')
    } else {
      weaknesses.push('No supporting documents uploaded')
      recommendations.push('Upload at least an ESG Policy document for better assessment')
    }

    if (hasKpis) strengths.push('Quantifiable KPIs provided')
    else {
      weaknesses.push('Missing quantifiable metrics')
      recommendations.push('Add specific KPIs like carbon emissions, diversity ratios, or board composition')
    }

    if (!formData.documents.some(d => d.type === 'SUSTAINABILITY_REPORT')) {
      recommendations.push('Consider uploading a Sustainability Report if available')
    }

    return { overallScore: score, strengths, weaknesses, recommendations }
  }

  const steps = [
    { number: 1, title: isRtl ? 'معلومات مقدم الطلب' : 'Applicant Info', icon: '1' },
    { number: 2, title: isRtl ? 'ملف ESG' : 'ESG Profile', icon: '2' },
    { number: 3, title: isRtl ? 'المستندات' : 'Documents', icon: '3' },
    { number: 4, title: isRtl ? 'مراجعة وإرسال' : 'Review & Submit', icon: '4' },
  ]

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.applicantName.trim()) newErrors.applicantName = 'Required'
      if (!formData.organizationName.trim()) newErrors.organizationName = 'Required'
      if (!formData.email.trim()) newErrors.email = 'Required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email'
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Required'
      if (!formData.tradeLicenseNumber.trim()) newErrors.tradeLicenseNumber = 'Required'
      if (!formData.sector) newErrors.sector = 'Required'
      if (!formData.country) newErrors.country = 'Required'
    }

    if (step === 2) {
      if (!formData.environmentalProfile.description.trim()) newErrors.envDescription = 'Required'
      if (!formData.socialProfile.description.trim()) newErrors.socialDescription = 'Required'
      if (!formData.governanceProfile.description.trim()) newErrors.govDescription = 'Required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleProfileChange = (profile: 'environmentalProfile' | 'socialProfile' | 'governanceProfile', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [profile]: { ...prev[profile], [field]: value }
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    const newDoc = {
      file,
      type: docType,
      fileName: file.name,
      ocrStatus: 'processing' as const,
    }

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc]
    }))

    // Simulate OCR/ICR processing
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        documents: prev.documents.map(doc =>
          doc.fileName === file.name && doc.type === docType
            ? {
                ...doc,
                ocrStatus: 'complete' as const,
                ocrResult: `Extracted text from ${file.name}: Document appears to contain relevant ${docType.replace('_', ' ').toLowerCase()} information. Key sections identified include policy statements, metrics, and compliance declarations.`,
                aiReview: getAIReviewForDocument(docType)
              }
            : doc
        )
      }))
    }, 2000)
  }

  const getAIReviewForDocument = (docType: string): string => {
    const reviews: Record<string, string> = {
      ESG_POLICY: '✅ Document appears to be a valid ESG policy. Contains key sustainability commitments and measurable targets.',
      SUSTAINABILITY_REPORT: '✅ Sustainability report identified. Includes GRI-aligned disclosures and environmental metrics.',
      CARBON_AUDIT: '✅ Carbon audit report detected. Shows emissions data and reduction strategies.',
      ISO_CERTIFICATE: '✅ ISO certification verified. Certificate appears valid with appropriate scope.',
      FINANCIAL_REPORT: '⚠️ Financial report uploaded. Recommend ensuring ESG-related disclosures are highlighted.',
      GOVERNANCE_CHARTER: '✅ Governance charter identified. Board structure and accountability mechanisms documented.',
      OTHER: 'ℹ️ Supporting document received. Manual review recommended to assess relevance.',
    }
    return reviews[docType] || 'Document received for review.'
  }

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setIsSubmitting(true)

    try {
      // Prepare the description from ESG profiles
      const description = `
Environmental Initiatives:
${formData.environmentalProfile.description}
- Carbon Emissions: ${formData.environmentalProfile.carbonEmissions || 'Not specified'}
- Energy Reduction: ${formData.environmentalProfile.energyReduction || 'Not specified'}
- Waste Management: ${formData.environmentalProfile.wasteManagement || 'Not specified'}
- Water Conservation: ${formData.environmentalProfile.waterConservation || 'Not specified'}

Social Initiatives:
${formData.socialProfile.description}
- Workforce Diversity: ${formData.socialProfile.workforceDiversity || 'Not specified'}
- Community Programs: ${formData.socialProfile.communityPrograms || 'Not specified'}
- Health & Safety: ${formData.socialProfile.healthAndSafety || 'Not specified'}
- Employee Wellbeing: ${formData.socialProfile.employeeWellbeing || 'Not specified'}

Governance Practices:
${formData.governanceProfile.description}
- Board Structure: ${formData.governanceProfile.boardStructure || 'Not specified'}
- Compliance Frameworks: ${formData.governanceProfile.complianceFrameworks || 'Not specified'}
- Risk Management: ${formData.governanceProfile.riskManagement || 'Not specified'}
- Transparency: ${formData.governanceProfile.transparency || 'Not specified'}
      `.trim()

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantName: formData.applicantName,
          organizationName: formData.organizationName,
          email: formData.email,
          sector: formData.sector,
          description,
          phoneNumber: formData.phoneNumber,
          tradeLicenseNumber: formData.tradeLicenseNumber,
          subSector: formData.subSector,
          country: formData.country,
          environmentalProfile: JSON.stringify(formData.environmentalProfile),
          socialProfile: JSON.stringify(formData.socialProfile),
          governanceProfile: JSON.stringify(formData.governanceProfile),
        }),
      })

      if (!response.ok) throw new Error('Failed to submit')

      const result = await response.json()
      router.push(`/customer/${result.id}`)
    } catch (error) {
      console.error('Submit error:', error)
      setErrors({ submit: 'Failed to submit application. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/services/${params.id}`}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-4"
          >
            <svg className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.common.back}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isRtl ? 'طلب شهادة ESG' : 'ESG Certificate Application'}
          </h1>
          {service && (
            <p className="text-gray-600 mt-1">
              {isRtl ? service.nameAr : service.name}
            </p>
          )}
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm
                  ${currentStep === step.number
                    ? 'bg-blue-600 text-white'
                    : currentStep > step.number
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step.number ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : step.icon}
                </div>
                <div className={`hidden sm:block ${isRtl ? 'mr-2' : 'ml-2'} text-sm font-medium
                  ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}`}
                >
                  {step.title}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {isRtl ? 'معلومات مقدم الطلب والمؤسسة' : 'Applicant & Organization Information'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.customer.form.applicantName} *
                  </label>
                  <input
                    type="text"
                    value={formData.applicantName}
                    onChange={(e) => handleInputChange('applicantName', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.applicantName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder={t.customer.form.applicantNamePlaceholder}
                  />
                  {errors.applicantName && <p className="text-red-500 text-sm mt-1">{errors.applicantName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.customer.form.organizationName} *
                  </label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.organizationName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder={t.customer.form.organizationNamePlaceholder}
                  />
                  {errors.organizationName && <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.customer.form.email} *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder={t.customer.form.emailPlaceholder}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRtl ? 'رقم الهاتف' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="+971 XX XXX XXXX"
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRtl ? 'رقم الرخصة التجارية' : 'Trade License Number'} *
                  </label>
                  <input
                    type="text"
                    value={formData.tradeLicenseNumber}
                    onChange={(e) => handleInputChange('tradeLicenseNumber', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.tradeLicenseNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder={isRtl ? 'أدخل رقم الرخصة التجارية' : 'Enter trade license number'}
                  />
                  {errors.tradeLicenseNumber && <p className="text-red-500 text-sm mt-1">{errors.tradeLicenseNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRtl ? 'الدولة' : 'Country'} *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">{isRtl ? 'اختر الدولة' : 'Select country'}</option>
                    {countries.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.customer.form.sector} *
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${errors.sector ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">{t.customer.form.sectorPlaceholder}</option>
                    {sectors.map(s => (
                      <option key={s} value={s}>
                        {t.customer.sectors[s as keyof typeof t.customer.sectors] || s}
                      </option>
                    ))}
                  </select>
                  {errors.sector && <p className="text-red-500 text-sm mt-1">{errors.sector}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRtl ? 'القطاع الفرعي' : 'Sub-sector'} ({isRtl ? 'اختياري' : 'Optional'})
                  </label>
                  <input
                    type="text"
                    value={formData.subSector}
                    onChange={(e) => handleInputChange('subSector', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={isRtl ? 'مثال: الطاقة المتجددة' : 'e.g., Renewable Energy'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: ESG Profile */}
          {currentStep === 2 && (
            <div className="space-y-8">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {isRtl ? 'ملف ESG والمقاييس' : 'ESG Profile & Metrics'}
              </h2>

              {/* Environmental */}
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-green-800 flex items-center gap-2">
                    <span className="text-xl">🌿</span>
                    {isRtl ? 'البيئة (E)' : 'Environmental (E)'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => fetchESGHints('environmental')}
                    disabled={loadingHints}
                    className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {isRtl ? 'نصائح AI' : 'AI Hints'}
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isRtl ? 'وصف المبادرات البيئية' : 'Environmental Initiatives Description'} *
                    </label>
                    <textarea
                      value={formData.environmentalProfile.description}
                      onChange={(e) => handleProfileChange('environmentalProfile', 'description', e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent
                        ${errors.envDescription ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder={isRtl ? 'صف جهود الاستدامة البيئية لمؤسستك...' : 'Describe your organization\'s environmental sustainability efforts...'}
                    />
                    {errors.envDescription && <p className="text-red-500 text-sm mt-1">{errors.envDescription}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRtl ? 'انبعاثات الكربون' : 'Carbon Emissions'}
                      </label>
                      <input
                        type="text"
                        value={formData.environmentalProfile.carbonEmissions}
                        onChange={(e) => handleProfileChange('environmentalProfile', 'carbonEmissions', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder={isRtl ? 'مثال: خفض 20% سنوياً' : 'e.g., 20% reduction annually'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRtl ? 'تخفيض الطاقة' : 'Energy Reduction'}
                      </label>
                      <input
                        type="text"
                        value={formData.environmentalProfile.energyReduction}
                        onChange={(e) => handleProfileChange('environmentalProfile', 'energyReduction', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder={isRtl ? 'مثال: 15% توفير في الطاقة' : 'e.g., 15% energy savings'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRtl ? 'إدارة النفايات' : 'Waste Management'}
                      </label>
                      <input
                        type="text"
                        value={formData.environmentalProfile.wasteManagement}
                        onChange={(e) => handleProfileChange('environmentalProfile', 'wasteManagement', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder={isRtl ? 'مثال: برنامج إعادة التدوير' : 'e.g., Zero-waste program'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRtl ? 'الحفاظ على المياه' : 'Water Conservation'}
                      </label>
                      <input
                        type="text"
                        value={formData.environmentalProfile.waterConservation}
                        onChange={(e) => handleProfileChange('environmentalProfile', 'waterConservation', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder={isRtl ? 'مثال: إعادة تدوير المياه' : 'e.g., Water recycling system'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-blue-800 flex items-center gap-2">
                    <span className="text-xl">👥</span>
                    {isRtl ? 'الاجتماعية (S)' : 'Social (S)'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => fetchESGHints('social')}
                    disabled={loadingHints}
                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {isRtl ? 'نصائح AI' : 'AI Hints'}
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isRtl ? 'وصف المبادرات الاجتماعية' : 'Social Initiatives Description'} *
                    </label>
                    <textarea
                      value={formData.socialProfile.description}
                      onChange={(e) => handleProfileChange('socialProfile', 'description', e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${errors.socialDescription ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder={isRtl ? 'صف برامج المسؤولية الاجتماعية لمؤسستك...' : 'Describe your organization\'s social responsibility programs...'}
                    />
                    {errors.socialDescription && <p className="text-red-500 text-sm mt-1">{errors.socialDescription}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRtl ? 'تنوع القوى العاملة' : 'Workforce Diversity'}
                      </label>
                      <input
                        type="text"
                        value={formData.socialProfile.workforceDiversity}
                        onChange={(e) => handleProfileChange('socialProfile', 'workforceDiversity', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={isRtl ? 'مثال: 40% نساء في الإدارة' : 'e.g., 40% women in management'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRtl ? 'برامج المجتمع' : 'Community Programs'}
                      </label>
                      <input
                        type="text"
                        value={formData.socialProfile.communityPrograms}
                        onChange={(e) => handleProfileChange('socialProfile', 'communityPrograms', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={isRtl ? 'مثال: برنامج تطوعي' : 'e.g., Volunteer program'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRtl ? 'الصحة والسلامة' : 'Health & Safety'}
                      </label>
                      <input
                        type="text"
                        value={formData.socialProfile.healthAndSafety}
                        onChange={(e) => handleProfileChange('socialProfile', 'healthAndSafety', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={isRtl ? 'مثال: شهادة ISO 45001' : 'e.g., ISO 45001 certified'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRtl ? 'رفاهية الموظفين' : 'Employee Wellbeing'}
                      </label>
                      <input
                        type="text"
                        value={formData.socialProfile.employeeWellbeing}
                        onChange={(e) => handleProfileChange('socialProfile', 'employeeWellbeing', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={isRtl ? 'مثال: برنامج صحة شامل' : 'e.g., Comprehensive wellness program'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Governance */}
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-semibold text-purple-800 flex items-center gap-2">
                    <span className="text-xl">⚖️</span>
                    {isRtl ? 'الحوكمة (G)' : 'Governance (G)'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => fetchESGHints('governance')}
                    disabled={loadingHints}
                    className="text-sm bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {isRtl ? 'نصائح AI' : 'AI Hints'}
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isRtl ? 'وصف ممارسات الحوكمة' : 'Governance Practices Description'} *
                    </label>
                    <textarea
                      value={formData.governanceProfile.description}
                      onChange={(e) => handleProfileChange('governanceProfile', 'description', e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
                        ${errors.govDescription ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder={isRtl ? 'صف هيكل الحوكمة وممارسات الامتثال لمؤسستك...' : 'Describe your organization\'s governance structure and compliance practices...'}
                    />
                    {errors.govDescription && <p className="text-red-500 text-sm mt-1">{errors.govDescription}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRtl ? 'هيكل مجلس الإدارة' : 'Board Structure'}
                      </label>
                      <input
                        type="text"
                        value={formData.governanceProfile.boardStructure}
                        onChange={(e) => handleProfileChange('governanceProfile', 'boardStructure', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder={isRtl ? 'مثال: مجلس مستقل' : 'e.g., Independent board'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRtl ? 'أطر الامتثال' : 'Compliance Frameworks'}
                      </label>
                      <input
                        type="text"
                        value={formData.governanceProfile.complianceFrameworks}
                        onChange={(e) => handleProfileChange('governanceProfile', 'complianceFrameworks', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder={isRtl ? 'مثال: GRI, SASB' : 'e.g., GRI, SASB aligned'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRtl ? 'إدارة المخاطر' : 'Risk Management'}
                      </label>
                      <input
                        type="text"
                        value={formData.governanceProfile.riskManagement}
                        onChange={(e) => handleProfileChange('governanceProfile', 'riskManagement', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder={isRtl ? 'مثال: لجنة مخاطر متخصصة' : 'e.g., Dedicated risk committee'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRtl ? 'الشفافية' : 'Transparency'}
                      </label>
                      <input
                        type="text"
                        value={formData.governanceProfile.transparency}
                        onChange={(e) => handleProfileChange('governanceProfile', 'transparency', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder={isRtl ? 'مثال: تقارير سنوية منشورة' : 'e.g., Annual public reporting'}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Hints Panel */}
              {showHintsPanel && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-semibold text-indigo-800 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      {isRtl ? 'نصائح AI للـ ' : 'AI Hints for '}
                      {esgHints?.type === 'environmental' ? (isRtl ? 'البيئة' : 'Environmental') :
                       esgHints?.type === 'social' ? (isRtl ? 'الاجتماعية' : 'Social') :
                       (isRtl ? 'الحوكمة' : 'Governance')}
                    </h3>
                    <button
                      onClick={() => setShowHintsPanel(false)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {loadingHints ? (
                    <div className="flex items-center gap-2 text-indigo-600">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{isRtl ? 'جاري تحليل ملفك...' : 'Analyzing your profile...'}</span>
                    </div>
                  ) : esgHints?.hints && (
                    <div className="space-y-4">
                      {/* Suggestions */}
                      <div>
                        <h4 className="text-sm font-medium text-indigo-700 mb-2">
                          {isRtl ? '💡 اقتراحات:' : '💡 Suggestions:'}
                        </h4>
                        <ul className="space-y-1">
                          {esgHints.hints.suggestions.slice(0, 3).map((s, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-indigo-500">•</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Missing Areas */}
                      <div>
                        <h4 className="text-sm font-medium text-amber-700 mb-2">
                          {isRtl ? '⚠️ مجالات مفقودة:' : '⚠️ Missing Areas:'}
                        </h4>
                        <ul className="space-y-1">
                          {esgHints.hints.missingAreas.slice(0, 3).map((m, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-amber-500">•</span>
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Sample KPIs */}
                      <div>
                        <h4 className="text-sm font-medium text-green-700 mb-2">
                          {isRtl ? '📊 مؤشرات أداء نموذجية:' : '📊 Sample KPIs:'}
                        </h4>
                        <ul className="space-y-1">
                          {esgHints.hints.sampleKpis.slice(0, 3).map((k, i) => (
                            <li key={i} className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                              {k}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Documents */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {isRtl ? 'تحميل المستندات' : 'Document Upload'}
              </h2>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <span className="text-amber-600 text-xl">📋</span>
                  <div>
                    <h4 className="font-medium text-amber-800">
                      {isRtl ? 'المستندات المطلوبة' : 'Required Documents'}
                    </h4>
                    <p className="text-sm text-amber-700 mt-1">
                      {isRtl
                        ? 'يرجى تحميل المستندات الداعمة مثل سياسات ESG، تقارير الاستدامة، شهادات ISO، أو تقارير التدقيق.'
                        : 'Please upload supporting documents such as ESG policies, sustainability reports, ISO certificates, or audit reports.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Upload Area */}
              <div className="space-y-4">
                {documentTypes.map(docType => (
                  <div key={docType.value} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{docType.label}</h4>
                        <p className="text-sm text-gray-500">PDF, DOC, or image files</p>
                      </div>
                      <label className="cursor-pointer bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                        <span>{isRtl ? 'تحميل' : 'Upload'}</span>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          onChange={(e) => handleFileUpload(e, docType.value)}
                        />
                      </label>
                    </div>

                    {/* Uploaded files for this type */}
                    {formData.documents
                      .filter(doc => doc.type === docType.value)
                      .map((doc, idx) => (
                        <div key={idx} className="mt-3 bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📄</span>
                              <span className="font-medium text-sm">{doc.fileName}</span>
                            </div>
                            <button
                              onClick={() => removeDocument(formData.documents.indexOf(doc))}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* OCR Status */}
                          <div className="mt-2">
                            {doc.ocrStatus === 'processing' && (
                              <div className="flex items-center gap-2 text-blue-600">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-sm">{isRtl ? 'جاري معالجة ICR/OCR...' : 'Processing ICR/OCR...'}</span>
                              </div>
                            )}
                            {doc.ocrStatus === 'complete' && doc.aiReview && (
                              <div className="bg-white rounded p-2 mt-2 border">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  {isRtl ? 'مراجعة AI:' : 'AI Review:'}
                                </p>
                                <p className="text-sm text-gray-600">{doc.aiReview}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>

              {formData.documents.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  {isRtl ? 'لم يتم تحميل أي مستندات بعد' : 'No documents uploaded yet'}
                </p>
              )}
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
                {isRtl ? 'مراجعة الطلب' : 'Review Application'}
              </h2>

              {/* Applicant Info Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {isRtl ? 'معلومات مقدم الطلب' : 'Applicant Information'}
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-gray-500">{t.customer.form.applicantName}:</dt>
                  <dd className="text-gray-900">{formData.applicantName}</dd>
                  <dt className="text-gray-500">{t.customer.form.organizationName}:</dt>
                  <dd className="text-gray-900">{formData.organizationName}</dd>
                  <dt className="text-gray-500">{t.customer.form.email}:</dt>
                  <dd className="text-gray-900">{formData.email}</dd>
                  <dt className="text-gray-500">{isRtl ? 'الهاتف' : 'Phone'}:</dt>
                  <dd className="text-gray-900">{formData.phoneNumber}</dd>
                  <dt className="text-gray-500">{isRtl ? 'الرخصة التجارية' : 'Trade License'}:</dt>
                  <dd className="text-gray-900">{formData.tradeLicenseNumber}</dd>
                  <dt className="text-gray-500">{t.customer.form.sector}:</dt>
                  <dd className="text-gray-900">{formData.sector}</dd>
                  <dt className="text-gray-500">{isRtl ? 'الدولة' : 'Country'}:</dt>
                  <dd className="text-gray-900">{formData.country}</dd>
                </dl>
              </div>

              {/* ESG Profile Summary */}
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">🌿 {isRtl ? 'البيئة' : 'Environmental'}</h3>
                  <p className="text-sm text-gray-700">{formData.environmentalProfile.description}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">👥 {isRtl ? 'الاجتماعية' : 'Social'}</h3>
                  <p className="text-sm text-gray-700">{formData.socialProfile.description}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">⚖️ {isRtl ? 'الحوكمة' : 'Governance'}</h3>
                  <p className="text-sm text-gray-700">{formData.governanceProfile.description}</p>
                </div>
              </div>

              {/* Documents Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {isRtl ? 'المستندات المرفقة' : 'Attached Documents'} ({formData.documents.length})
                </h3>
                {formData.documents.length > 0 ? (
                  <ul className="space-y-1">
                    {formData.documents.map((doc, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <span>📄</span>
                        <span>{doc.fileName}</span>
                        <span className="text-gray-400">({doc.type.replace('_', ' ')})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">{isRtl ? 'لا توجد مستندات مرفقة' : 'No documents attached'}</p>
                )}
              </div>

              {/* AI Completeness Check */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {isRtl ? 'فحص اكتمال الطلب بالذكاء الاصطناعي' : 'AI Completeness Check'}
                  </h3>
                  <button
                    type="button"
                    onClick={runCompletenessCheck}
                    disabled={loadingCompleteness}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {loadingCompleteness ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isRtl ? 'جاري الفحص...' : 'Checking...'}
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {isRtl ? 'تشغيل الفحص' : 'Run Check'}
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm text-blue-700 mb-4">
                  {isRtl
                    ? 'قم بتشغيل فحص الاكتمال للتحقق من جاهزية طلبك قبل الإرسال'
                    : 'Run the completeness check to verify your application readiness before submission'}
                </p>

                {completenessCheck && (
                  <div className="space-y-4 mt-4 pt-4 border-t border-blue-200">
                    {/* Score */}
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl font-bold ${
                        completenessCheck.overallScore >= 80 ? 'text-green-600' :
                        completenessCheck.overallScore >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {completenessCheck.overallScore}%
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              completenessCheck.overallScore >= 80 ? 'bg-green-500' :
                              completenessCheck.overallScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${completenessCheck.overallScore}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {completenessCheck.overallScore >= 80
                            ? (isRtl ? 'طلبك جاهز للإرسال!' : 'Your application is ready to submit!')
                            : completenessCheck.overallScore >= 50
                              ? (isRtl ? 'طلبك يحتاج بعض التحسينات' : 'Your application needs some improvements')
                              : (isRtl ? 'طلبك يحتاج إلى المزيد من المعلومات' : 'Your application needs more information')}
                        </p>
                      </div>
                    </div>

                    {/* Strengths */}
                    {completenessCheck.strengths.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-green-700 mb-2">
                          ✅ {isRtl ? 'نقاط القوة:' : 'Strengths:'}
                        </h4>
                        <ul className="space-y-1">
                          {completenessCheck.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-green-500">•</span>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {completenessCheck.weaknesses.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-amber-700 mb-2">
                          ⚠️ {isRtl ? 'نقاط الضعف:' : 'Weaknesses:'}
                        </h4>
                        <ul className="space-y-1">
                          {completenessCheck.weaknesses.map((w, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-amber-500">•</span>
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {completenessCheck.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-blue-700 mb-2">
                          💡 {isRtl ? 'توصيات:' : 'Recommendations:'}
                        </h4>
                        <ul className="space-y-1">
                          {completenessCheck.recommendations.map((r, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="text-blue-500">•</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
                  {errors.submit}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors
                ${currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {t.common.back}
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {isRtl ? 'التالي' : 'Next'}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {t.customer.form.submitApplication}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
