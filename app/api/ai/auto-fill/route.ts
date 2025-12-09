import { NextRequest, NextResponse } from 'next/server'

// Mock AI Auto-fill endpoint for ESG form fields
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationData, documents, locale = 'en' } = body

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1200))

    const isArabic = locale === 'ar'

    // Generate suggestions based on documents and partial data
    const suggestions = generateSuggestions(applicationData, documents, isArabic)

    const hasDocuments = documents && documents.length > 0

    return NextResponse.json({
      success: true,
      suggestions,
      message: isArabic
        ? hasDocuments
          ? 'تم تحليل المستندات وإنشاء الاقتراحات بنجاح'
          : 'تم إنشاء اقتراحات بناءً على معلومات القطاع والمؤسسة'
        : hasDocuments
          ? 'Documents analyzed and suggestions generated successfully'
          : 'Suggestions generated based on sector and organization information'
    })
  } catch (error) {
    console.error('Auto-fill API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate auto-fill suggestions' },
      { status: 500 }
    )
  }
}

function generateSuggestions(
  applicationData: Record<string, unknown>,
  documents: Array<{ type: string; fileName: string; ocrText?: string }>,
  isArabic: boolean
) {
  // Mock suggestions - in production, this would use AI to extract from documents
  const hasPolicy = documents?.some(d =>
    d.type === 'ESG_POLICY' || d.fileName?.toLowerCase().includes('policy')
  )
  const hasReport = documents?.some(d =>
    d.type === 'REPORT' || d.fileName?.toLowerCase().includes('report')
  )
  const hasTradeLicense = documents?.some(d =>
    d.fileName?.toLowerCase().includes('license') || d.fileName?.toLowerCase().includes('trade')
  )

  const suggestions: Record<string, string> = {}

  // Only suggest values for empty fields
  if (!applicationData?.applicantName) {
    suggestions.applicantName = isArabic ? 'أحمد محمد العلي' : 'Ahmed Mohamed Al-Ali'
  }

  if (!applicationData?.organizationName) {
    suggestions.organizationName = isArabic
      ? 'شركة الحلول المستدامة ذ.م.م'
      : 'Sustainable Solutions LLC'
  }

  if (!applicationData?.sector) {
    suggestions.sector = 'Manufacturing'
  }

  if (!applicationData?.phoneNumber) {
    suggestions.phoneNumber = '+971 2 555 1234'
  }

  if (!applicationData?.tradeLicenseNumber && hasTradeLicense) {
    suggestions.tradeLicenseNumber = 'CN-2024-123456'
  }

  if (!applicationData?.country) {
    suggestions.country = isArabic ? 'الإمارات العربية المتحدة' : 'United Arab Emirates'
  }

  // ESG Profile suggestions
  if (!applicationData?.environmentalProfile || applicationData?.environmentalProfile === '{}') {
    suggestions.environmentalProfile = JSON.stringify({
      description: isArabic
        ? 'نلتزم بتقليل انبعاثات الكربون بنسبة 30% بحلول 2025. نستخدم الطاقة الشمسية في 40% من عملياتنا ونعيد تدوير 85% من نفاياتنا الصناعية.'
        : 'We are committed to reducing carbon emissions by 30% by 2025. We utilize solar energy for 40% of our operations and recycle 85% of our industrial waste.',
      carbonEmissions: hasReport ? '2,500 tonnes CO2e annually' : '',
      energyReduction: '25% reduction achieved since 2022',
      wasteManagement: '85% recycling rate',
      waterConservation: 'Water recycling system saves 500,000 liters annually'
    })
  }

  if (!applicationData?.socialProfile || applicationData?.socialProfile === '{}') {
    suggestions.socialProfile = JSON.stringify({
      description: isArabic
        ? 'نوظف 200 موظف محلي مع نسبة تنوع 45% في المناصب القيادية. نقدم 40 ساعة تدريب سنوياً لكل موظف ونشارك في 10 مبادرات مجتمعية.'
        : 'We employ 200 local employees with 45% diversity in leadership positions. We provide 40 training hours annually per employee and participate in 10 community initiatives.',
      workforceDiversity: '45% women in leadership',
      communityPrograms: '10 active community initiatives',
      employeeTraining: '40 hours per employee annually',
      healthAndSafety: 'Zero workplace incidents in 2023'
    })
  }

  if (!applicationData?.governanceProfile || applicationData?.governanceProfile === '{}') {
    suggestions.governanceProfile = JSON.stringify({
      description: isArabic
        ? 'مجلس إدارة من 7 أعضاء مع لجنة ESG مخصصة. نلتزم بمعايير ISO 14001 ونجري تدقيقاً خارجياً سنوياً لممارسات الاستدامة.'
        : 'Board of 7 directors with a dedicated ESG committee. We comply with ISO 14001 standards and conduct annual external audits of sustainability practices.',
      boardStructure: '7-member board with ESG committee',
      complianceFrameworks: 'ISO 14001, ISO 45001 certified',
      riskManagement: 'Quarterly ESG risk assessments',
      transparency: 'Annual sustainability report published'
    })
  }

  return suggestions
}
