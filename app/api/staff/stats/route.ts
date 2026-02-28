import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [totalOpen, pendingReview, resolvedToday, avgResolution, countsByService, oldestPending] = await Promise.all([
      // Total open applications (not CLOSED, not REJECTED, not APPROVED)
      prisma.baseApplication.count({
        where: {
          status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'PENDING_INFO'] },
        },
      }),

      // Pending review (SUBMITTED or UNDER_REVIEW)
      prisma.baseApplication.count({
        where: {
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        },
      }),

      // Resolved today
      prisma.baseApplication.count({
        where: {
          reviewedAt: { gte: todayStart },
          status: { in: ['APPROVED', 'REJECTED', 'CLOSED'] },
        },
      }),

      // Average resolution time (last 30 days)
      prisma.baseApplication.findMany({
        where: {
          reviewedAt: { gte: thirtyDaysAgo },
          status: { in: ['APPROVED', 'REJECTED', 'CLOSED'] },
        },
        select: {
          submittedAt: true,
          reviewedAt: true,
        },
      }),

      // Per-service total counts (single query)
      prisma.baseApplication.groupBy({
        by: ['serviceType'],
        _count: { _all: true },
      }),

      // Oldest pending application per service (for SLA dot)
      prisma.baseApplication.groupBy({
        by: ['serviceType'],
        where: {
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        },
        _min: { submittedAt: true },
      }),
    ])

    let avgResolutionDays = 0
    if (avgResolution.length > 0) {
      const totalDays = avgResolution.reduce((sum, app) => {
        if (!app.reviewedAt) return sum
        const diff = app.reviewedAt.getTime() - app.submittedAt.getTime()
        return sum + diff / (1000 * 60 * 60 * 24)
      }, 0)
      avgResolutionDays = Math.round((totalDays / avgResolution.length) * 10) / 10
    }

    // Build serviceCounts map: { SERVICE_TYPE: { total, oldestPendingDays } }
    const serviceCounts: Record<string, { total: number; oldestPendingDays: number }> = {}
    for (const row of countsByService) {
      serviceCounts[row.serviceType] = { total: row._count._all, oldestPendingDays: 0 }
    }
    for (const row of oldestPending) {
      if (row._min.submittedAt) {
        const days = Math.floor((now.getTime() - row._min.submittedAt.getTime()) / (1000 * 60 * 60 * 24))
        if (serviceCounts[row.serviceType]) {
          serviceCounts[row.serviceType].oldestPendingDays = days
        } else {
          serviceCounts[row.serviceType] = { total: 0, oldestPendingDays: days }
        }
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalOpen,
        pendingReview,
        resolvedToday,
        avgResolutionDays,
      },
      serviceCounts,
    })
  } catch (error) {
    console.error('Error fetching staff stats:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
  }
}
