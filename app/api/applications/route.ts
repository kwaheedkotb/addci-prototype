import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'

// Legacy GET — reads from Application model (deprecated, kept for backward compat)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where = status && status !== 'all' ? { status } : {}

    const applications = await prisma.application.findMany({
      where,
      include: {
        reviewNotes: {
          orderBy: { createdAt: 'desc' },
        },
        certificate: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
    })

    return NextResponse.json({ success: true, applications })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// POST — writes to BaseApplication + EsgApplication (unified staff portal model)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Create BaseApplication record
    const base = await prisma.baseApplication.create({
      data: {
        serviceType: 'ESG_LABEL',
        status: 'SUBMITTED',
        submittedBy: body.organizationName || body.applicantName,
        submittedByEmail: body.email,
        memberTier: body.memberTier ?? 'Standard',
      },
    })

    // 2. Create linked EsgApplication with ESG-specific fields
    await prisma.esgApplication.create({
      data: {
        baseApplicationId: base.id,
        phoneNumber: body.phoneNumber ?? null,
        tradeLicenseNumber: body.tradeLicenseNumber ?? null,
        subSector: body.subSector ?? null,
        country: body.country ?? null,
        environmentalProfile: body.environmentalProfile ?? null,
        socialProfile: body.socialProfile ?? null,
        governanceProfile: body.governanceProfile ?? null,
        eoiSubmittedAt: new Date(),
      },
    })

    // 3. Log activity
    await logActivity(
      base.id,
      'ESG_LABEL',
      'Application submitted for ESG certification review',
      body.organizationName || body.applicantName || 'Member'
    )

    return NextResponse.json({ success: true, applicationId: base.id, application: { id: base.id } })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create application' },
      { status: 500 }
    )
  }
}
