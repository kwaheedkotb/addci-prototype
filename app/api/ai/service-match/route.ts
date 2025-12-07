import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ServiceMatchRequest {
  query: string
  lang: 'en' | 'ar'
}

interface MatchedService {
  serviceId: number
  confidence: number
}

interface ServiceMatchResponse {
  reasoningSummary: string
  matchedServices: MatchedService[]
}

// Simple keyword-based matching with scoring
function matchServices(
  query: string,
  services: Array<{
    id: number
    name: string
    nameAr: string
    description: string
    descriptionAr: string
    tags: string | null
    tagsAr: string | null
  }>,
  lang: 'en' | 'ar'
): MatchedService[] {
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2)

  const scores: Array<{ serviceId: number; score: number }> = []

  for (const service of services) {
    let score = 0
    const name = lang === 'ar' ? service.nameAr : service.name
    const description = lang === 'ar' ? service.descriptionAr : service.description
    const tagsStr = lang === 'ar' ? service.tagsAr : service.tags

    const nameLower = name.toLowerCase()
    const descLower = description.toLowerCase()

    // Parse tags
    let tags: string[] = []
    if (tagsStr) {
      try {
        tags = JSON.parse(tagsStr)
      } catch {
        tags = []
      }
    }

    // Exact name match (high score)
    if (nameLower.includes(queryLower) || queryLower.includes(nameLower)) {
      score += 50
    }

    // Word matches in name
    for (const word of queryWords) {
      if (nameLower.includes(word)) {
        score += 20
      }
    }

    // Word matches in description
    for (const word of queryWords) {
      if (descLower.includes(word)) {
        score += 10
      }
    }

    // Tag matches (high score for exact tag matches)
    for (const word of queryWords) {
      for (const tag of tags) {
        if (tag.toLowerCase().includes(word) || word.includes(tag.toLowerCase())) {
          score += 30
        }
      }
    }

    // Special handling for common queries
    if (queryLower.includes('esg') || queryLower.includes('sustainability') || queryLower.includes('استدامة')) {
      if (service.name.includes('ESG')) {
        score += 100
      }
    }

    if (queryLower.includes('certificate') || queryLower.includes('شهادة')) {
      if (nameLower.includes('certificate') || nameLower.includes('شهادة')) {
        score += 40
      }
    }

    if (queryLower.includes('membership') || queryLower.includes('عضوية')) {
      if (nameLower.includes('membership') || nameLower.includes('عضوية')) {
        score += 40
      }
    }

    if (score > 0) {
      scores.push({ serviceId: service.id, score })
    }
  }

  // Sort by score descending and normalize to confidence (0-1)
  scores.sort((a, b) => b.score - a.score)

  const maxScore = scores.length > 0 ? scores[0].score : 1

  return scores.slice(0, 5).map(s => ({
    serviceId: s.serviceId,
    confidence: Math.min(1, s.score / maxScore)
  }))
}

// Generate AI-like reasoning summary
function generateReasoningSummary(
  query: string,
  matchedCount: number,
  lang: 'en' | 'ar'
): string {
  if (lang === 'ar') {
    if (matchedCount === 0) {
      return `لم أتمكن من العثور على خدمات تتطابق مع "${query}". يرجى المحاولة بكلمات مختلفة أو تصفح دليل الخدمات.`
    }
    return `بناءً على استفسارك "${query}"، قمت بتحليل الكلمات الرئيسية والسياق لتحديد الخدمات الأكثر صلة. وجدت ${matchedCount} خدمة/خدمات قد تلبي احتياجاتك. يتم ترتيب النتائج حسب درجة الثقة بناءً على مدى تطابقها مع طلبك.`
  }

  if (matchedCount === 0) {
    return `I couldn't find any services matching "${query}". Please try different keywords or browse the service directory.`
  }
  return `Based on your query "${query}", I analyzed the keywords and context to identify the most relevant services. I found ${matchedCount} service(s) that may meet your needs. Results are ranked by confidence score based on how closely they match your request.`
}

export async function POST(request: NextRequest) {
  try {
    const body: ServiceMatchRequest = await request.json()
    const { query, lang = 'en' } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    // Fetch all services
    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        nameAr: true,
        description: true,
        descriptionAr: true,
        tags: true,
        tagsAr: true,
      },
    })

    // Match services
    const matchedServices = matchServices(query, services, lang)

    // Generate response
    const response: ServiceMatchResponse = {
      reasoningSummary: generateReasoningSummary(query, matchedServices.length, lang),
      matchedServices,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Service match error:', error)
    return NextResponse.json(
      { error: 'Failed to match services' },
      { status: 500 }
    )
  }
}
