import { NextRequest, NextResponse } from 'next/server'

// Mock AI Document Classifier endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, ocrText, userSelectedType, locale = 'en', documentIndex = 0 } = body

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 600))

    const isArabic = locale === 'ar'
    const result = classifyDocument(fileName, ocrText, isArabic, documentIndex)

    return NextResponse.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Document classifier API error:', error)
    return NextResponse.json(
      { error: 'Failed to classify document' },
      { status: 500 }
    )
  }
}

interface ClassificationResult {
  detectedType: string
  detectedTypeLabel: string
  confidence: number
  reasoning: string
}

function classifyDocument(
  fileName: string,
  ocrText: string | null,
  isArabic: boolean,
  documentIndex: number
): ClassificationResult {
  // Define document types to cycle through for demo purposes
  const documentTypes = [
    {
      type: 'ESG_POLICY',
      labelEn: 'ESG Policy',
      labelAr: 'سياسة ESG',
      confidence: 0.90,
      reasoningEn: 'Document contains organizational sustainability policies and commitments',
      reasoningAr: 'يحتوي المستند على سياسات الاستدامة والالتزامات المؤسسية'
    },
    {
      type: 'SUSTAINABILITY_REPORT',
      labelEn: 'Sustainability Report',
      labelAr: 'تقرير الاستدامة',
      confidence: 0.88,
      reasoningEn: 'Annual sustainability performance metrics and achievements identified',
      reasoningAr: 'تم تحديد مقاييس الأداء السنوية للاستدامة والإنجازات'
    },
    {
      type: 'GOVERNANCE_POLICY',
      labelEn: 'Governance Policy',
      labelAr: 'سياسة الحوكمة',
      confidence: 0.92,
      reasoningEn: 'Corporate governance framework and board structure documentation',
      reasoningAr: 'وثائق إطار الحوكمة المؤسسية وهيكل مجلس الإدارة'
    },
    {
      type: 'ENVIRONMENTAL_EVIDENCE',
      labelEn: 'Environmental Performance Evidence',
      labelAr: 'أدلة الأداء البيئي',
      confidence: 0.85,
      reasoningEn: 'Environmental metrics, carbon footprint, and resource usage data',
      reasoningAr: 'مقاييس بيئية وبصمة كربونية وبيانات استخدام الموارد'
    },
    {
      type: 'SOCIAL_IMPACT_REPORT',
      labelEn: 'Social Impact Report',
      labelAr: 'تقرير الأثر الاجتماعي',
      confidence: 0.87,
      reasoningEn: 'Social responsibility initiatives and community impact documentation',
      reasoningAr: 'مبادرات المسؤولية الاجتماعية ووثائق الأثر المجتمعي'
    },
    {
      type: 'CERTIFICATION',
      labelEn: 'Certification',
      labelAr: 'شهادة اعتماد',
      confidence: 0.95,
      reasoningEn: 'ISO or industry certification document detected',
      reasoningAr: 'تم اكتشاف شهادة ISO أو شهادة صناعية'
    },
    {
      type: 'TRADE_LICENSE',
      labelEn: 'Trade License',
      labelAr: 'الرخصة التجارية',
      confidence: 0.94,
      reasoningEn: 'Business registration and trade license documentation',
      reasoningAr: 'وثائق تسجيل الأعمال والرخصة التجارية'
    }
  ]

  // Use document index to cycle through different types for demo variety
  const selectedType = documentTypes[documentIndex % documentTypes.length]

  return {
    detectedType: selectedType.type,
    detectedTypeLabel: isArabic ? selectedType.labelAr : selectedType.labelEn,
    confidence: selectedType.confidence,
    reasoning: isArabic ? selectedType.reasoningAr : selectedType.reasoningEn
  }
}
