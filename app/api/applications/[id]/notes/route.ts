import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { note, authorType = 'STAFF' } = body

    const reviewNote = await prisma.reviewNote.create({
      data: {
        applicationId: id,
        note,
        authorType,
      },
    })

    return NextResponse.json({ success: true, reviewNote })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create note' },
      { status: 500 }
    )
  }
}
