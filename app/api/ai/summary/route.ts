import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, sector, organizationName, applicantName } = body

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const riskLevel = Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.4 ? 'MEDIUM' : 'LOW'
    const completenessScore = Math.floor(Math.random() * 30) + 70 // 70-100

    // Generate summary based on input
    const summaries = [
      `**Application Summary for ${organizationName}**\n\nThis application from ${applicantName} in the ${sector} sector demonstrates a commitment to ESG principles. The organization has outlined various sustainability initiatives with measurable targets.\n\n**Key Strengths:**\n- Clear environmental objectives\n- Documented social responsibility programs\n- Established governance framework\n\n**Areas for Improvement:**\n- More specific quantitative metrics needed\n- Long-term sustainability roadmap could be expanded\n- Third-party verification recommended`,

      `**ESG Assessment Summary**\n\nApplicant: ${applicantName}\nOrganization: ${organizationName}\nSector: ${sector}\n\nThe submitted application shows ${completenessScore > 85 ? 'strong' : 'moderate'} alignment with ESG certification requirements. The environmental section is ${Math.random() > 0.5 ? 'well-documented' : 'adequately covered'}, with specific initiatives mentioned.\n\n**Risk Assessment:** ${riskLevel}\n\n**Recommendations:**\n- ${riskLevel === 'HIGH' ? 'Request additional documentation before proceeding' : 'Application can proceed to next review stage'}\n- Verify claims with supporting evidence\n- Consider on-site assessment for final approval`,

      `**Quick Summary: ${organizationName}**\n\nSector: ${sector}\nApplicant: ${applicantName}\n\n**Overview:**\nThis ${sector.toLowerCase()} organization has submitted an ESG certification application with ${description.length > 300 ? 'detailed' : 'basic'} documentation. The initiative description covers key ESG pillars.\n\n**ESG Pillar Assessment:**\n- Environmental: ${Math.random() > 0.5 ? 'Strong' : 'Moderate'}\n- Social: ${Math.random() > 0.5 ? 'Good' : 'Needs improvement'}\n- Governance: ${Math.random() > 0.5 ? 'Well-established' : 'Developing'}\n\n**Completeness Score:** ${completenessScore}%\n**Risk Level:** ${riskLevel}`,
    ]

    const summary = summaries[Math.floor(Math.random() * summaries.length)]

    const riskFlags = []
    if (riskLevel === 'HIGH') {
      riskFlags.push('Insufficient documentation')
      riskFlags.push('Missing quantitative metrics')
    } else if (riskLevel === 'MEDIUM') {
      riskFlags.push('Some claims require verification')
    }

    return NextResponse.json({
      success: true,
      summary,
      riskLevel,
      riskFlags,
      completenessScore,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate AI summary' },
      { status: 500 }
    )
  }
}
