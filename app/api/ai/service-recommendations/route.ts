import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock AI Service Recommendations endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sector,
      organizationSize,
      hasCompletedESG,
      locale = 'en'
    } = body

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 600))

    const isArabic = locale === 'ar'

    // Get all services from database
    const allServices = await prisma.service.findMany()

    // Generate recommendations based on context
    const recommendations = generateRecommendations(
      allServices,
      sector,
      organizationSize,
      hasCompletedESG,
      isArabic
    )

    return NextResponse.json({
      success: true,
      recommendations,
      reasoning: isArabic
        ? 'بناءً على قطاعك وحجم مؤسستك، نوصي بالخدمات التالية'
        : 'Based on your sector and organization profile, we recommend these services'
    })
  } catch (error) {
    console.error('Service recommendations API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate service recommendations' },
      { status: 500 }
    )
  }
}

interface ServiceRecommendation {
  id: number
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  platform: string
  relevanceScore: number
  reason: string
  reasonAr: string
}

function generateRecommendations(
  services: Array<{
    id: number
    name: string
    nameAr: string
    description: string
    descriptionAr: string
    platform: string
    dept: string
    channelType: string
    tags: string | null
  }>,
  sector: string | null,
  organizationSize: string | null,
  hasCompletedESG: boolean,
  isArabic: boolean
): ServiceRecommendation[] {
  const recommendations: ServiceRecommendation[] = []

  // Define recommendation rules
  const recommendationRules = [
    {
      namePattern: /certificate.*origin/i,
      reason: 'Essential for international trade and export activities',
      reasonAr: 'ضروري للتجارة الدولية وأنشطة التصدير',
      relevance: 85,
      sectors: ['Manufacturing', 'Trade', 'Logistics']
    },
    {
      namePattern: /business.*matchmaking/i,
      reason: 'Connect with potential partners and investors in your sector',
      reasonAr: 'تواصل مع شركاء ومستثمرين محتملين في قطاعك',
      relevance: 80,
      sectors: null // All sectors
    },
    {
      namePattern: /upskilling|training/i,
      reason: 'Enhance team capabilities to support ESG implementation',
      reasonAr: 'تعزيز قدرات الفريق لدعم تنفيذ ESG',
      relevance: 75,
      sectors: null
    },
    {
      namePattern: /legal.*consultancy/i,
      reason: 'Get legal guidance for ESG compliance and contracts',
      reasonAr: 'احصل على إرشادات قانونية للامتثال لـ ESG والعقود',
      relevance: 70,
      sectors: null
    },
    {
      namePattern: /contract.*guard/i,
      reason: 'Protect your business agreements and partnerships',
      reasonAr: 'احمِ اتفاقياتك وشراكاتك التجارية',
      relevance: 65,
      sectors: null
    },
    {
      namePattern: /data.*hub|analytics/i,
      reason: 'Access market data to inform your ESG strategy',
      reasonAr: 'الوصول إلى بيانات السوق لتوجيه استراتيجية ESG',
      relevance: 72,
      sectors: null
    },
    {
      namePattern: /membership/i,
      reason: 'Access exclusive member benefits and networking opportunities',
      reasonAr: 'الوصول إلى مزايا العضوية الحصرية وفرص التواصل',
      relevance: 60,
      sectors: null
    },
    {
      namePattern: /youth.*council/i,
      reason: 'Great networking for young entrepreneurs and startups',
      reasonAr: 'تواصل رائع لرواد الأعمال الشباب والشركات الناشئة',
      relevance: 55,
      sectors: null
    },
    {
      namePattern: /businesswomen/i,
      reason: 'Empowerment programs and networking for women in business',
      reasonAr: 'برامج تمكين وتواصل للمرأة في الأعمال',
      relevance: 55,
      sectors: null
    }
  ]

  for (const service of services) {
    // Skip ESG service (they already have it or are applying)
    if (service.name.toLowerCase().includes('esg')) continue

    for (const rule of recommendationRules) {
      if (rule.namePattern.test(service.name)) {
        let relevance = rule.relevance

        // Boost relevance for sector-specific recommendations
        if (rule.sectors && sector && rule.sectors.includes(sector)) {
          relevance += 10
        }

        // Boost relevance if they completed ESG (they're serious about growth)
        if (hasCompletedESG) {
          relevance += 5
        }

        recommendations.push({
          id: service.id,
          name: service.name,
          nameAr: service.nameAr,
          description: service.description,
          descriptionAr: service.descriptionAr,
          platform: service.platform,
          relevanceScore: Math.min(relevance, 100),
          reason: rule.reason,
          reasonAr: rule.reasonAr
        })
        break // Only one match per service
      }
    }
  }

  // Sort by relevance and return top 5
  return recommendations
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5)
}
