import { NextRequest, NextResponse } from 'next/server'
import { allAreaStats as areaStats, allSectorStats as sectorStats } from '@/lib/market-directory-data'
import type { AreaStat } from '@/lib/market-directory-data'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      sector,
      subSector,
      companySize,
      legalStructure,
      budget,
      priorities = [],
      additionalContext,
      locale = 'en',
    } = body as {
      sector: string
      subSector?: string
      companySize?: string
      legalStructure?: string
      budget?: string
      priorities?: string[]
      additionalContext?: string
      locale?: string
    }

    // Simulate AI processing delay (2-3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2200))

    const isArabic = locale === 'ar'

    // Find sector stats
    const sectorStat = sectorStats.find((s) => s.sector === sector)

    // Score each area based on input criteria
    const scoredAreas = areaStats.map((area) => {
      let score = 50 // base

      // Sector match — if area's top sectors include the requested sector
      if (area.topSectors.includes(sector)) {
        score += 20
      }

      // Saturation preference — lower saturation = better opportunity
      const saturationBonus: Record<string, number> = {
        Low: 15,
        Medium: 8,
        High: -5,
        'Very High': -12,
      }
      score += saturationBonus[area.saturationLevel] || 0

      // Growth trend bonus
      const growthBonus: Record<string, number> = {
        Growing: 12,
        Stable: 5,
        Declining: -5,
      }
      score += growthBonus[area.growthTrend] || 0

      // Budget alignment — lower rent for tighter budgets
      if (budget) {
        const rentNum = parseInt(area.averageRent.replace(/[^0-9]/g, ''))
        if (budget.includes('Under AED 50K') && rentNum < 150) score += 10
        else if (budget.includes('50K–150K') && rentNum < 250) score += 8
        else if (budget.includes('150K–500K') && rentNum < 400) score += 6
        else if (budget.includes('Above AED 500K')) score += 4
      }

      // Priority alignment
      if (priorities.includes('Affordable Rent')) {
        const rentNum = parseInt(area.averageRent.replace(/[^0-9]/g, ''))
        score += rentNum < 200 ? 8 : -3
      }
      if (priorities.includes('Low Competition')) {
        if (area.saturationLevel === 'Low' || area.saturationLevel === 'Medium') score += 10
      }
      if (priorities.includes('Proximity to Clients')) {
        if (['Al Maryah Island', 'ADGM', 'Downtown Abu Dhabi'].includes(area.area)) score += 10
      }
      if (priorities.includes('Government Proximity')) {
        if (['Downtown Abu Dhabi', 'Al Maryah Island', 'Corniche'].includes(area.area)) score += 10
      }
      if (priorities.includes('Free Zone Benefits')) {
        if (['ADGM', 'Masdar City'].includes(area.area)) score += 15
      }
      if (priorities.includes('Talent Availability')) {
        if (['Al Reem Island', 'Khalifa City', 'Al Maryah Island'].includes(area.area)) score += 8
      }
      if (priorities.includes('Prestige Address')) {
        if (['Al Maryah Island', 'ADGM', 'Saadiyat Island', 'Corniche'].includes(area.area)) score += 10
      }
      if (priorities.includes('Logistics & Port Access')) {
        if (['Mussafah', 'Khalifa City'].includes(area.area)) score += 12
      }

      // Cap score to 0-98
      score = Math.max(0, Math.min(98, score))

      return { area, score }
    })

    // Sort by score, take top 5
    const topAreas = scoredAreas.sort((a, b) => b.score - a.score).slice(0, 5)

    const recommendations = topAreas.map((item, idx) => ({
      rank: idx + 1,
      area: isArabic ? item.area.areaAr : item.area.area,
      matchScore: item.score,
      rationale: generateRationale(item.area, sector, isArabic),
      competitiveLandscape: generateCompetitiveLandscape(item.area, sector, isArabic),
      keyAdvantages: generateAdvantages(item.area, isArabic),
      potentialChallenges: generateChallenges(item.area, isArabic),
      saturationLevel: item.area.saturationLevel,
      growthTrend: item.area.growthTrend,
    }))

    const sectorOutlook = sectorStat
      ? {
          summary: isArabic
            ? `قطاع ${sectorStat.sectorAr} في أبوظبي يظهر نشاطاً قوياً مع ${sectorStat.totalCompanies} شركة مسجلة ومعدل نمو ${sectorStat.growthRate}%. درجة الفرصة ${sectorStat.opportunityScore}/10 تشير إلى إمكانات واعدة للداخلين الجدد.`
            : `The ${sectorStat.sector} sector in Abu Dhabi shows strong activity with ${sectorStat.totalCompanies} registered companies and a growth rate of ${sectorStat.growthRate}%. An opportunity score of ${sectorStat.opportunityScore}/10 indicates promising potential for new entrants.`,
          opportunityScore: sectorStat.opportunityScore,
          growthRate: sectorStat.growthRate,
          keyDrivers: isArabic ? sectorStat.keyDriversAr : sectorStat.keyDrivers,
        }
      : {
          summary: isArabic
            ? 'لم يتم العثور على بيانات تفصيلية لهذا القطاع. يُرجى التواصل مع الغرفة للحصول على تقرير مخصص.'
            : 'Detailed data for this sector was not found. Please contact the Chamber for a custom report.',
          opportunityScore: 5,
          growthRate: 0,
          keyDrivers: [],
        }

    const nextSteps = isArabic
      ? [
          'زر غرفة أبوظبي للحصول على استشارة تأسيس مجانية',
          'قدم طلب الرخصة التجارية عبر منصة "تم" أو ADGM',
          'استكشف مساحات العمل المشترك والمكاتب المتاحة في المناطق الموصى بها',
          'تواصل مع برنامج مطابقة الأعمال في الغرفة للتعرف على شركاء محتملين',
          'اطلب تقرير سوق مفصل من مركز البيانات في الغرفة',
        ]
      : [
          'Visit Abu Dhabi Chamber for a free setup consultation',
          'Apply for your trade license via Tamm portal or ADGM',
          'Explore co-working spaces and offices in recommended areas',
          'Connect with the Chamber\'s Business Matchmaking program for potential partners',
          'Request a detailed market report from the Chamber\'s Data Hub',
        ]

    const disclaimer = isArabic
      ? 'هذه التوصيات مبنية على تحليل البيانات المتاحة ولا تشكل مشورة قانونية أو مالية. الظروف الفعلية قد تختلف. يُرجى استشارة متخصص قبل اتخاذ قرارات الاستثمار.'
      : 'These recommendations are based on available data analysis and do not constitute legal or financial advice. Actual conditions may vary. Please consult a specialist before making investment decisions.'

    return NextResponse.json({
      success: true,
      recommendations,
      sectorOutlook,
      nextSteps,
      disclaimer,
    })
  } catch (error) {
    console.error('Setup Advisor API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate setup recommendations' },
      { status: 500 }
    )
  }
}

