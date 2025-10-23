const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearAllServers() {
  try {
    const result = await prisma.pterodactylServer.deleteMany({})
    console.log(`🧹 Cleared ${result.count} servers`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearAllServers()