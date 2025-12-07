import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        reviewNotes: {
          orderBy: { createdAt: 'asc' },
        },
        certificate: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, application })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch application' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { description, aiPrecheckResult } = body

    const application = await prisma.application.update({
      where: { id },
      data: {
        description,
        aiPrecheckResult,
        status: 'SUBMITTED',
        reviewNotes: {
          create: {
            authorType: 'SYSTEM',
            note: 'Customer resubmitted application after corrections.',
          },
        },
      },
      include: {
        reviewNotes: {
          orderBy: { createdAt: 'asc' },
        },
        certificate: true,
      },
    })

    return NextResponse.json({ success: true, application })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
      { status: 500 }
    )
  }
}
