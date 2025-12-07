import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')
    const department = searchParams.get('department')
    const search = searchParams.get('search')

    // Build where clause
    const where: Record<string, unknown> = {}

    if (platform) {
      where.platform = platform
    }

    if (department) {
      where.dept = department
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { nameAr: { contains: search } },
        { description: { contains: search } },
        { descriptionAr: { contains: search } },
      ]
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    // Get unique departments and platforms for filters
    const allServices = await prisma.service.findMany({
      select: { dept: true, platform: true },
    })

    const departments = [...new Set(allServices.map(s => s.dept))].sort()
    const platforms = [...new Set(allServices.map(s => s.platform))].sort()

    return NextResponse.json({
      services,
      filters: { departments, platforms },
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}
