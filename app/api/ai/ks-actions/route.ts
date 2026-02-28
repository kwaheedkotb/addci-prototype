import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationId, submittedBy, submittedByEmail, memberTier, status, requestType, programType, programName, queryText, numberOfAttendees, sessionDate, sessionDates, respondedAt, surveySentAt, activityLogs } = body

    if (!applicationId) {
      return NextResponse.json({ success: false, error: 'applicationId is required' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Anthropic API key not configured' }, { status: 503 })
    }

    const client = new Anthropic({ apiKey })

    const prompt = `You are an internal operations assistant for the Abu Dhabi Chamber of Commerce and Industry (ADCCI). Based on this Knowledge Sharing application, recommend next actions for the staff reviewer.

Application Details:
- ID: ${applicationId}
- Submitted By: ${submittedBy} (${submittedByEmail})
- Member Tier: ${memberTier}
- Status: ${status}
- Request Type: ${requestType === 'CALENDAR_BOOKING' ? 'Calendar Booking' : 'Training Query'}
${programType ? `- Program Type: ${programType}` : ''}
${programName ? `- Program Name: ${programName}` : ''}
${requestType === 'TRAINING_QUERY' && queryText ? `- Query: ${queryText}` : ''}
${numberOfAttendees ? `- Number of Attendees: ${numberOfAttendees}` : ''}
${sessionDate ? `- Session Date: ${sessionDate}` : ''}
${sessionDates ? `- Session Dates: ${sessionDates}` : ''}
${respondedAt ? `- Response Sent: ${respondedAt}` : '- No response sent yet'}
${surveySentAt ? `- Survey Sent: ${surveySentAt}` : '- Survey not sent'}
${activityLogs?.length ? `- Activity Log:\n${activityLogs.map((l: { action: string; performedAt: string }) => `  * ${l.action} (${new Date(l.performedAt).toLocaleDateString()})`).join('\n')}` : ''}

Return a JSON array of 3-5 recommended actions. Each action must have:
- "action": short action description (string)
- "priority": "high" | "medium" | "low"
- "reason": brief explanation why this action matters (string)

Consider the current status, whether a response has been sent, SLA timelines (Knowledge Sharing SLA is 1 business day), member tier priority, and any pending follow-ups.

Return ONLY valid JSON array, no markdown formatting or code blocks.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '[]'

    let actions: Array<{ action: string; priority: string; reason: string }>
    try {
      actions = JSON.parse(rawText)
    } catch {
      // If the response isn't valid JSON, wrap it in a single action
      actions = [{ action: rawText, priority: 'medium', reason: 'AI response could not be parsed as structured actions' }]
    }

    return NextResponse.json({ success: true, actions })
  } catch (error) {
    console.error('KS AI actions error:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate AI recommended actions' }, { status: 500 })
  }
}
