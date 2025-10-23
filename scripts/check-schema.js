const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSchema() {
  try {
    // Try to query a server to see what fields exist
    const result = await prisma.pterodactylServer.findFirst()
    if (result) {
      console.log('Fields in database:', Object.keys(result))
    } else {
      console.log('No servers in database, checking model...')
      // Let's check the Prisma model
      const model = prisma.pterodactylServer
      console.log('Model fields:', Object.getOwnPropertyNames(model))
    }
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkSchema()