import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Return staff list for assignment dropdown
    if (searchParams.get('staffList') === 'true') {
      const staffList = await prisma.staffUser.findMany({
        select: { id: true, name: true, nameAr: true },
        orderBy: { name: 'asc' },
      })
      return NextResponse.json({ success: true, staffList })
    }

    // Parse query params
    const serviceType = searchParams.get('serviceType') || ''
    const status = searchParams.get('status') || ''
    const assignedToId = searchParams.get('assignedToId') || ''
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
    const sortBy = searchParams.get('sortBy') || 'submittedAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    const skip = (page - 1) * pageSize

    // Build where clause
    const where: Prisma.BaseApplicationWhereInput = {}

    if (serviceType) {
      where.serviceType = serviceType as Prisma.EnumServiceTypeFilter
    }
    if (status) {
      where.status = status as Prisma.EnumStaffApplicationStatusFilter
    }
    if (assignedToId) {
      where.assignedToId = assignedToId
    }
    if (search) {
      where.OR = [
        { submittedBy: { contains: search, mode: 'insensitive' } },
        { submittedByEmail: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Build orderBy
    const validSortColumns = ['submittedAt', 'status', 'submittedBy', 'id']
    const orderByColumn = validSortColumns.includes(sortBy) ? sortBy : 'submittedAt'
    const orderBy = { [orderByColumn]: sortOrder }

    const [applications, totalCount] = await Promise.all([
      prisma.baseApplication.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          assignedTo: {
            select: { id: true, name: true, nameAr: true },
          },
          esgApplication: !serviceType || serviceType === 'ESG_LABEL',
          knowledgeSharingApplication: !serviceType || serviceType === 'KNOWLEDGE_SHARING',
          chamberBoostApplication: !serviceType || serviceType === 'CHAMBER_BOOST',
        },
      }),
      prisma.baseApplication.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      applications,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch applications' }, { status: 500 })
  }
}
