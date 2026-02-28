import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationId, submittedBy, submittedByEmail, memberTier, status, requestType, programType, programName, queryText, numberOfAttendees, sessionDate, sessionDates, activityLogs } = body

    if (!applicationId) {
      return NextResponse.json({ success: false, error: 'applicationId is required' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Anthropic API key not configured' }, { status: 503 })
    }

    const client = new Anthropic({ apiKey })

    const prompt = `You are an internal operations assistant for the Abu Dhabi Chamber of Commerce and Industry (ADCCI). Summarize this Knowledge Sharing application for a staff reviewer.

Application Details:
- ID: ${applicationId}
- Submitted By: ${submittedBy} (${submittedByEmail})
- Member Tier: ${memberTier}
- Status: ${status}
- Request Type: ${requestType === 'CALENDAR_BOOKING' ? 'Calendar Booking (training session reservation)' : 'Training Query (information request)'}
${programType ? `- Program Type: ${programType}` : ''}
${programName ? `- Program Name: ${programName}` : ''}
${requestType === 'TRAINING_QUERY' && queryText ? `- Query: ${queryText}` : ''}
${numberOfAttendees ? `- Number of Attendees: ${numberOfAttendees}` : ''}
${sessionDate ? `- Session Date: ${sessionDate}` : ''}
${sessionDates ? `- Session Dates: ${sessionDates}` : ''}
${activityLogs?.length ? `- Activity Log:\n${activityLogs.map((l: { action: string; performedAt: string }) => `  * ${l.action} (${new Date(l.performedAt).toLocaleDateString()})`).join('\n')}` : ''}

Provide a concise summary in 3-5 sentences covering:
1. What the member is requesting
2. Key details (program, dates, attendees if applicable)
3. Current status and any notable activity
4. Priority assessment based on member tier and request urgency`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const summary = message.content[0].type === 'text' ? message.content[0].text : ''

    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error('KS AI summary error:', error)
    return NextResponse.json({ success: false, error: 'Failed to generate AI summary' }, { status: 500 })
  }
}
