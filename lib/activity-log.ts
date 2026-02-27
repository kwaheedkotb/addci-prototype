import prisma from '@/lib/prisma'
import { ServiceType } from '@prisma/client'

export async function logActivity(
  applicationId: string,
  serviceType: ServiceType,
  action: string,
  performedBy: string,
  notes?: string
) {
  return prisma.activityLog.create({
    data: {
      applicationId,
      serviceType,
      action,
      performedBy,
      notes: notes ?? null,
    },
  })
}
