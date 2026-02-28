'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

// Types
interface FormData {
  applicantName: string
  organizationName: string
  email: string
  phoneNumber: string
  tradeLicenseNumber: string
  sector: string
  subSector: string
  country: string
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
  documents: {
    file: File | null
    type: string
    fileName: string
    fileId?: string
    ocrStatus: 'pending' | 'processing' | 'complete' | 'error'
    ocrResult?: string
    aiReview?: string
    detectedType?: string
    detectedConfidence?: number
  }[]
}

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

type AccordionSection = 'applicant' | 'esg' | 'documents' | 'review' | null

export default function ESGAccordionForm() {
  const params = useParams()
  const router = useRouter()
  const { locale, t } = useI18n()
  const isRtl = locale === 'ar'

  // Accordion state - only one open at a time
  const [openSection, setOpenSection] = useState<AccordionSection>('applicant')
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [service, setService] = useState<{ name: string; nameAr: string } | null>(null)

  // AI state
  const [loadingHints, setLoadingHints] = useState(false)
  const [completenessCheck, setCompletenessCheck] = useState<CompletenessCheck | null>(null)
  const [loadingCompleteness, setLoadingCompleteness] = useState(false)
  const [loadingAutoFill, setLoadingAutoFill] = useState(false)
  const [showAutoFillPanel, setShowAutoFillPanel] = useState(false)
  const [autoFillSuggestions, setAutoFillSuggestions] = useState<Record<string, string> | null>(null)
  const [complianceScore, setComplianceScore] = useState<{
    score: number
    maxScore: number
    readinessLevel: string
    readinessColor: string
    breakdown: { environmental: { score: number; max: number }; social: { score: number; max: number }; governance: { score: number; max: number } }
    hints: string[]
    strengths: string[]
  } | null>(null)
  const [loadingComplianceScore, setLoadingComplianceScore] = useState(false)
  const [sectorTemplate, setSectorTemplate] = useState<{
    environmentalTemplate: string
    environmentalExamples: string[]
    socialTemplate: string
    socialExamples: string[]
    governanceTemplate: string
    governanceExamples: string[]
    commonKPIs: string[]
  } | null>(null)
  const [loadingSectorTemplate, setLoadingSectorTemplate] = useState(false)
  const [draftReport, setDraftReport] = useState<string | null>(null)
  const [loadingDraftReport, setLoadingDraftReport] = useState(false)
  const [showDraftReportModal, setShowDraftReportModal] = useState(false)

  // Calculate progress percentage
  const progress = useMemo(() => {
    let total = 0
    let filled = 0

    // Section 1: Applicant Info (7 required fields)
    const section1Fields = ['applicantName', 'organizationName', 'email', 'phoneNumber', 'tradeLicenseNumber', 'sector', 'country']
    total += section1Fields.length
    section1Fields.forEach(field => {
      if (formData[field as keyof FormData]) filled++
    })

    // Section 2: ESG Profile (3 required descriptions) - with null checks
    total += 3
    if (formData.environmentalProfile?.description?.trim()) filled++
    if (formData.socialProfile?.description?.trim()) filled++
    if (formData.governanceProfile?.description?.trim()) filled++

    // Section 3: Documents (at least 1 document)
    total += 1
    if (formData.documents?.length > 0) filled++

    return Math.round((filled / total) * 100)
  }, [formData])

  // Section completion status
  const sectionStatus = useMemo(() => {
    const applicantComplete = Boolean(
      formData.applicantName && formData.organizationName && formData.email &&
      formData.phoneNumber && formData.tradeLicenseNumber && formData.sector && formData.country
    )
    const esgComplete = Boolean(
      formData.environmentalProfile?.description?.trim() &&
      formData.socialProfile?.description?.trim() &&
      formData.governanceProfile?.description?.trim()
    )
    const documentsComplete = (formData.documents?.length ?? 0) > 0

    return {
      applicant: applicantComplete,
      esg: esgComplete,
      documents: documentsComplete,
      review: applicantComplete && esgComplete && documentsComplete
    }
  }, [formData])

  useEffect(() => {
    fetch(`/api/services/${params.id}`)
      .then(res => res.json())
      .then(data => setService(data))
      .catch(() => {})
  }, [params.id])

  // Fetch sector template when sector changes
  useEffect(() => {
    if (formData.sector) {
      fetchSectorTemplate(formData.sector)
    }
  }, [formData.sector])

  const toggleSection = (section: AccordionSection) => {
    setOpenSection(prev => prev === section ? null : section)
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

  // AI Functions
  const fetchESGHints = async (type: 'environmental' | 'social' | 'governance') => {
    setLoadingHints(true)
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
        window.dispatchEvent(new CustomEvent('esg-hints', {
          detail: { type, hints: data.hints, locale }
        }))
      }
    } catch (error) {
      console.error('Failed to fetch ESG hints:', error)
    } finally {
      setLoadingHints(false)
    }
  }

  const fetchAutoFill = async () => {
    setLoadingAutoFill(true)
    try {
      const response = await fetch('/api/ai/auto-fill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentFormData: {
            applicantName: formData.applicantName,
            organizationName: formData.organizationName,
            sector: formData.sector,
            environmentalProfile: formData.environmentalProfile,
            socialProfile: formData.socialProfile,
            governanceProfile: formData.governanceProfile,
          },
          documentOcrTexts: formData.documents
            .filter(d => d.ocrResult)
            .map(d => ({ type: d.type, text: d.ocrResult })),
          locale,
        }),
      })
      const data = await response.json()
      if (data.success && data.suggestions) {
        Object.entries(data.suggestions).forEach(([field, value]) => {
          if (typeof value === 'string') {
            applyAutoFillSuggestion(field, value)
          }
        })
        setAutoFillSuggestions(data.suggestions)
        setShowAutoFillPanel(true)
        setTimeout(() => setShowAutoFillPanel(false), 3000)
      }
    } catch (error) {
      console.error('Failed to fetch auto-fill suggestions:', error)
    } finally {
      setLoadingAutoFill(false)
    }
  }

  const applyAutoFillSuggestion = (field: string, value: string) => {
    if (field.includes('.')) {
      const [profile, subField] = field.split('.')
      handleProfileChange(profile as 'environmentalProfile' | 'socialProfile' | 'governanceProfile', subField, value)
    } else {
      handleInputChange(field, value)
    }
  }

  const fetchComplianceScore = async () => {
    setLoadingComplianceScore(true)
    try {
      const response = await fetch('/api/ai/compliance-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environmentalProfile: formData.environmentalProfile,
          socialProfile: formData.socialProfile,
          governanceProfile: formData.governanceProfile,
          documents: formData.documents.map(d => ({ type: d.type, fileName: d.fileName })),
          sector: formData.sector,
          locale,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setComplianceScore({
          score: data.score,
          maxScore: data.maxScore,
          readinessLevel: data.readinessLevel,
          readinessColor: data.readinessColor,
          breakdown: data.breakdown,
          hints: data.hints,
          strengths: data.strengths,
        })
      }
    } catch (error) {
      console.error('Failed to fetch compliance score:', error)
    } finally {
      setLoadingComplianceScore(false)
    }
  }

  const fetchSectorTemplate = async (sector: string) => {
    if (!sector) return
    setLoadingSectorTemplate(true)
    try {
      const response = await fetch('/api/ai/sector-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector, locale }),
      })
      const data = await response.json()
      if (data.success) {
        setSectorTemplate({
          environmentalTemplate: data.environmentalTemplate,
          environmentalExamples: data.environmentalExamples,
          socialTemplate: data.socialTemplate,
          socialExamples: data.socialExamples,
          governanceTemplate: data.governanceTemplate,
          governanceExamples: data.governanceExamples,
          commonKPIs: data.commonKPIs,
        })
      }
    } catch (error) {
      console.error('Failed to fetch sector template:', error)
    } finally {
      setLoadingSectorTemplate(false)
    }
  }

  const generateDraftReport = async () => {
    setLoadingDraftReport(true)
    setShowDraftReportModal(true)
    try {
      const response = await fetch('/api/ai/draft-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationName: formData.organizationName,
          sector: formData.sector,
          environmentalProfile: formData.environmentalProfile,
          socialProfile: formData.socialProfile,
          governanceProfile: formData.governanceProfile,
          documents: formData.documents.map(d => ({ type: d.type, fileName: d.fileName })),
          locale,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setDraftReport(data.report)
      }
    } catch (error) {
      console.error('Failed to generate draft report:', error)
    } finally {
      setLoadingDraftReport(false)
    }
  }

  const runCompletenessCheck = async () => {
    setLoadingCompleteness(true)
    try {
      const fullDescription = `
Organization: ${formData.organizationName}
Sector: ${formData.sector}
Country: ${formData.country}

ENVIRONMENTAL:
${formData.environmentalProfile?.description ?? ''}
KPIs: Carbon=${formData.environmentalProfile?.carbonEmissions || 'N/A'}, Energy=${formData.environmentalProfile?.energyReduction || 'N/A'}, Waste=${formData.environmentalProfile?.wasteManagement || 'N/A'}, Water=${formData.environmentalProfile?.waterConservation || 'N/A'}

SOCIAL:
${formData.socialProfile?.description ?? ''}
KPIs: Diversity=${formData.socialProfile?.workforceDiversity || 'N/A'}, Community=${formData.socialProfile?.communityPrograms || 'N/A'}, Safety=${formData.socialProfile?.healthAndSafety || 'N/A'}, Wellbeing=${formData.socialProfile?.employeeWellbeing || 'N/A'}

GOVERNANCE:
${formData.governanceProfile?.description ?? ''}
KPIs: Board=${formData.governanceProfile?.boardStructure || 'N/A'}, Compliance=${formData.governanceProfile?.complianceFrameworks || 'N/A'}, Risk=${formData.governanceProfile?.riskManagement || 'N/A'}, Transparency=${formData.governanceProfile?.transparency || 'N/A'}

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
      const check = parseCompletenessResponse(data.result || '')
      setCompletenessCheck(check)
    } catch (error) {
      console.error('Failed to run completeness check:', error)
    } finally {
      setLoadingCompleteness(false)
    }
  }

  const parseCompletenessResponse = (result: string): CompletenessCheck => {
    const hasEnvDescription = (formData.environmentalProfile?.description?.length ?? 0) > 50
    const hasSocialDescription = (formData.socialProfile?.description?.length ?? 0) > 50
    const hasGovDescription = (formData.governanceProfile?.description?.length ?? 0) > 50
    const hasDocuments = (formData.documents?.length ?? 0) > 0
    const hasKpis = !!(formData.environmentalProfile?.carbonEmissions || formData.socialProfile?.workforceDiversity || formData.governanceProfile?.boardStructure)

    let score = 0
    if (hasEnvDescription) score += 20
    if (hasSocialDescription) score += 20
    if (hasGovDescription) score += 20
    if (hasDocuments) score += 25
    if (hasKpis) score += 15

    const strengths: string[] = []
    const weaknesses: string[] = []
    const recommendations: string[] = []

    if (hasEnvDescription) strengths.push(isRtl ? 'الملف البيئي موثق جيداً' : 'Environmental profile is well-documented')
    else weaknesses.push(isRtl ? 'الوصف البيئي مختصر جداً' : 'Environmental description is too brief')

    if (hasSocialDescription) strengths.push(isRtl ? 'المبادرات الاجتماعية موصوفة بوضوح' : 'Social initiatives are clearly described')
    else weaknesses.push(isRtl ? 'الملف الاجتماعي يحتاج تفاصيل أكثر' : 'Social profile needs more detail')

    if (hasGovDescription) strengths.push(isRtl ? 'ممارسات الحوكمة موثقة' : 'Governance practices are documented')
    else weaknesses.push(isRtl ? 'وصف الحوكمة غير كافٍ' : 'Governance description is insufficient')

    if (hasDocuments) {
      strengths.push(isRtl ? `${formData.documents.length} مستند(ات) داعمة مرفقة` : `${formData.documents.length} supporting document(s) attached`)
    } else {
      weaknesses.push(isRtl ? 'لم يتم تحميل أي مستندات داعمة' : 'No supporting documents uploaded')
      recommendations.push(isRtl ? 'قم بتحميل سياسة ESG على الأقل لتقييم أفضل' : 'Upload at least an ESG Policy document for better assessment')
    }

    if (hasKpis) strengths.push(isRtl ? 'تم توفير مؤشرات أداء قابلة للقياس' : 'Quantifiable KPIs provided')
    else {
      weaknesses.push(isRtl ? 'مؤشرات قابلة للقياس مفقودة' : 'Missing quantifiable metrics')
      recommendations.push(isRtl ? 'أضف مؤشرات أداء محددة' : 'Add specific KPIs like carbon emissions, diversity ratios, or board composition')
    }

    return { overallScore: score, strengths, weaknesses, recommendations }
  }

  // Document handling
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const currentDocCount = formData.documents.length

    Array.from(files).forEach(async (file, index) => {
      const fileId = `${file.name}-${Date.now()}`
      const documentIndex = currentDocCount + index

      const newDoc = {
        file,
        type: 'PENDING',
        fileName: file.name,
        fileId,
        ocrStatus: 'processing' as const,
      }

      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, newDoc]
      }))

      const classifyAndProcess = async () => {
        try {
          const mockOcrText = `Extracted text from ${file.name}: This document contains organizational information including policy statements, performance metrics, compliance declarations, and sustainability commitments.`

          const response = await fetch('/api/ai/document-classifier', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName: file.name,
              ocrText: mockOcrText,
              locale,
              documentIndex,
            }),
          })
          const data = await response.json()

          const detectedType = data.success ? data.detectedType : 'OTHER'
          const detectedConfidence = data.success ? data.confidence : 0.5

          setFormData(prev => ({
            ...prev,
            documents: prev.documents.map(doc =>
              doc.fileId === fileId
                ? {
                    ...doc,
                    type: detectedType,
                    ocrStatus: 'complete' as const,
                    ocrResult: mockOcrText,
                    aiReview: getAIReviewForDocument(detectedType),
                    detectedType,
                    detectedConfidence,
                  }
                : doc
            )
          }))
        } catch {
          setFormData(prev => ({
            ...prev,
            documents: prev.documents.map(doc =>
              doc.fileId === fileId
                ? {
                    ...doc,
                    type: 'OTHER',
                    ocrStatus: 'error' as const,
                    detectedType: 'OTHER',
                    detectedConfidence: 0,
                    aiReview: isRtl ? 'تعذر تصنيف المستند. المراجعة اليدوية مطلوبة.' : 'Unable to classify document. Manual review required.',
                  }
                : doc
            )
          }))
        }
      }

      setTimeout(classifyAndProcess, 1500 + Math.random() * 1000)
    })

    e.target.value = ''
  }

  const getAIReviewForDocument = (docType: string): string => {
    const reviews: Record<string, string> = isRtl ? {
      ESG_POLICY: '✅ يبدو أن المستند سياسة ESG صالحة. يحتوي على التزامات استدامة رئيسية.',
      SUSTAINABILITY_REPORT: '✅ تم تحديد تقرير الاستدامة. يتضمن إفصاحات متوافقة مع GRI.',
      CARBON_AUDIT: '✅ تم اكتشاف تقرير تدقيق الكربون. يعرض بيانات الانبعاثات.',
      ISO_CERTIFICATE: '✅ تم التحقق من شهادة ISO. الشهادة صالحة.',
      FINANCIAL_REPORT: '⚠️ تم تحميل تقرير مالي. يوصى بإبراز إفصاحات ESG.',
      GOVERNANCE_CHARTER: '✅ تم تحديد ميثاق الحوكمة. هيكل المجلس موثق.',
      OTHER: 'ℹ️ تم استلام مستند داعم. يوصى بالمراجعة اليدوية.',
    } : {
      ESG_POLICY: '✅ Document appears to be a valid ESG policy. Contains key sustainability commitments.',
      SUSTAINABILITY_REPORT: '✅ Sustainability report identified. Includes GRI-aligned disclosures.',
      CARBON_AUDIT: '✅ Carbon audit report detected. Shows emissions data.',
      ISO_CERTIFICATE: '✅ ISO certification verified. Certificate appears valid.',
      FINANCIAL_REPORT: '⚠️ Financial report uploaded. Recommend ensuring ESG-related disclosures are highlighted.',
      GOVERNANCE_CHARTER: '✅ Governance charter identified. Board structure documented.',
      OTHER: 'ℹ️ Supporting document received. Manual review recommended.',
    }
    return reviews[docType] || (isRtl ? 'تم استلام المستند للمراجعة.' : 'Document received for review.')
  }

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }))
  }

  // Validate all sections
  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.applicantName?.trim()) newErrors.applicantName = isRtl ? 'مطلوب' : 'Required'
    if (!formData.organizationName?.trim()) newErrors.organizationName = isRtl ? 'مطلوب' : 'Required'
    if (!formData.email?.trim()) newErrors.email = isRtl ? 'مطلوب' : 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = isRtl ? 'بريد إلكتروني غير صالح' : 'Invalid email'
    if (!formData.phoneNumber?.trim()) newErrors.phoneNumber = isRtl ? 'مطلوب' : 'Required'
    if (!formData.tradeLicenseNumber?.trim()) newErrors.tradeLicenseNumber = isRtl ? 'مطلوب' : 'Required'
    if (!formData.sector) newErrors.sector = isRtl ? 'مطلوب' : 'Required'
    if (!formData.country) newErrors.country = isRtl ? 'مطلوب' : 'Required'
    if (!formData.environmentalProfile?.description?.trim()) newErrors.envDescription = isRtl ? 'مطلوب' : 'Required'
    if (!formData.socialProfile?.description?.trim()) newErrors.socialDescription = isRtl ? 'مطلوب' : 'Required'
    if (!formData.governanceProfile?.description?.trim()) newErrors.govDescription = isRtl ? 'مطلوب' : 'Required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateAll()) {
      // Open first section with errors
      if (errors.applicantName || errors.organizationName || errors.email || errors.phoneNumber || errors.tradeLicenseNumber || errors.sector || errors.country) {
        setOpenSection('applicant')
      } else if (errors.envDescription || errors.socialDescription || errors.govDescription) {
        setOpenSection('esg')
      }
      return
    }

    setIsSubmitting(true)

    try {
      const description = `
Environmental Initiatives:
${formData.environmentalProfile?.description ?? ''}
- Carbon Emissions: ${formData.environmentalProfile?.carbonEmissions || 'Not specified'}
- Energy Reduction: ${formData.environmentalProfile?.energyReduction || 'Not specified'}
- Waste Management: ${formData.environmentalProfile?.wasteManagement || 'Not specified'}
- Water Conservation: ${formData.environmentalProfile?.waterConservation || 'Not specified'}

Social Initiatives:
${formData.socialProfile?.description ?? ''}
- Workforce Diversity: ${formData.socialProfile?.workforceDiversity || 'Not specified'}
- Community Programs: ${formData.socialProfile?.communityPrograms || 'Not specified'}
- Health & Safety: ${formData.socialProfile?.healthAndSafety || 'Not specified'}
- Employee Wellbeing: ${formData.socialProfile?.employeeWellbeing || 'Not specified'}

Governance Practices:
${formData.governanceProfile?.description ?? ''}
- Board Structure: ${formData.governanceProfile?.boardStructure || 'Not specified'}
- Compliance Frameworks: ${formData.governanceProfile?.complianceFrameworks || 'Not specified'}
- Risk Management: ${formData.governanceProfile?.riskManagement || 'Not specified'}
- Transparency: ${formData.governanceProfile?.transparency || 'Not specified'}
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
      router.push(`/member/applications/${result.application.id}`)
    } catch (error) {
      console.error('Submit error:', error)
      setErrors({ submit: isRtl ? 'فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.' : 'Failed to submit application. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Accordion Header Component
  const AccordionHeader = ({
    section,
    title,
    icon,
    isComplete
  }: {
    section: AccordionSection
    title: string
    icon: string
    isComplete: boolean
  }) => {
    const isOpen = openSection === section
    return (
      <button
        type="button"
        onClick={() => toggleSection(section)}
        className={`w-full flex items-center justify-between p-4 rounded-lg transition-all border`}
        style={{
          background: isOpen ? 'var(--accent-green-10, rgba(16, 185, 129, 0.1))' : 'var(--panel)',
          borderColor: isOpen ? 'var(--accent-green)' : 'var(--border)',
        }}
        aria-expanded={isOpen}
        aria-controls={`section-${section}`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-medium" style={{ color: isOpen ? 'var(--accent-green)' : 'var(--text)' }}>
            {title}
          </span>
          {isComplete && (
            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isRtl ? 'مكتمل' : 'Complete'}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: isOpen ? 'var(--accent-green)' : 'var(--muted)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    )
  }

  return (
    <div className={`min-h-screen ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'} style={{ background: 'var(--bg)' }}>
      {/* Sticky Progress Bar */}
      <div className="sticky top-0 z-40 shadow-sm" style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Link
                href={`/services/${params.id}`}
                className="flex items-center gap-1"
                style={{ color: 'var(--accent-green)' }}
              >
                <svg className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t.common.back}
              </Link>
              <span style={{ color: 'var(--border)' }}>|</span>
              <h1 className="font-semibold" style={{ color: 'var(--text)' }}>
                {isRtl ? 'طلب شهادة ESG' : 'ESG Certificate Application'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${progress >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                {progress}%
              </span>
              <span className="text-sm" style={{ color: 'var(--muted)' }}>
                {isRtl ? 'مكتمل' : 'complete'}
              </span>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--panel-2)' }}>
            <div
              className={`h-full transition-all duration-500 ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {/* Section indicators */}
          <div className="flex justify-between mt-2 px-1">
            <div className={`flex items-center gap-1 text-xs ${sectionStatus.applicant ? 'text-green-600' : ''}`} style={!sectionStatus.applicant ? { color: 'var(--muted)' } : {}}>
              <span className={`w-2 h-2 rounded-full ${sectionStatus.applicant ? 'bg-green-500' : ''}`} style={!sectionStatus.applicant ? { background: 'var(--border)' } : {}} />
              {isRtl ? 'معلومات' : 'Info'}
            </div>
            <div className={`flex items-center gap-1 text-xs ${sectionStatus.esg ? 'text-green-600' : ''}`} style={!sectionStatus.esg ? { color: 'var(--muted)' } : {}}>
              <span className={`w-2 h-2 rounded-full ${sectionStatus.esg ? 'bg-green-500' : ''}`} style={!sectionStatus.esg ? { background: 'var(--border)' } : {}} />
              ESG
            </div>
            <div className={`flex items-center gap-1 text-xs ${sectionStatus.documents ? 'text-green-600' : ''}`} style={!sectionStatus.documents ? { color: 'var(--muted)' } : {}}>
              <span className={`w-2 h-2 rounded-full ${sectionStatus.documents ? 'bg-green-500' : ''}`} style={!sectionStatus.documents ? { background: 'var(--border)' } : {}} />
              {isRtl ? 'مستندات' : 'Docs'}
            </div>
            <div className={`flex items-center gap-1 text-xs ${sectionStatus.review ? 'text-green-600' : ''}`} style={!sectionStatus.review ? { color: 'var(--muted)' } : {}}>
              <span className={`w-2 h-2 rounded-full ${sectionStatus.review ? 'bg-green-500' : ''}`} style={!sectionStatus.review ? { background: 'var(--border)' } : {}} />
              {isRtl ? 'إرسال' : 'Submit'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Section 1: Applicant Info */}
        <div className="rounded-xl shadow-sm" style={{ background: 'var(--panel)' }}>
          <AccordionHeader
            section="applicant"
            title={isRtl ? '1. معلومات مقدم الطلب' : '1. Applicant Information'}
            icon="👤"
            isComplete={sectionStatus.applicant}
          />
          {openSection === 'applicant' && (
            <div id="section-applicant" className="p-6" style={{ borderTop: '1px solid var(--border)' }} role="region" aria-labelledby="applicant-header">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'أدخل بيانات مقدم الطلب والمؤسسة' : 'Enter applicant and organization details'}
                </p>
                <button
                  type="button"
                  onClick={fetchAutoFill}
                  disabled={loadingAutoFill}
                  className="text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {loadingAutoFill ? (isRtl ? 'جاري...' : 'Loading...') : (isRtl ? 'ملء تلقائي' : 'Auto-fill')}
                </button>
              </div>

              {showAutoFillPanel && autoFillSuggestions && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm font-medium">
                      {isRtl ? 'تم ملء النموذج بنجاح!' : 'Form filled successfully!'}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    {t.customer.form.applicantName} *
                  </label>
                  <input
                    type="text"
                    value={formData.applicantName}
                    onChange={(e) => handleInputChange('applicantName', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                      ${errors.applicantName ? 'border-red-500' : ''}`}
                    style={{ background: 'var(--panel-2)', border: `1px solid ${errors.applicantName ? '#ef4444' : 'var(--border)'}`, color: 'var(--text)' }}
                    placeholder={t.customer.form.applicantNamePlaceholder}
                  />
                  {errors.applicantName && <p className="text-red-500 text-sm mt-1">{errors.applicantName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    {t.customer.form.organizationName} *
                  </label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => handleInputChange('organizationName', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                      ${errors.organizationName ? 'border-red-500' : ''}`}
                    style={{ background: 'var(--panel-2)', border: `1px solid ${errors.organizationName ? '#ef4444' : 'var(--border)'}`, color: 'var(--text)' }}
                    placeholder={t.customer.form.organizationNamePlaceholder}
                  />
                  {errors.organizationName && <p className="text-red-500 text-sm mt-1">{errors.organizationName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    {t.customer.form.email} *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                      ${errors.email ? 'border-red-500' : ''}`}
                    style={{ background: 'var(--panel-2)', border: `1px solid ${errors.email ? '#ef4444' : 'var(--border)'}`, color: 'var(--text)' }}
                    placeholder={t.customer.form.emailPlaceholder}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    {isRtl ? 'رقم الهاتف' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                      ${errors.phoneNumber ? 'border-red-500' : ''}`}
                    style={{ background: 'var(--panel-2)', border: `1px solid ${errors.phoneNumber ? '#ef4444' : 'var(--border)'}`, color: 'var(--text)' }}
                    placeholder="+971 XX XXX XXXX"
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    {isRtl ? 'رقم الرخصة التجارية' : 'Trade License Number'} *
                  </label>
                  <input
                    type="text"
                    value={formData.tradeLicenseNumber}
                    onChange={(e) => handleInputChange('tradeLicenseNumber', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                      ${errors.tradeLicenseNumber ? 'border-red-500' : ''}`}
                    style={{ background: 'var(--panel-2)', border: `1px solid ${errors.tradeLicenseNumber ? '#ef4444' : 'var(--border)'}`, color: 'var(--text)' }}
                    placeholder={isRtl ? 'أدخل رقم الرخصة التجارية' : 'Enter trade license number'}
                  />
                  {errors.tradeLicenseNumber && <p className="text-red-500 text-sm mt-1">{errors.tradeLicenseNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    {isRtl ? 'الدولة' : 'Country'} *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                      ${errors.country ? 'border-red-500' : ''}`}
                    style={{ background: 'var(--panel-2)', border: `1px solid ${errors.country ? '#ef4444' : 'var(--border)'}`, color: 'var(--text)' }}
                  >
                    <option value="">{isRtl ? 'اختر الدولة' : 'Select country'}</option>
                    {countries.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    {t.customer.form.sector} *
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                      ${errors.sector ? 'border-red-500' : ''}`}
                    style={{ background: 'var(--panel-2)', border: `1px solid ${errors.sector ? '#ef4444' : 'var(--border)'}`, color: 'var(--text)' }}
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
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
                    {isRtl ? 'القطاع الفرعي' : 'Sub-sector'} ({isRtl ? 'اختياري' : 'Optional'})
                  </label>
                  <input
                    type="text"
                    value={formData.subSector}
                    onChange={(e) => handleInputChange('subSector', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    placeholder={isRtl ? 'مثال: الطاقة المتجددة' : 'e.g., Renewable Energy'}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setOpenSection('esg')}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  {isRtl ? 'التالي: ملف ESG' : 'Next: ESG Profile'}
                  <svg className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: ESG Profile */}
        <div className="rounded-xl shadow-sm" style={{ background: 'var(--panel)' }}>
          <AccordionHeader
            section="esg"
            title={isRtl ? '2. ملف ESG' : '2. ESG Profile'}
            icon="🌿"
            isComplete={sectionStatus.esg}
          />
          {openSection === 'esg' && (
            <div id="section-esg" className="p-6" style={{ borderTop: '1px solid var(--border)' }} role="region" aria-labelledby="esg-header">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'وصف مبادرات ESG الخاصة بمؤسستك' : 'Describe your organization\'s ESG initiatives'}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={fetchComplianceScore}
                    disabled={loadingComplianceScore}
                    className="text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-3 py-1.5 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center gap-1 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {loadingComplianceScore ? '...' : (isRtl ? 'الدرجة' : 'Score')}
                  </button>
                </div>
              </div>

              {/* Compliance Score Panel */}
              {complianceScore && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="var(--border)" strokeWidth="6" fill="none" />
                          <circle
                            cx="32" cy="32" r="28"
                            stroke={complianceScore.readinessColor}
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${(complianceScore.score / complianceScore.maxScore) * 175.9} 175.9`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold" style={{ color: complianceScore.readinessColor }}>
                            {complianceScore.score}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: complianceScore.readinessColor }}>
                          {complianceScore.readinessLevel}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          {isRtl ? `من ${complianceScore.maxScore}` : `of ${complianceScore.maxScore}`}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setComplianceScore(null)} style={{ color: 'var(--muted)' }} className="hover:opacity-80">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Sector Templates */}
              {sectorTemplate && formData.sector && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800 mb-6">
                  <h4 className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-2">
                    📊 {isRtl ? 'مؤشرات شائعة لهذا القطاع:' : 'Common KPIs for this sector:'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sectorTemplate.commonKPIs.slice(0, 5).map((kpi, i) => (
                      <span key={i} className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-full">
                        {kpi}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Environmental */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4 border border-green-100 dark:border-green-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-green-800 dark:text-green-400 flex items-center gap-2">
                    <span>🌿</span>
                    {isRtl ? 'البيئة (E)' : 'Environmental (E)'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => fetchESGHints('environmental')}
                    disabled={loadingHints}
                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {isRtl ? 'نصائح AI' : 'AI Hints'}
                  </button>
                </div>
                <textarea
                  value={formData.environmentalProfile?.description ?? ''}
                  onChange={(e) => handleProfileChange('environmentalProfile', 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 mb-3"
                  style={{ background: 'var(--panel-2)', border: `1px solid ${errors.envDescription ? '#ef4444' : 'var(--border)'}`, color: 'var(--text)' }}
                  placeholder={isRtl ? 'صف جهود الاستدامة البيئية...' : 'Describe environmental sustainability efforts...'}
                />
                {errors.envDescription && <p className="text-red-500 text-sm mb-2">{errors.envDescription}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.environmentalProfile?.carbonEmissions ?? ''}
                    onChange={(e) => handleProfileChange('environmentalProfile', 'carbonEmissions', e.target.value)}
                    className="px-3 py-1.5 text-sm rounded focus:ring-2 focus:ring-green-500"
                    style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    placeholder={isRtl ? 'انبعاثات الكربون' : 'Carbon emissions'}
                  />
                  <input
                    type="text"
                    value={formData.environmentalProfile?.energyReduction ?? ''}
                    onChange={(e) => handleProfileChange('environmentalProfile', 'energyReduction', e.target.value)}
                    className="px-3 py-1.5 text-sm rounded focus:ring-2 focus:ring-green-500"
                    style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    placeholder={isRtl ? 'تخفيض الطاقة' : 'Energy reduction'}
                  />
                  <input
                    type="text"
                    value={formData.environmentalProfile?.wasteManagement ?? ''}
                    onChange={(e) => handleProfileChange('environmentalProfile', 'wasteManagement', e.target.value)}
                    className="px-3 py-1.5 text-sm rounded focus:ring-2 focus:ring-green-500"
                    style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    placeholder={isRtl ? 'إدارة النفايات' : 'Waste management'}
                  />
                  <input
                    type="text"
                    value={formData.environmentalProfile?.waterConservation ?? ''}
                    onChange={(e) => handleProfileChange('environmentalProfile', 'waterConservation', e.target.value)}
                    className="px-3 py-1.5 text-sm rounded focus:ring-2 focus:ring-green-500"
                    style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    placeholder={isRtl ? 'الحفاظ على المياه' : 'Water conservation'}
                  />
                </div>
              </div>

              {/* Social */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4 border border-blue-100 dark:border-blue-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-400 flex items-center gap-2">
                    <span>👥</span>
                    {isRtl ? 'الاجتماعية (S)' : 'Social (S)'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => fetchESGHints('social')}
                    disabled={loadingHints}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isRtl ? 'نصائح AI' : 'AI Hints'}
                  </button>
                </div>
                <textarea
                  value={formData.socialProfile?.description ?? ''}
                  onChange={(e) => handleProfileChange('socialProfile', 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
                  style={{ background: 'var(--panel-2)', border: `1px solid ${errors.socialDescription ? '#ef4444' : 'var(--border)'}`, color: 'var(--text)' }}
                  placeholder={isRtl ? 'صف برامج المسؤولية الاجتماعية...' : 'Describe social responsibility programs...'}
                />
                {errors.socialDescription && <p className="text-red-500 text-sm mb-2">{errors.socialDescription}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.socialProfile?.workforceDiversity ?? ''}
                    onChange={(e) => handleProfileChange('socialProfile', 'workforceDiversity', e.target.value)}
                    className="px-3 py-1.5 text-sm rounded focus:ring-2 focus:ring-blue-500"
                    style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    placeholder={isRtl ? 'تنوع القوى العاملة' : 'Workforce diversity'}
                  />
                  <input
                    type="text"
                    value={formData.socialProfile?.communityPrograms ?? ''}
                    onChange={(e) => handleProfileChange('socialProfile', 'communityPrograms', e.target.value)}
                    className="px-3 py-1.5 text-sm rounded focus:ring-2 focus:ring-blue-500"
                    style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    placeholder={isRtl ? 'برامج المجتمع' : 'Community programs'}
                  />
                  <input
                    type="text"
                    value={formData.socialProfile?.healthAndSafety ?? ''}
                    onChange={(e) => handleProfileChange('socialProfile', 'healthAndSafety', e.target.value)}
                    className="px-3 py-1.5 text-sm rounded focus:ring-2 focus:ring-blue-500"
                    style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    placeholder={isRtl ? 'الصحة والسلامة' : 'Health & safety'}
                  />
                  <input
                    type="text"
                    value={formData.socialProfile?.employeeWellbeing ?? ''}
                    onChange={(e) => handleProfileChange('socialProfile', 'employeeWellbeing', e.target.value)}
                    className="px-3 py-1.5 text-sm rounded focus:ring-2 focus:ring-blue-500"
                    style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    placeholder={isRtl ? 'رفاهية الموظفين' : 'Employee wellbeing'}
                  />
                </div>
              </div>

              {/* Governance */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-purple-800 dark:text-purple-400 flex items-center gap-2">
                    <span>⚖️</span>
                    {isRtl ? 'الحوكمة (G)' : 'Governance (G)'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => fetchESGHints('governance')}
                    disabled={loadingHints}
                    className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isRtl ? 'نصائح AI' : 'AI Hints'}
                  </button>
                </div>
                <textarea
                  value={formData.governanceProfile?.description ?? ''}
                  onChange={(e) => handleProfileChange('governanceProfile', 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 mb-3"
                  style={{ background: 'var(--panel-2)', border: `1px solid ${errors.govDescription ? '#ef4444' : 'var(--border)'}`, color: 'var(--text)' }}
                  placeholder={isRtl ? 'صف هيكل الحوكمة وممارسات الامتثال...' : 'Describe governance structure and compliance practices...'}
                />
                {errors.govDescription && <p className="text-red-500 text-sm mb-2">{errors.govDescription}</p>}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.governanceProfile?.boardStructure ?? ''}
                    onChange={(e) => handleProfileChange('governanceProfile', 'boardStructure', e.target.value)}
                    className="px-3 py-1.5 text-sm rounded focus:ring-2 focus:ring-purple-500"
                    style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    placeholder={isRtl ? 'هيكل المجلس' : 'Board structure'}
                  />
                  <input
                    type="text"
                    value={formData.governanceProfile?.complianceFrameworks ?? ''}
                    onChange={(e) => handleProfileChange('governanceProfile', 'complianceFrameworks', e.target.value)}
                    className="px-3 py-1.5 text-sm rounded focus:ring-2 focus:ring-purple-500"
                    style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    placeholder={isRtl ? 'أطر الامتثال' : 'Compliance frameworks'}
                  />
                  <input
                    type="text"
                    value={formData.governanceProfile?.riskManagement ?? ''}
                    onChange={(e) => handleProfileChange('governanceProfile', 'riskManagement', e.target.value)}
                    className="px-3 py-1.5 text-sm rounded focus:ring-2 focus:ring-purple-500"
                    style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    placeholder={isRtl ? 'إدارة المخاطر' : 'Risk management'}
                  />
                  <input
                    type="text"
                    value={formData.governanceProfile?.transparency ?? ''}
                    onChange={(e) => handleProfileChange('governanceProfile', 'transparency', e.target.value)}
                    className="px-3 py-1.5 text-sm rounded focus:ring-2 focus:ring-purple-500"
                    style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    placeholder={isRtl ? 'الشفافية' : 'Transparency'}
                  />
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setOpenSection('applicant')}
                  className="px-6 py-2 rounded-lg font-medium transition-colors"
                  style={{ background: 'var(--panel-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  {t.common.back}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenSection('documents')}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  {isRtl ? 'التالي: المستندات' : 'Next: Documents'}
                  <svg className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Documents */}
        <div className="rounded-xl shadow-sm" style={{ background: 'var(--panel)' }}>
          <AccordionHeader
            section="documents"
            title={isRtl ? '3. المستندات' : '3. Documents'}
            icon="📁"
            isComplete={sectionStatus.documents}
          />
          {openSection === 'documents' && (
            <div id="section-documents" className="p-6" style={{ borderTop: '1px solid var(--border)' }} role="region" aria-labelledby="documents-header">
              {/* Required Documents */}
              <div className="bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded p-2.5 mb-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg className="w-3.5 h-3.5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="font-medium text-xs" style={{ color: 'var(--text)' }}>
                    {isRtl ? 'المستندات المطلوبة' : 'Required Documents'}
                  </h3>
                  <span className="text-red-500 text-[10px]">*</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div className="rounded px-2 py-1" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                    <p className="font-medium leading-tight" style={{ color: 'var(--text)' }}>{isRtl ? 'سياسة ESG / الاستدامة' : 'ESG / Sustainability Policy'}</p>
                    <p className="leading-tight" style={{ color: 'var(--muted)' }}>{isRtl ? 'وثيقة التزام بممارسات ESG' : 'ESG commitment document'}</p>
                  </div>
                  <div className="rounded px-2 py-1" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                    <p className="font-medium leading-tight" style={{ color: 'var(--text)' }}>{isRtl ? 'أحدث تقرير ESG / الاستدامة' : 'Latest ESG / Sustainability Report'}</p>
                    <p className="leading-tight" style={{ color: 'var(--muted)' }}>{isRtl ? 'تقرير أداء الاستدامة السنوي' : 'Annual sustainability report'}</p>
                  </div>
                  <div className="rounded px-2 py-1" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                    <p className="font-medium leading-tight" style={{ color: 'var(--text)' }}>{isRtl ? 'سياسة الحوكمة أو الأخلاقيات' : 'Governance or Ethics Policy'}</p>
                    <p className="leading-tight" style={{ color: 'var(--muted)' }}>{isRtl ? 'إطار الحوكمة ومدونة السلوك' : 'Governance framework & code of conduct'}</p>
                  </div>
                  <div className="rounded px-2 py-1" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                    <p className="font-medium leading-tight" style={{ color: 'var(--text)' }}>{isRtl ? 'الرخصة التجارية' : 'Trade License'}</p>
                    <p className="leading-tight" style={{ color: 'var(--muted)' }}>{isRtl ? 'رخصة سارية للتحقق من الهوية' : 'Valid license for verification'}</p>
                  </div>
                </div>
              </div>

              {/* Optional Documents */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded p-2.5 mb-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="font-medium text-emerald-800 dark:text-emerald-400 text-xs">
                    {isRtl ? 'مستندات اختيارية موصى بها' : 'Optional but Recommended'}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div className="rounded px-2 py-1" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                    <p className="font-medium leading-tight" style={{ color: 'var(--text)' }}>{isRtl ? 'أدلة الأداء البيئي' : 'Environmental Performance Evidence'}</p>
                    <p className="leading-tight" style={{ color: 'var(--muted)' }}>{isRtl ? 'البصمة الكربونية، تقارير الطاقة' : 'Carbon footprint, energy reports'}</p>
                  </div>
                  <div className="rounded px-2 py-1" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                    <p className="font-medium leading-tight" style={{ color: 'var(--text)' }}>{isRtl ? 'وثائق الأثر الاجتماعي' : 'Social Impact Documentation'}</p>
                    <p className="leading-tight" style={{ color: 'var(--muted)' }}>{isRtl ? 'سجلات HSE، رفاهية العمال' : 'HSE records, worker welfare'}</p>
                  </div>
                  <div className="rounded px-2 py-1" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                    <p className="font-medium leading-tight" style={{ color: 'var(--text)' }}>{isRtl ? 'الشهادات' : 'Certifications'}</p>
                    <p className="leading-tight" style={{ color: 'var(--muted)' }}>{isRtl ? 'ISO 14001، ISO 45001، جوائز' : 'ISO 14001, ISO 45001, awards'}</p>
                  </div>
                  <div className="rounded px-2 py-1" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                    <p className="font-medium leading-tight" style={{ color: 'var(--text)' }}>{isRtl ? 'أدلة حوكمة إضافية' : 'Additional Governance Evidence'}</p>
                    <p className="leading-tight" style={{ color: 'var(--muted)' }}>{isRtl ? 'سياسات المخاطر ومكافحة الفساد' : 'Risk & anti-corruption policies'}</p>
                  </div>
                  <div className="rounded px-2 py-1" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                    <p className="font-medium leading-tight" style={{ color: 'var(--text)' }}>{isRtl ? 'تقييمات استدامة الموردين' : 'Supplier Sustainability Assessments'}</p>
                    <p className="leading-tight" style={{ color: 'var(--muted)' }}>{isRtl ? 'تقييمات ESG للموردين' : 'ESG assessments of suppliers'}</p>
                  </div>
                  <div className="rounded px-2 py-1" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                    <p className="font-medium leading-tight" style={{ color: 'var(--text)' }}>{isRtl ? 'التقرير المالي السنوي' : 'Annual Financial Report'}</p>
                    <p className="leading-tight" style={{ color: 'var(--muted)' }}>{isRtl ? 'بيانات مالية مدققة' : 'Audited financial statements'}</p>
                  </div>
                </div>
                {/* Incentive box */}
                <div className="mt-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded px-2 py-1 flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-emerald-700 dark:text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[10px] text-emerald-800 dark:text-emerald-300">
                    {isRtl
                      ? 'تحميل المستندات الاختيارية قد يزيد من درجتك النهائية.'
                      : 'Uploading optional documents may increase your final score.'}
                  </p>
                </div>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed rounded-xl p-6 text-center transition-all mb-4 hover:border-emerald-400" style={{ borderColor: 'var(--border)' }}>
                <label className="cursor-pointer block">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="font-medium" style={{ color: 'var(--text)' }}>
                      {isRtl ? 'اسحب وأفلت الملفات هنا' : 'Drag and drop files here'}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                      {isRtl ? 'أو انقر للتصفح' : 'or click to browse'}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {isRtl ? 'اختر الملفات' : 'Select Files'}
                    </span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    multiple
                    onChange={handleFileUpload}
                  />
                </label>
              </div>

              {/* AI Classification Note */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-2 mb-4">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>{isRtl ? 'سيقوم AI بتصنيف مستنداتك تلقائياً' : 'AI will automatically classify your documents'}</span>
                </div>
              </div>

              {/* Uploaded Documents List */}
              {formData.documents.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                    📁 {isRtl ? `المستندات المحملة (${formData.documents.length})` : `Uploaded Documents (${formData.documents.length})`}
                  </h3>
                  {formData.documents.map((doc, idx) => (
                    <div key={doc.fileId || idx} className="rounded-lg p-3" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📄</span>
                          <div>
                            <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{doc.fileName}</p>
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>
                              {doc.ocrStatus === 'processing'
                                ? (isRtl ? 'جاري التحليل...' : 'Analyzing...')
                                : doc.detectedType && doc.detectedType !== 'PENDING'
                                  ? doc.detectedType.replace(/_/g, ' ')
                                  : (isRtl ? 'في انتظار التصنيف' : 'Pending')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeDocument(idx)}
                          className="p-1 rounded hover:text-red-500"
                          style={{ color: 'var(--muted)' }}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {doc.ocrStatus === 'processing' && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded p-2 flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isRtl ? 'جاري معالجة OCR...' : 'Processing OCR...'}
                        </div>
                      )}

                      {doc.ocrStatus === 'complete' && doc.detectedType && (
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded p-2 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span className="text-indigo-700 dark:text-indigo-400 font-medium">{doc.detectedType.replace(/_/g, ' ')}</span>
                          </div>
                          {doc.detectedConfidence !== undefined && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              doc.detectedConfidence >= 0.8 ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' :
                              doc.detectedConfidence >= 0.6 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' :
                              'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                            }`}>
                              {Math.round(doc.detectedConfidence * 100)}%
                            </span>
                          )}
                        </div>
                      )}

                      {doc.aiReview && doc.ocrStatus === 'complete' && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded p-2 mt-2 text-sm text-emerald-800 dark:text-emerald-300">
                          {doc.aiReview}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {formData.documents.length === 0 && (
                <p className="text-center text-sm py-4" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'لم يتم تحميل أي مستندات بعد' : 'No documents uploaded yet'}
                </p>
              )}

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setOpenSection('esg')}
                  className="px-6 py-2 rounded-lg font-medium transition-colors"
                  style={{ background: 'var(--panel-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  {t.common.back}
                </button>
                <button
                  type="button"
                  onClick={() => setOpenSection('review')}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  {isRtl ? 'التالي: المراجعة' : 'Next: Review'}
                  <svg className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Review & Submit */}
        <div className="rounded-xl shadow-sm" style={{ background: 'var(--panel)' }}>
          <AccordionHeader
            section="review"
            title={isRtl ? '4. مراجعة وإرسال' : '4. Review & Submit'}
            icon="✅"
            isComplete={sectionStatus.review}
          />
          {openSection === 'review' && (
            <div id="section-review" className="p-6" style={{ borderTop: '1px solid var(--border)' }} role="region" aria-labelledby="review-header">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {isRtl ? 'راجع طلبك قبل الإرسال' : 'Review your application before submitting'}
                </p>
                <button
                  type="button"
                  onClick={generateDraftReport}
                  disabled={loadingDraftReport}
                  className="text-sm bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {loadingDraftReport ? '...' : (isRtl ? 'معاينة التقرير' : 'Preview Report')}
                </button>
              </div>

              {/* Draft Report Modal */}
              {showDraftReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col" style={{ background: 'var(--panel)' }}>
                    <div className="p-4 flex items-center justify-between bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30" style={{ borderBottom: '1px solid var(--border)' }}>
                      <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
                        {isRtl ? 'معاينة تقرير ESG' : 'Draft ESG Report Preview'}
                      </h3>
                      <button onClick={() => setShowDraftReportModal(false)} style={{ color: 'var(--muted)' }} className="hover:opacity-80">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1">
                      {loadingDraftReport ? (
                        <div className="flex flex-col items-center justify-center py-12 text-cyan-600 dark:text-cyan-400">
                          <svg className="w-12 h-12 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p>{isRtl ? 'جاري إنشاء التقرير...' : 'Generating report...'}</p>
                        </div>
                      ) : draftReport ? (
                        <pre className="whitespace-pre-wrap font-sans text-sm" style={{ color: 'var(--text)' }}>{draftReport}</pre>
                      ) : (
                        <p className="text-center py-8" style={{ color: 'var(--muted)' }}>{isRtl ? 'فشل في إنشاء التقرير' : 'Failed to generate report'}</p>
                      )}
                    </div>
                    <div className="p-4 flex justify-end gap-3" style={{ background: 'var(--panel-2)', borderTop: '1px solid var(--border)' }}>
                      <button onClick={() => setShowDraftReportModal(false)} className="px-4 py-2 rounded-lg" style={{ background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                        {isRtl ? 'إغلاق' : 'Close'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Applicant Summary */}
              <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--panel-2)' }}>
                <h3 className="font-semibold mb-2 text-sm" style={{ color: 'var(--text)' }}>{isRtl ? 'معلومات مقدم الطلب' : 'Applicant Information'}</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <dt style={{ color: 'var(--muted)' }}>{isRtl ? 'الاسم:' : 'Name:'}</dt>
                  <dd style={{ color: 'var(--text)' }}>{formData.applicantName || '-'}</dd>
                  <dt style={{ color: 'var(--muted)' }}>{isRtl ? 'المؤسسة:' : 'Organization:'}</dt>
                  <dd style={{ color: 'var(--text)' }}>{formData.organizationName || '-'}</dd>
                  <dt style={{ color: 'var(--muted)' }}>{isRtl ? 'البريد:' : 'Email:'}</dt>
                  <dd style={{ color: 'var(--text)' }}>{formData.email || '-'}</dd>
                  <dt style={{ color: 'var(--muted)' }}>{isRtl ? 'القطاع:' : 'Sector:'}</dt>
                  <dd style={{ color: 'var(--text)' }}>{formData.sector || '-'}</dd>
                </dl>
              </div>

              {/* ESG Summary */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-100 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-400 text-sm mb-1">🌿 {isRtl ? 'البيئة' : 'Environmental'}</h4>
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{formData.environmentalProfile.description || (isRtl ? 'لم يتم التحديد' : 'Not specified')}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-400 text-sm mb-1">👥 {isRtl ? 'اجتماعي' : 'Social'}</h4>
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{formData.socialProfile.description || (isRtl ? 'لم يتم التحديد' : 'Not specified')}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-100 dark:border-purple-800">
                  <h4 className="font-medium text-purple-800 dark:text-purple-400 text-sm mb-1">⚖️ {isRtl ? 'حوكمة' : 'Governance'}</h4>
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{formData.governanceProfile.description || (isRtl ? 'لم يتم التحديد' : 'Not specified')}</p>
                </div>
              </div>

              {/* Documents Summary */}
              <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--panel-2)' }}>
                <h3 className="font-semibold mb-2 text-sm" style={{ color: 'var(--text)' }}>
                  {isRtl ? 'المستندات المرفقة' : 'Attached Documents'} ({formData.documents.length})
                </h3>
                {formData.documents.length > 0 ? (
                  <ul className="space-y-1">
                    {formData.documents.map((doc, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text)' }}>
                        <span>📄</span>
                        <span>{doc.fileName}</span>
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>({doc.type?.replace('_', ' ')})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>{isRtl ? 'لا توجد مستندات مرفقة' : 'No documents attached'}</p>
                )}
              </div>

              {/* AI Completeness Check */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-400 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {isRtl ? 'فحص اكتمال AI' : 'AI Completeness Check'}
                  </h3>
                  <button
                    type="button"
                    onClick={runCompletenessCheck}
                    disabled={loadingCompleteness}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loadingCompleteness ? '...' : (isRtl ? 'تشغيل' : 'Run Check')}
                  </button>
                </div>

                {completenessCheck && (
                  <div className="space-y-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl font-bold ${
                        completenessCheck.overallScore >= 80 ? 'text-green-600' :
                        completenessCheck.overallScore >= 50 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {completenessCheck.overallScore}%
                      </div>
                      <div className="flex-1">
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--panel-2)' }}>
                          <div
                            className={`h-full transition-all ${
                              completenessCheck.overallScore >= 80 ? 'bg-green-500' :
                              completenessCheck.overallScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${completenessCheck.overallScore}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {completenessCheck.strengths.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">✅ {isRtl ? 'نقاط القوة:' : 'Strengths:'}</h4>
                        <ul className="space-y-0.5">
                          {completenessCheck.strengths.map((s, i) => (
                            <li key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>• {s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {completenessCheck.weaknesses.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">⚠️ {isRtl ? 'نقاط الضعف:' : 'Weaknesses:'}</h4>
                        <ul className="space-y-0.5">
                          {completenessCheck.weaknesses.map((w, i) => (
                            <li key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>• {w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {errors.submit && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg p-3 mb-4 text-sm">
                  {errors.submit}
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setOpenSection('documents')}
                  className="px-6 py-2 rounded-lg font-medium transition-colors"
                  style={{ background: 'var(--panel-2)', color: 'var(--text)', border: '1px solid var(--border)' }}
                >
                  {t.common.back}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {t.customer.form.submitApplication}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
