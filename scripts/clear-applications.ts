import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== BEFORE CLEAR ===')

  const [
    activityLogs,
    knowledgeSharingApps,
    esgApps,
    baseApps,
    certificates,
    reviewNotes,
    applicationDocs,
    legacyApps,
  ] = await Promise.all([
    prisma.activityLog.count(),
    prisma.knowledgeSharingApplication.count(),
    prisma.esgApplication.count(),
    prisma.baseApplication.count(),
    prisma.certificate.count(),
    prisma.reviewNote.count(),
    prisma.applicationDocument.count(),
    prisma.application.count(),
  ])

  console.log(`  ActivityLog:                  ${activityLogs}`)
  console.log(`  KnowledgeSharingApplication:  ${knowledgeSharingApps}`)
  console.log(`  EsgApplication:               ${esgApps}`)
  console.log(`  BaseApplication:              ${baseApps}`)
  console.log(`  Certificate:                  ${certificates}`)
  console.log(`  ReviewNote:                   ${reviewNotes}`)
  console.log(`  ApplicationDocument:          ${applicationDocs}`)
  console.log(`  Application (legacy):         ${legacyApps}`)

  console.log('\nClearing all application data...')

  // Delete in dependency order (children first)
  await prisma.activityLog.deleteMany()
  await prisma.knowledgeSharingApplication.deleteMany()
  await prisma.esgApplication.deleteMany()
  await prisma.baseApplication.deleteMany()
  await prisma.certificate.deleteMany()
  await prisma.reviewNote.deleteMany()
  await prisma.applicationDocument.deleteMany()
  await prisma.application.deleteMany()

  console.log('\n=== AFTER CLEAR ===')

  const [
    activityLogs2,
    knowledgeSharingApps2,
    esgApps2,
    baseApps2,
    certificates2,
    reviewNotes2,
    applicationDocs2,
    legacyApps2,
  ] = await Promise.all([
    prisma.activityLog.count(),
    prisma.knowledgeSharingApplication.count(),
    prisma.esgApplication.count(),
    prisma.baseApplication.count(),
    prisma.certificate.count(),
    prisma.reviewNote.count(),
    prisma.applicationDocument.count(),
    prisma.application.count(),
  ])

  console.log(`  ActivityLog:                  ${activityLogs2}`)
  console.log(`  KnowledgeSharingApplication:  ${knowledgeSharingApps2}`)
  console.log(`  EsgApplication:               ${esgApps2}`)
  console.log(`  BaseApplication:              ${baseApps2}`)
  console.log(`  Certificate:                  ${certificates2}`)
  console.log(`  ReviewNote:                   ${reviewNotes2}`)
  console.log(`  ApplicationDocument:          ${applicationDocs2}`)
  console.log(`  Application (legacy):         ${legacyApps2}`)

  console.log('\nAll application data cleared successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
