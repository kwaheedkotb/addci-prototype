/**
 * One-time migration script: Application → BaseApplication + EsgApplication
 *
 * Reads all records from the legacy Application table and creates
 * corresponding BaseApplication + EsgApplication pairs in the new
 * unified staff portal model.
 *
 * Usage:
 *   export $(grep -v '^#' .env.local | grep -v '^$' | xargs) && npx tsx scripts/migrate-esg-applications.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Map legacy Application.status to StaffApplicationStatus enum
function mapStatus(legacyStatus: string): 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PENDING_INFO' | 'CLOSED' {
  switch (legacyStatus) {
    case 'SUBMITTED':
      return 'SUBMITTED'
    case 'UNDER_REVIEW':
      return 'UNDER_REVIEW'
    case 'APPROVED':
      return 'APPROVED'
    case 'REJECTED':
      return 'REJECTED'
    case 'CORRECTIONS_REQUESTED':
      return 'PENDING_INFO'
    default:
      return 'SUBMITTED'
  }
}

async function main() {
  console.log('Starting ESG Application migration...\n')

  const legacyApps = await prisma.application.findMany({
    include: {
      reviewNotes: true,
      certificate: true,
    },
  })

  console.log(`Found ${legacyApps.length} legacy Application records\n`)

  let migrated = 0
  let skipped = 0

  for (const app of legacyApps) {
    // Check for duplicate: same email + ESG_LABEL already in BaseApplication
    const existing = await prisma.baseApplication.findFirst({
      where: {
        submittedByEmail: app.email,
        serviceType: 'ESG_LABEL',
      },
    })

    if (existing) {
      console.log(`SKIP: ${app.organizationName} (${app.email}) — already exists as BaseApplication ${existing.id}`)
      skipped++
      continue
    }

    // Create BaseApplication
    const base = await prisma.baseApplication.create({
      data: {
        serviceType: 'ESG_LABEL',
        status: mapStatus(app.status),
        submittedBy: app.organizationName || app.applicantName,
        submittedByEmail: app.email,
        memberTier: 'Standard',
        submittedAt: app.createdAt,
        reviewedAt: ['APPROVED', 'REJECTED'].includes(app.status) ? app.updatedAt : null,
        reviewedBy: ['APPROVED', 'REJECTED'].includes(app.status) ? 'Staff (migrated)' : null,
        internalNotes: app.aiPrecheckResult ?? null,
      },
    })

    // Create EsgApplication
    await prisma.esgApplication.create({
      data: {
        baseApplicationId: base.id,
        phoneNumber: app.phoneNumber,
        tradeLicenseNumber: app.tradeLicenseNumber,
        subSector: app.subSector,
        country: app.country,
        environmentalProfile: app.environmentalProfile,
        socialProfile: app.socialProfile,
        governanceProfile: app.governanceProfile,
        eoiSubmittedAt: app.createdAt,
      },
    })

    // Create activity log entry for the migration
    await prisma.activityLog.create({
      data: {
        applicationId: base.id,
        serviceType: 'ESG_LABEL',
        action: `Migrated from legacy Application ${app.id}`,
        performedBy: 'System (migration)',
      },
    })

    migrated++
    console.log(`MIGRATED: ${app.organizationName} (${app.email}) — legacy ${app.id} → BaseApplication ${base.id} [${app.status} → ${mapStatus(app.status)}]`)
  }

  console.log(`\n--- Migration complete ---`)
  console.log(`Total legacy records: ${legacyApps.length}`)
  console.log(`Migrated: ${migrated}`)
  console.log(`Skipped (duplicate): ${skipped}`)

  // Verify
  const baseCount = await prisma.baseApplication.count({ where: { serviceType: 'ESG_LABEL' } })
  const esgCount = await prisma.esgApplication.count()
  console.log(`\nVerification:`)
  console.log(`  BaseApplication (ESG_LABEL): ${baseCount}`)
  console.log(`  EsgApplication: ${esgCount}`)
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
