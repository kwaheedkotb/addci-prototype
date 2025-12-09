import { NextRequest, NextResponse } from 'next/server'

// Mock AI Compliance Score endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      environmentalProfile,
      socialProfile,
      governanceProfile,
      sector,
      organizationName,
      locale = 'en'
    } = body

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800))

    const isArabic = locale === 'ar'
    const result = calculateComplianceScore(
      environmentalProfile,
      socialProfile,
      governanceProfile,
      sector,
      isArabic
    )

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Compliance score API error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate compliance score' },
      { status: 500 }
    )
  }
}

function calculateComplianceScore(
  environmentalProfile: string | null,
  socialProfile: string | null,
  governanceProfile: string | null,
  sector: string | null,
  isArabic: boolean
) {
  let score = 0
  const hints: string[] = []
  const strengths: string[] = []

  // Parse profiles
  let envData: Record<string, string> = {}
  let socData: Record<string, string> = {}
  let govData: Record<string, string> = {}

  try {
    if (environmentalProfile) envData = JSON.parse(environmentalProfile)
    if (socialProfile) socData = JSON.parse(socialProfile)
    if (governanceProfile) govData = JSON.parse(governanceProfile)
  } catch {
    // Invalid JSON, continue with empty objects
  }

  // Environmental scoring (max 35 points)
  let envScore = 0
  if (envData.description && envData.description.length > 50) {
    envScore += 15
    strengths.push(isArabic ? 'وصف بيئي شامل' : 'Comprehensive environmental description')
  } else {
    hints.push(isArabic
      ? 'أضف وصفاً مفصلاً للمبادرات البيئية'
      : 'Add a detailed description of environmental initiatives')
  }

  if (envData.carbonEmissions) {
    envScore += 7
    strengths.push(isArabic ? 'بيانات انبعاثات الكربون موجودة' : 'Carbon emissions data provided')
  } else {
    hints.push(isArabic
      ? 'أضف مؤشرات أداء كمية للانبعاثات الكربونية'
      : 'Add quantitative carbon emission KPIs')
  }

  if (envData.energyReduction) envScore += 5
  if (envData.wasteManagement) envScore += 5
  if (envData.waterConservation) envScore += 3
  score += envScore

  // Social scoring (max 35 points)
  let socScore = 0
  if (socData.description && socData.description.length > 50) {
    socScore += 15
    strengths.push(isArabic ? 'وصف اجتماعي قوي' : 'Strong social responsibility description')
  } else {
    hints.push(isArabic
      ? 'أضف وصفاً للمسؤولية الاجتماعية'
      : 'Add a description of social responsibility initiatives')
  }

  if (socData.workforceDiversity) {
    socScore += 7
  } else {
    hints.push(isArabic
      ? 'أضف معلومات عن تنوع القوى العاملة'
      : 'Add workforce diversity information')
  }

  if (socData.communityPrograms) socScore += 5
  if (socData.employeeTraining) socScore += 5
  if (socData.healthAndSafety) socScore += 3
  score += socScore

  // Governance scoring (max 30 points)
  let govScore = 0
  if (govData.description && govData.description.length > 50) {
    govScore += 12
  } else {
    hints.push(isArabic
      ? 'وصف الحوكمة عام جداً ويفتقر لتفاصيل مجلس الإدارة'
      : 'Governance description is generic and lacks board oversight details')
  }

  if (govData.boardStructure) {
    govScore += 8
    strengths.push(isArabic ? 'هيكل مجلس إدارة واضح' : 'Clear board structure defined')
  } else {
    hints.push(isArabic
      ? 'أضف تفاصيل هيكل مجلس الإدارة ولجنة ESG'
      : 'Add board structure and ESG committee details')
  }

  if (govData.complianceFrameworks) govScore += 5
  if (govData.riskManagement) govScore += 3
  if (govData.transparency) govScore += 2
  score += govScore

  // Determine readiness level
  let readinessLevel: string
  let readinessColor: string

  if (score >= 80) {
    readinessLevel = isArabic ? 'ممتاز - جاهز للموافقة' : 'Excellent - Ready for Approval'
    readinessColor = 'green'
  } else if (score >= 60) {
    readinessLevel = isArabic ? 'جيد - يحتاج تحسينات طفيفة' : 'Good - Minor Improvements Needed'
    readinessColor = 'blue'
  } else if (score >= 40) {
    readinessLevel = isArabic ? 'متوسط - يحتاج مزيد من التفاصيل' : 'Fair - More Details Required'
    readinessColor = 'yellow'
  } else {
    readinessLevel = isArabic ? 'يحتاج عمل - بيانات غير مكتملة' : 'Needs Work - Incomplete Data'
    readinessColor = 'red'
  }

  return {
    score,
    maxScore: 100,
    readinessLevel,
    readinessColor,
    breakdown: {
      environmental: { score: envScore, max: 35 },
      social: { score: socScore, max: 35 },
      governance: { score: govScore, max: 30 }
    },
    hints: hints.slice(0, 5), // Limit to 5 hints
    strengths: strengths.slice(0, 3) // Limit to 3 strengths
  }
}
