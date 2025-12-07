import { NextRequest, NextResponse } from 'next/server'

// Mock AI endpoint for ESG profile hints and suggestions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profile, type } = body // type: 'environmental' | 'social' | 'governance'

    if (!type) {
      return NextResponse.json(
        { error: 'type is required (environmental, social, or governance)' },
        { status: 400 }
      )
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1200))

    const hints = generateHints(type, profile)

    return NextResponse.json({
      success: true,
      type,
      hints,
    })
  } catch (error) {
    console.error('ESG Hints error:', error)
    return NextResponse.json(
      { error: 'Failed to generate ESG hints' },
      { status: 500 }
    )
  }
}

function generateHints(type: string, profile?: { description?: string }): {
  suggestions: string[]
  missingAreas: string[]
  improvementTips: string[]
  sampleKpis: string[]
} {
  const hasDescription = profile?.description && profile.description.trim().length > 50

  const hintsData: Record<string, {
    suggestions: string[]
    missingAreas: string[]
    improvementTips: string[]
    sampleKpis: string[]
  }> = {
    environmental: {
      suggestions: [
        'Consider including your carbon neutrality goals and timeline',
        'Mention any renewable energy initiatives or targets',
        'Describe waste reduction and recycling programs',
        'Include water conservation measures if applicable',
        'Reference any environmental certifications (ISO 14001, etc.)',
      ],
      missingAreas: hasDescription ? [
        'Specific emission reduction targets',
        'Energy efficiency metrics',
        'Supply chain environmental policies',
      ] : [
        'Overall environmental policy statement',
        'Climate action commitments',
        'Resource efficiency measures',
        'Biodiversity considerations',
      ],
      improvementTips: [
        'Add quantifiable targets (e.g., "reduce emissions by 30% by 2030")',
        'Reference international frameworks like GRI or TCFD',
        'Include scope 1, 2, and 3 emission considerations',
        'Mention third-party audits or verifications',
      ],
      sampleKpis: [
        'CO2 emissions (tCO2e/year): e.g., 15,000 tCO2e',
        'Energy intensity (GJ/unit): e.g., 0.5 GJ/unit produced',
        'Renewable energy share (%): e.g., 40% of total consumption',
        'Water usage (m3/year): e.g., 50,000 m3',
        'Waste recycling rate (%): e.g., 75% diverted from landfill',
      ],
    },
    social: {
      suggestions: [
        'Describe workforce diversity and inclusion initiatives',
        'Include employee health and safety programs',
        'Mention community engagement and CSR activities',
        'Reference employee training and development programs',
        'Describe supply chain labor standards',
      ],
      missingAreas: hasDescription ? [
        'Employee satisfaction metrics',
        'Community investment figures',
        'Human rights due diligence',
      ] : [
        'Workforce diversity statistics',
        'Health and safety policy',
        'Community engagement programs',
        'Employee wellbeing initiatives',
      ],
      improvementTips: [
        'Include gender diversity ratios at different levels',
        'Add employee turnover and satisfaction rates',
        'Describe grievance mechanisms',
        'Reference ILO standards or SA8000 if applicable',
      ],
      sampleKpis: [
        'Gender diversity (%): e.g., 45% women in workforce',
        'Women in leadership (%): e.g., 35% in senior roles',
        'Training hours per employee: e.g., 40 hours/year',
        'Lost time injury rate: e.g., 0.5 per million hours',
        'Employee satisfaction score: e.g., 4.2/5',
      ],
    },
    governance: {
      suggestions: [
        'Describe board composition and independence',
        'Include ethics and anti-corruption policies',
        'Mention risk management framework',
        'Reference compliance with regulations',
        'Describe stakeholder engagement practices',
      ],
      missingAreas: hasDescription ? [
        'Board diversity metrics',
        'Executive compensation disclosure',
        'Whistleblower protection mechanisms',
      ] : [
        'Board structure and composition',
        'Ethics and compliance framework',
        'Risk management approach',
        'Transparency and disclosure practices',
      ],
      improvementTips: [
        'Specify the ratio of independent directors',
        'Describe ESG committee if established',
        'Include information on ESG-linked compensation',
        'Reference governance codes followed (e.g., UK Corporate Governance Code)',
      ],
      sampleKpis: [
        'Independent directors (%): e.g., 70% of board',
        'Board gender diversity (%): e.g., 40% women',
        'Ethics training completion (%): e.g., 100% of employees',
        'Audit committee meetings/year: e.g., 8 meetings',
        'ESG reporting frequency: e.g., Annual integrated report',
      ],
    },
  }

  return hintsData[type] || hintsData.environmental
}
