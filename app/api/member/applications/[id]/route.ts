import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Try BaseApplication first (new model)
    const baseApp = await prisma.baseApplication.findUnique({
      where: { id },
      include: {
        esgApplication: true,
        knowledgeSharingApplication: true,
        activityLogs: {
          orderBy: { performedAt: 'desc' },
          take: 50,
        },
      },
    })

    if (baseApp) {
      // Filter out internal-only activity logs
      const filteredLogs = (baseApp.activityLogs || []).filter(
        log => !log.action.toLowerCase().includes('internal')
      )

      return NextResponse.json({
        success: true,
        application: {
          id: baseApp.id,
          serviceType: baseApp.serviceType,
          status: baseApp.status,
          submittedBy: baseApp.submittedBy,
          submittedByEmail: baseApp.submittedByEmail,
          memberTier: baseApp.memberTier,
          submittedAt: baseApp.submittedAt.toISOString(),
          updatedAt: baseApp.updatedAt.toISOString(),
          reviewedAt: baseApp.reviewedAt?.toISOString() || null,
          rejectionReason: baseApp.rejectionReason,
          esgApplication: baseApp.esgApplication,
          knowledgeSharingApplication: baseApp.knowledgeSharingApplication,
          activityLogs: filteredLogs.map(log => ({
            id: log.id,
            action: log.action,
            performedBy: log.performedBy,
            performedAt: log.performedAt.toISOString(),
          })),
          isLegacy: false,
        },
      })
    }

    // Fall back to legacy Application model
    const legacyApp = await prisma.application.findUnique({
      where: { id },
      include: {
        reviewNotes: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        certificate: true,
      },
    })

    if (legacyApp) {
      // Filter out internal notes
      const filteredNotes = (legacyApp.reviewNotes || []).filter(
        note => !note.note.toLowerCase().includes('internal')
      )

      return NextResponse.json({
        success: true,
        application: {
          id: legacyApp.id,
          serviceType: 'ESG_LABEL',
          status: legacyApp.status,
          submittedBy: legacyApp.organizationName,
          submittedByEmail: legacyApp.email,
          memberTier: 'Standard',
          submittedAt: legacyApp.createdAt.toISOString(),
          updatedAt: legacyApp.updatedAt.toISOString(),
          reviewedAt: null,
          rejectionReason: null,
          esgApplication: {
            subSector: legacyApp.subSector,
            country: legacyApp.country,
            phoneNumber: legacyApp.phoneNumber,
            tradeLicenseNumber: legacyApp.tradeLicenseNumber,
            environmentalProfile: legacyApp.environmentalProfile,
            socialProfile: legacyApp.socialProfile,
            governanceProfile: legacyApp.governanceProfile,
          },
          knowledgeSharingApplication: null,
          certificate: legacyApp.certificate
            ? {
                certificateNumber: legacyApp.certificate.certificateNumber,
                issuedAt: legacyApp.certificate.issuedAt.toISOString(),
                validUntil: legacyApp.certificate.validUntil?.toISOString() || null,
              }
            : null,
          activityLogs: filteredNotes.map(note => ({
            id: note.id,
            action: note.note,
            performedBy: note.authorType === 'SYSTEM' ? 'System' : 'Staff',
            performedAt: note.createdAt.toISOString(),
          })),
          isLegacy: true,
        },
      })
    }

    return NextResponse.json(
      { success: false, error: 'Application not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Error fetching member application detail:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}
