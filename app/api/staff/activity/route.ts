import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '15', 10)
    const skip = (page - 1) * pageSize

    const [entries, totalCount] = await Promise.all([
      prisma.activityLog.findMany({
        orderBy: { performedAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          application: {
            select: {
              id: true,
              serviceType: true,
              submittedBy: true,
            },
          },
        },
      }),
      prisma.activityLog.count(),
    ])

    return NextResponse.json({
      success: true,
      entries,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    })
  } catch (error) {
    console.error('Error fetching activity log:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch activity log' }, { status: 500 })
  }
}
