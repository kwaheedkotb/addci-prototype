import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'
import { StaffApplicationStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const application = await prisma.baseApplication.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, name: true, nameAr: true },
        },
        activityLogs: {
          orderBy: { performedAt: 'desc' },
          take: 50,
        },
        esgApplication: true,
        knowledgeSharingApplication: true,
      },
    })

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, application })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch application' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Fetch current application
    const current = await prisma.baseApplication.findUnique({ where: { id } })
    if (!current) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 })
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    const actions: string[] = []

    if (body.status && body.status !== current.status) {
      updateData.status = body.status as StaffApplicationStatus
      actions.push(`Status changed from ${current.status} to ${body.status}`)

      // Set reviewedAt if moving to a terminal status
      const terminalStatuses = ['APPROVED', 'REJECTED', 'CLOSED']
      if (terminalStatuses.includes(body.status) && !current.reviewedAt) {
        updateData.reviewedAt = new Date()
        updateData.reviewedBy = body.performedBy || 'Staff'
      }
    }

    if (body.assignedToId !== undefined && body.assignedToId !== current.assignedToId) {
      updateData.assignedToId = body.assignedToId || null
      if (body.assignedToId) {
        const staff = await prisma.staffUser.findUnique({ where: { id: body.assignedToId }, select: { name: true } })
        actions.push(`Assigned to ${staff?.name || body.assignedToId}`)
      } else {
        actions.push('Unassigned from reviewer')
      }
    }

    if (body.internalNotes !== undefined) {
      updateData.internalNotes = body.internalNotes
    }

    if (body.rejectionReason !== undefined) {
      updateData.rejectionReason = body.rejectionReason
    }

    // Handle KnowledgeSharingApplication nested updates
    const ksFields: Record<string, unknown> = {}
    if (body.responseText !== undefined) ksFields.responseText = body.responseText
    if (body.responseAttachmentUrl !== undefined) ksFields.responseAttachmentUrl = body.responseAttachmentUrl
    if (body.responseAttachmentName !== undefined) ksFields.responseAttachmentName = body.responseAttachmentName
    if (body.respondedAt !== undefined) ksFields.respondedAt = new Date(body.respondedAt)
    if (body.respondedBy !== undefined) ksFields.respondedBy = body.respondedBy
    if (body.surveySentAt !== undefined) ksFields.surveySentAt = new Date(body.surveySentAt)

    if (Object.keys(ksFields).length > 0 && current.serviceType === 'KNOWLEDGE_SHARING') {
      updateData.knowledgeSharingApplication = { update: ksFields }
    }

    // Update application
    const updated = await prisma.baseApplication.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: { id: true, name: true, nameAr: true },
        },
        activityLogs: {
          orderBy: { performedAt: 'desc' },
          take: 50,
        },
        esgApplication: true,
        knowledgeSharingApplication: true,
      },
    })

    // Write activity log entries
    for (const action of actions) {
      await logActivity(id, current.serviceType, action, body.performedBy || 'Staff')
    }

    return NextResponse.json({ success: true, application: updated })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ success: false, error: 'Failed to update application' }, { status: 500 })
  }
}
