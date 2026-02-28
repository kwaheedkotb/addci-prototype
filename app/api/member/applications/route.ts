import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma, ServiceType, StaffApplicationStatus } from '@prisma/client'
import {
  getServiceMeta,
  getRequestSummary,
  MEMBER_STATUS_LABELS,
  SERVICE_CATEGORIES,
  getServiceTypesByDepartment,
} from '@/lib/service-metadata'

interface ApplicationRow {
  id: string
  applicationId: string
  serviceType: string
  serviceNameEn: string
  serviceNameAr: string
  department: string
  departmentAr: string
  category: string
  categoryAr: string
  status: string
  statusLabelEn: string
  statusLabelAr: string
  statusColor: string
  submittedAt: string
  updatedAt: string
  sla: string
  slaAr: string
  slaDays: number | null
  requestSummary: string
  requestSummaryAr: string
  isLegacy: boolean
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const email = searchParams.get('email') || ''
    const serviceTypeParam = searchParams.get('serviceType') || ''
    const statusParam = searchParams.get('status') || ''
    const departmentParam = searchParams.get('department') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const search = searchParams.get('search') || ''
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // ── Build BaseApplication where clause ─────────────────────────────────
    // In prototype mode, email is optional. When omitted, return all applications.
    const baseWhere: Prisma.BaseApplicationWhereInput = {}
    if (email) {
      baseWhere.submittedByEmail = email
    }

    // Service type filter (comma-separated)
    if (serviceTypeParam) {
      const types = serviceTypeParam.split(',').map(s => s.trim()).filter(Boolean) as ServiceType[]
      if (types.length === 1) {
        baseWhere.serviceType = types[0]
      } else if (types.length > 1) {
        baseWhere.serviceType = { in: types }
      }
    }

    // Status filter (comma-separated)
    if (statusParam) {
      const statuses = statusParam.split(',').map(s => s.trim()).filter(Boolean) as StaffApplicationStatus[]
      if (statuses.length === 1) {
        baseWhere.status = statuses[0]
      } else if (statuses.length > 1) {
        baseWhere.status = { in: statuses }
      }
    }

    // Department filter → map to serviceTypes in that department
    if (departmentParam) {
      const deptTypes = getServiceTypesByDepartment(departmentParam) as ServiceType[]
      if (deptTypes.length > 0) {
        // Merge with existing serviceType filter if present
        if (baseWhere.serviceType) {
          baseWhere.AND = [
            { serviceType: baseWhere.serviceType },
            { serviceType: { in: deptTypes } },
          ]
          delete baseWhere.serviceType
        } else {
          baseWhere.serviceType = { in: deptTypes }
        }
      }
    }

    // Date range
    if (dateFrom || dateTo) {
      const dateFilter: Prisma.DateTimeFilter = {}
      if (dateFrom) dateFilter.gte = new Date(dateFrom)
      if (dateTo) {
        const end = new Date(dateTo)
        end.setHours(23, 59, 59, 999)
        dateFilter.lte = end
      }
      baseWhere.submittedAt = dateFilter
    }

