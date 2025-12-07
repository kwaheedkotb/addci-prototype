import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicantName, organizationName, email, sector, description, aiPrecheckResult } = body

    const application = await prisma.application.create({
      data: {
        applicantName,
        organizationName,
        email,
        sector,
        description,
        aiPrecheckResult,
        status: 'SUBMITTED',
        reviewNotes: {
          create: {
            authorType: 'SYSTEM',
            note: 'Application submitted for ESG certification review.',
          },
        },
      },
      include: {
        reviewNotes: true,
      },
    })

    return NextResponse.json({ success: true, application })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create application' },
      { status: 500 }
    )
  }
}
