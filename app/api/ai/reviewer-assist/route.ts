import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock AI Reviewer Assistant endpoint for Staff Portal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationId, locale = 'en' } = body

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    // Fetch application with documents
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        documents: true,
        reviewNotes: true
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const isArabic = locale === 'ar'
    const analysis = analyzeApplication(application, isArabic)

    return NextResponse.json({
      success: true,
      applicationId,
      ...analysis
    })
  } catch (error) {
    console.error('Reviewer assist API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze application' },
      { status: 500 }
    )
  }
}

interface ReviewerAnalysis {
  overallAssessment: string
  recommendedDecision: 'APPROVE' | 'REQUEST_CORRECTIONS' | 'REJECT'
  confidenceLevel: number
  redFlags: string[]
  strengths: string[]
  extraDocumentsSuggested: string[]
  detailedNotes: string
}

function analyzeApplication(
  application: {
    applicantName: string
    organizationName: string
    sector: string
    description: string
    environmentalProfile: string | null
    socialProfile: string | null
    governanceProfile: string | null
    documents: Array<{ type: string; fileName: string; ocrText: string | null }>
    reviewNotes: Array<{ note: string; authorType: string }>
  },
  isArabic: boolean
): ReviewerAnalysis {
  const redFlags: string[] = []
  const strengths: string[] = []
  const extraDocumentsSuggested: string[] = []

  // Parse ESG profiles
  let envData: Record<string, string> = {}
  let socData: Record<string, string> = {}
  let govData: Record<string, string> = {}

  try {
    if (application.environmentalProfile) {
      envData = JSON.parse(application.environmentalProfile)
    }
    if (application.socialProfile) {
      socData = JSON.parse(application.socialProfile)
    }
    if (application.governanceProfile) {
      govData = JSON.parse(application.governanceProfile)
    }
  } catch {
    redFlags.push(isArabic
      ? 'خطأ في تحليل بيانات ملف ESG'
      : 'Error parsing ESG profile data')
  }

  // Analyze environmental profile
  if (!envData.description || envData.description.length < 50) {
    redFlags.push(isArabic
      ? 'وصف البيئة عام جداً أو قصير'
      : 'Environmental description is too generic or short')
  } else {
    strengths.push(isArabic
      ? 'وصف بيئي مفصل مقدم'
      : 'Detailed environmental description provided')
  }

  if (!envData.carbonEmissions) {
    redFlags.push(isArabic
      ? 'لم يتم تقديم بيانات انبعاثات الكربون الكمية'
      : 'No quantitative carbon emissions data provided')
    extraDocumentsSuggested.push(isArabic
      ? 'تقرير تدقيق الكربون أو شهادة البصمة الكربونية'
      : 'Carbon audit report or carbon footprint certificate')
  }

  // Analyze social profile
  if (!socData.description || socData.description.length < 50) {
    redFlags.push(isArabic
      ? 'قسم المسؤولية الاجتماعية يفتقر للتفاصيل'
      : 'Social responsibility section lacks detail')
  }

  if (!socData.workforceDiversity) {
    redFlags.push(isArabic
      ? 'لم يتم ذكر بيانات تنوع القوى العاملة'
      : 'Workforce diversity data not mentioned')
  } else {
    strengths.push(isArabic
      ? 'مبادرات تنوع القوى العاملة موثقة'
      : 'Workforce diversity initiatives documented')
  }

  // Analyze governance profile
  if (!govData.boardStructure) {
    redFlags.push(isArabic
      ? 'لم يتم ذكر هيكل مجلس الإدارة أو لجنة ESG'
      : 'Board structure or ESG committee not mentioned')
    extraDocumentsSuggested.push(isArabic
      ? 'ميثاق حوكمة الشركات أو وثيقة هيكل مجلس الإدارة'
      : 'Corporate governance charter or board structure document')
  }

  if (!govData.complianceFrameworks) {
    redFlags.push(isArabic
      ? 'لم يتم تحديد أطر الامتثال (مثل ISO)'
      : 'No compliance frameworks specified (e.g., ISO)')
    extraDocumentsSuggested.push(isArabic
      ? 'شهادات ISO أو وثائق إطار الامتثال'
      : 'ISO certificates or compliance framework documents')
  } else {
    strengths.push(isArabic
      ? 'أطر الامتثال محددة'
      : 'Compliance frameworks specified')
  }

  // Analyze documents
  const documentTypes = application.documents.map(d => d.type)

  if (!documentTypes.includes('ESG_POLICY') && !documentTypes.some(t => t.includes('POLICY'))) {
    extraDocumentsSuggested.push(isArabic
      ? 'وثيقة سياسة ESG الرسمية'
      : 'Official ESG policy document')
  } else {
    strengths.push(isArabic
      ? 'تم تحميل وثيقة سياسة ESG'
      : 'ESG policy document uploaded')
  }

  if (application.documents.length < 2) {
    redFlags.push(isArabic
      ? 'عدد قليل جداً من المستندات الداعمة'
      : 'Very few supporting documents submitted')
  }

  // Determine recommended decision
  let recommendedDecision: 'APPROVE' | 'REQUEST_CORRECTIONS' | 'REJECT'
  let confidenceLevel: number
  let overallAssessment: string

  if (redFlags.length === 0 && strengths.length >= 3) {
    recommendedDecision = 'APPROVE'
    confidenceLevel = 85
    overallAssessment = isArabic
      ? 'طلب قوي مع توثيق ESG شامل. يوصى بالموافقة.'
      : 'Strong application with comprehensive ESG documentation. Recommend approval.'
  } else if (redFlags.length <= 2) {
    recommendedDecision = 'REQUEST_CORRECTIONS'
    confidenceLevel = 70
    overallAssessment = isArabic
      ? 'الطلب واعد ولكنه يتطلب معلومات إضافية في بعض المجالات.'
      : 'Application is promising but requires additional information in some areas.'
  } else if (redFlags.length <= 4) {
    recommendedDecision = 'REQUEST_CORRECTIONS'
    confidenceLevel = 60
    overallAssessment = isArabic
      ? 'هناك ثغرات كبيرة يجب معالجتها قبل النظر في الموافقة.'
      : 'There are significant gaps that need to be addressed before approval can be considered.'
  } else {
    recommendedDecision = 'REJECT'
    confidenceLevel = 75
    overallAssessment = isArabic
      ? 'الطلب يفتقر إلى التوثيق والالتزامات الجوهرية لـ ESG. يوصى برفض الطلب مع تقديم ملاحظات للتحسين.'
      : 'Application lacks substantial ESG documentation and commitments. Recommend rejection with feedback for improvement.'
  }

  // Generate detailed notes
  const detailedNotes = generateDetailedNotes(
    application,
    redFlags,
    strengths,
    isArabic
  )

  return {
    overallAssessment,
    recommendedDecision,
    confidenceLevel,
    redFlags,
    strengths,
    extraDocumentsSuggested: extraDocumentsSuggested.slice(0, 3),
    detailedNotes
  }
}