    // Search (submittedBy or id)
    if (search) {
      baseWhere.OR = [
        { submittedBy: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ]
    }

    // ── Sort ────────────────────────────────────────────────────────────────
    let orderBy: Prisma.BaseApplicationOrderByWithRelationInput
    switch (sort) {
      case 'oldest':
        orderBy = { submittedAt: 'asc' }
        break
      case 'status':
        orderBy = { status: 'asc' }
        break
      default:
        orderBy = { submittedAt: 'desc' }
    }

    // ── Fetch BaseApplications (paginated) ─────────────────────────────────
    const skip = (page - 1) * limit

    const [baseApps, baseCount] = await Promise.all([
      prisma.baseApplication.findMany({
        where: baseWhere,
        orderBy,
        skip,
        take: limit,
        include: {
          esgApplication: true,
          knowledgeSharingApplication: true,
        },
      }),
      prisma.baseApplication.count({ where: baseWhere }),
    ])

    // ── Fetch legacy Application records ────────────────────────────────────
    const legacyWhere = email ? { email } : {}
    const legacyApps = await prisma.application.findMany({
      where: legacyWhere,
      orderBy: { createdAt: 'desc' },
    })

    // ── Compute filterCounts (unfiltered, for the filter UI) ────────────────
    const filterCountsWhere: Prisma.BaseApplicationWhereInput = {}
    if (email) {
      filterCountsWhere.submittedByEmail = email
    }
    const allBaseApps = await prisma.baseApplication.findMany({
      where: filterCountsWhere,
      select: { serviceType: true, status: true },
    })

    const byService: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    const byDepartment: Record<string, number> = {}

    // Count BaseApplication records
    for (const app of allBaseApps) {
      byService[app.serviceType] = (byService[app.serviceType] || 0) + 1
      byStatus[app.status] = (byStatus[app.status] || 0) + 1
      const meta = getServiceMeta(app.serviceType)
      if (meta) {
        byDepartment[meta.department] = (byDepartment[meta.department] || 0) + 1
      }
    }

    // Count legacy records as ESG_LABEL
    if (legacyApps.length > 0) {
      byService['ESG_LABEL'] = (byService['ESG_LABEL'] || 0) + legacyApps.length
      const esgMeta = getServiceMeta('ESG_LABEL')
      if (esgMeta) {
        byDepartment[esgMeta.department] = (byDepartment[esgMeta.department] || 0) + legacyApps.length
      }
      for (const app of legacyApps) {
        // Map legacy status to new status
        const mappedStatus = app.status === 'CORRECTIONS_REQUESTED' ? 'PENDING_INFO' : app.status
        byStatus[mappedStatus] = (byStatus[mappedStatus] || 0) + 1
      }
    }

    // ── Map BaseApplications to ApplicationRow ──────────────────────────────
    const baseRows: ApplicationRow[] = baseApps.map(app => {
      const meta = getServiceMeta(app.serviceType)
      const statusMeta = MEMBER_STATUS_LABELS[app.status]
      const category = SERVICE_CATEGORIES[app.serviceType]
      const summary = getRequestSummary(app)

      return {
        id: app.id,
        applicationId: app.id.slice(0, 8) + '...',
        serviceType: app.serviceType,
        serviceNameEn: meta?.nameEn || app.serviceType.replace(/_/g, ' '),
        serviceNameAr: meta?.nameAr || app.serviceType.replace(/_/g, ' '),
        department: meta?.department || '',
        departmentAr: meta?.departmentAr || '',
        category: category?.en || '',
        categoryAr: category?.ar || '',
        status: app.status,
        statusLabelEn: statusMeta?.en || app.status,
        statusLabelAr: statusMeta?.ar || app.status,
        statusColor: statusMeta?.color || '',
        submittedAt: app.submittedAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        sla: meta?.sla || 'TBD',
        slaAr: meta?.slaAr || 'يُحدد لاحقاً',
        slaDays: meta?.slaDays ?? null,
        requestSummary: summary.en,
        requestSummaryAr: summary.ar,
        isLegacy: false,
      }
    })

    // ── Map legacy Applications to ApplicationRow ───────────────────────────
    // Only include legacy records that don't already exist in BaseApplication
    const baseIds = new Set(baseApps.map(a => a.id))
    const legacyRows: ApplicationRow[] = legacyApps
      .filter(app => !baseIds.has(app.id))
      .map(app => {
        const meta = getServiceMeta('ESG_LABEL')
        const mappedStatus = app.status === 'CORRECTIONS_REQUESTED' ? 'PENDING_INFO' : app.status
        const statusMeta = MEMBER_STATUS_LABELS[mappedStatus] || MEMBER_STATUS_LABELS[app.status]
        const category = SERVICE_CATEGORIES['ESG_LABEL']

        return {
          id: app.id,
          applicationId: app.id.slice(0, 8) + '...',
          serviceType: 'ESG_LABEL',
          serviceNameEn: meta?.nameEn || 'Chamber ESG Label',
          serviceNameAr: meta?.nameAr || 'ختم الاستدامة للغرفة',
          department: meta?.department || 'Business Connect & Services',
          departmentAr: meta?.departmentAr || 'ربط الأعمال والخدمات',
          category: category?.en || 'Certificates',
          categoryAr: category?.ar || 'الشهادات',
          status: app.status,
          statusLabelEn: statusMeta?.en || app.status,
          statusLabelAr: statusMeta?.ar || app.status,
          statusColor: statusMeta?.color || '',
          submittedAt: app.createdAt.toISOString(),
          updatedAt: app.updatedAt.toISOString(),
          sla: meta?.sla || 'TBD (multi-phase)',
          slaAr: meta?.slaAr || 'يُحدد لاحقاً (متعدد المراحل)',
          slaDays: meta?.slaDays ?? null,
          requestSummary: app.subSector
            ? `ESG Label Application — ${app.subSector}`
            : 'ESG Label Application',
          requestSummaryAr: app.subSector
            ? `طلب ختم الاستدامة — ${app.subSector}`
            : 'طلب ختم الاستدامة',
          isLegacy: true,
        }
      })

    // ── Merge & paginate ────────────────────────────────────────────────────
    // For the first page, append legacy rows after base rows if room
    // Legacy apps are shown at the end of the list
    const allRows = [...baseRows, ...legacyRows]
    const total = baseCount + legacyRows.length

    return NextResponse.json({
      success: true,
      applications: allRows.slice(0, limit),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      filterCounts: {
        byService,
        byStatus,
        byDepartment,
      },
    })
  } catch (error) {
    console.error('Error fetching member applications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}
