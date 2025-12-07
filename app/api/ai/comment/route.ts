import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description, sector, organizationName, type } = body

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // type can be 'corrections', 'approval', or 'rejection'
    let comment = ''

    if (type === 'corrections') {
      const correctionComments = [
        `Thank you for your ESG certification application. After careful review, we require the following additional information before proceeding:\n\n1. Please provide specific quantitative data for your environmental impact metrics (e.g., carbon emissions in tonnes CO2e, water usage in liters, waste diversion rates).\n\n2. Include documentation or evidence supporting your sustainability claims.\n\n3. Elaborate on your governance structure and ESG oversight mechanisms.\n\n4. Add details about stakeholder engagement and reporting practices.\n\nPlease update your application with this information and resubmit.`,

        `Dear Applicant,\n\nYour application shows promise but requires additional details:\n\n- Environmental: Need baseline measurements and reduction targets\n- Social: Please include employee diversity metrics and community impact data\n- Governance: Describe your ESG committee structure and reporting frequency\n\nWe look forward to reviewing your updated submission.`,

        `We have reviewed your application and identified the following areas that need enhancement:\n\n1. The ESG initiative description lacks specific, measurable targets\n2. No timeline provided for achieving sustainability goals\n3. Missing information about third-party certifications or audits\n4. Supply chain sustainability practices not addressed\n\nPlease revise and resubmit with the requested information.`,
      ]
      comment = correctionComments[Math.floor(Math.random() * correctionComments.length)]
    } else if (type === 'approval') {
      comment = `Congratulations! Your ESG certification application for ${organizationName} has been approved.\n\nYour organization has demonstrated a strong commitment to environmental sustainability, social responsibility, and sound governance practices. The comprehensive documentation and measurable targets provided in your application meet our certification standards.\n\nYour ESG certificate will be issued shortly. This certification is valid for two years, after which a renewal review will be required.\n\nThank you for your dedication to sustainable business practices.`
    } else if (type === 'rejection') {
      const rejectionComments = [
        `After thorough review, we regret to inform you that your ESG certification application has not been approved at this time.\n\nReasons for this decision:\n- Insufficient documentation of ESG practices\n- Lack of measurable sustainability targets\n- No evidence of systematic ESG management approach\n\nWe encourage you to develop a comprehensive ESG strategy and reapply in the future. Our team is available to provide guidance on the requirements.`,

        `Thank you for your interest in ESG certification. Unfortunately, your current application does not meet the minimum requirements for certification.\n\nKey concerns:\n- Environmental impact data is incomplete or missing\n- Social responsibility programs are not clearly defined\n- Governance structures for ESG oversight are inadequate\n\nWe recommend consulting with an ESG advisor to strengthen your sustainability framework before reapplying.`,
      ]
      comment = rejectionComments[Math.floor(Math.random() * rejectionComments.length)]
    } else {
      // General feedback
      comment = `Based on the application review for ${organizationName} in the ${sector} sector:\n\nThe organization shows commitment to ESG principles. Consider the following feedback for improvement:\n\n1. Strengthen environmental metrics with specific data\n2. Expand social impact documentation\n3. Clarify governance oversight mechanisms\n\nThis feedback is generated to assist in your review decision.`
    }

    return NextResponse.json({
      success: true,
      comment,
      type: type || 'general',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate AI comment' },
      { status: 500 }
    )
  }
}