function generateRationale(area: AreaStat, sector: string, isArabic: boolean): string {
  const hasSector = area.topSectors.includes(sector)
  if (isArabic) {
    if (hasSector) {
      return `${area.areaAr} تضم بالفعل مجتمعاً نشطاً في قطاع ${sector}، مما يوفر فرص تواصل وتعاون. مستوى التشبع ${area.saturationLevel === 'Low' ? 'المنخفض' : area.saturationLevel === 'Medium' ? 'المتوسط' : 'المرتفع'} يعني مساحة للنمو.`
    }
    return `${area.areaAr} تقدم بيئة أعمال متنوعة مع بنية تحتية قوية. اتجاه النمو ${area.growthTrend === 'Growing' ? 'التصاعدي' : 'المستقر'} يشير إلى فرص واعدة.`
  }
  if (hasSector) {
    return `${area.area} already hosts an active ${sector} community, providing networking and collaboration opportunities. The ${area.saturationLevel.toLowerCase()} saturation level means room for growth.`
  }
  return `${area.area} offers a diverse business environment with strong infrastructure. The ${area.growthTrend.toLowerCase()} growth trend indicates promising opportunities.`
}

function generateCompetitiveLandscape(area: AreaStat, sector: string, isArabic: boolean): string {
  if (isArabic) {
    return `${area.totalCompanies} شركة مسجلة في المنطقة. القطاعات الرئيسية: ${area.topSectorsAr.join('، ')}. متوسط الإيجار: ${area.averageRent}.`
  }
  return `${area.totalCompanies} registered companies in the area. Key sectors: ${area.topSectors.join(', ')}. Average rent: ${area.averageRent}.`
}

function generateAdvantages(area: AreaStat, isArabic: boolean): string[] {
  const infra = isArabic ? area.keyInfrastructureAr : area.keyInfrastructure
  const advantages = infra.slice(0, 3)

  if (area.growthTrend === 'Growing') {
    advantages.push(
      isArabic ? 'سوق نامي مع فرص متزايدة' : 'Growing market with increasing opportunities'
    )
  }
  if (area.saturationLevel === 'Low' || area.saturationLevel === 'Medium') {
    advantages.push(
      isArabic ? 'منافسة معتدلة — مساحة للداخلين الجدد' : 'Moderate competition — room for new entrants'
    )
  }
  return advantages
}

function generateChallenges(area: AreaStat, isArabic: boolean): string[] {
  const challenges: string[] = []
  const rentNum = parseInt(area.averageRent.replace(/[^0-9]/g, ''))

  if (rentNum > 250) {
    challenges.push(
      isArabic ? 'تكاليف إيجار مرتفعة نسبياً' : 'Relatively high rental costs'
    )
  }
  if (area.saturationLevel === 'High' || area.saturationLevel === 'Very High') {
    challenges.push(
      isArabic ? 'سوق مشبع — يتطلب تمايز قوي' : 'Saturated market — requires strong differentiation'
    )
  }
  if (challenges.length === 0) {
    challenges.push(
      isArabic ? 'قد يتطلب بناء شبكة علاقات محلية' : 'May require building local network from scratch'
    )
  }
  return challenges
}
