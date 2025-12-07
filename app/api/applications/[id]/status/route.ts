import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateCertificateNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ESG-${year}-${random}`
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, note } = body

    // Start with updating the application status
    const updateData: {
      status: string
      reviewNotes?: { create: { authorType: string; note: string } }
      certificate?: { create: { certificateNumber: string } }
    } = {
      status,
    }

    // Add a system note if provided
    if (note) {
      updateData.reviewNotes = {
        create: {
          authorType: 'STAFF',
          note,
        },
      }
    }

    // If approving, create a certificate
    if (status === 'APPROVED') {
      updateData.certificate = {
        create: {
          certificateNumber: generateCertificateNumber(),
        },
      }
    }

    const application = await prisma.application.update({
      where: { id },
      data: updateData,
      include: {
        reviewNotes: {
          orderBy: { createdAt: 'asc' },
        },
        certificate: true,
      },
    })

    return NextResponse.json({
      success: true,
      application,
      certificateNumber: application.certificate?.certificateNumber,
    })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
