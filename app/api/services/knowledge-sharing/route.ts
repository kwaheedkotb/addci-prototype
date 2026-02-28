import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.requestType || !body.companyName || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: requestType, companyName, email' },
        { status: 400 }
      )
    }

    if (body.requestType === 'TRAINING_QUERY' && (!body.queryText || body.queryText.length < 20)) {
      return NextResponse.json(
        { success: false, error: 'Query text is required and must be at least 20 characters' },
        { status: 400 }
      )
    }

    // Wrap both creates in a transaction so they succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create BaseApplication
      const base = await tx.baseApplication.create({
        data: {
          serviceType: 'KNOWLEDGE_SHARING',
          status: 'SUBMITTED',
          submittedBy: body.companyName,
          submittedByEmail: body.email,
          memberTier: body.memberTier ?? 'Standard',
        },
      })

      // 2. Create linked KnowledgeSharingApplication
      await tx.knowledgeSharingApplication.create({
        data: {
          baseApplicationId: base.id,
          requestType: body.requestType,
          programType: body.programType ?? null,
          programTypeAr: body.programTypeAr ?? null,
          programName: body.programName ?? null,
          programNameAr: body.programNameAr ?? null,
          sessionDate: body.sessionDate ? new Date(body.sessionDate) : null,
          sessionDates: body.sessionDates ? JSON.stringify(body.sessionDates) : null,
          numberOfAttendees: body.numberOfAttendees ? parseInt(body.numberOfAttendees, 10) : null,
          attendeeDetails: body.attendeeDetails ?? null,
          queryText: body.queryText ?? null,
          attachmentName: body.attachmentName ?? null,
        },
      })

      return base
    })

    // 3. Log activity (outside transaction — non-critical)
    const actionText = body.requestType === 'CALENDAR_BOOKING'
      ? `Calendar booking submitted for ${body.programName || 'a program'}`
      : `Training query submitted${body.programName ? ` regarding ${body.programName}` : ''}`

    await logActivity(
      result.id,
      'KNOWLEDGE_SHARING',
      actionText,
      body.companyName
    )

    return NextResponse.json(
      { success: true, applicationId: result.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating knowledge sharing application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create application' },
      { status: 500 }
    )
  }
}