function generateDetailedNotes(
  application: { organizationName: string; sector: string },
  redFlags: string[],
  strengths: string[],
  isArabic: boolean
): string {
  if (isArabic) {
    return `
## ملخص تحليل الطلب

**المؤسسة:** ${application.organizationName}
**القطاع:** ${application.sector}

### نقاط القوة (${strengths.length})
${strengths.map(s => `• ${s}`).join('\n') || '• لم يتم تحديد نقاط قوة محددة'}

### المخاوف (${redFlags.length})
${redFlags.map(r => `• ${r}`).join('\n') || '• لم يتم تحديد مخاوف'}

### ملاحظات المراجع
يرجى مراجعة الطلب بعناية والتحقق من جميع المستندات المقدمة. تأكد من أن جميع مؤشرات الأداء الرئيسية قابلة للقياس والتحقق منها.
    `.trim()
  }

  return `
## Application Analysis Summary

**Organization:** ${application.organizationName}
**Sector:** ${application.sector}

### Strengths (${strengths.length})
${strengths.map(s => `• ${s}`).join('\n') || '• No specific strengths identified'}

### Concerns (${redFlags.length})
${redFlags.map(r => `• ${r}`).join('\n') || '• No concerns identified'}

### Reviewer Notes
Please review the application carefully and verify all submitted documents. Ensure all KPIs are measurable and verifiable.
  `.trim()
}
