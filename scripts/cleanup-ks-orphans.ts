import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const orphans = await prisma.baseApplication.findMany({
    where: { serviceType: 'KNOWLEDGE_SHARING' },
    include: { knowledgeSharingApplication: true },
  })

  const orphanIds: string[] = []
  for (const o of orphans) {
    if (o.knowledgeSharingApplication === null) {
      orphanIds.push(o.id)
    }
  }

  console.log('Orphaned KS BaseApplications to delete:', orphanIds.length)
  if (orphanIds.length > 0) {
    await prisma.baseApplication.deleteMany({ where: { id: { in: orphanIds } } })
    console.log('Deleted', orphanIds.length, 'orphaned records')
  }

  const remaining = await prisma.baseApplication.count({ where: { serviceType: 'KNOWLEDGE_SHARING' } })
  console.log('Remaining KS BaseApplications:', remaining)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
