const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function showServers() {
  try {
    const servers = await prisma.pterodactylServer.findMany({
      select: {
        id: true,
        name: true,
        identifier: true,
        allocationIp: true,
        allocationPort: true,
        pteroId: true,
        status: true
      }
    })
    
    console.log(`📊 Found ${servers.length} servers in database:`)
    servers.forEach(server => {
      console.log(`  - ${server.name} (${server.identifier}): IP=${server.allocationIp || 'NULL'}, Port=${server.allocationPort || 'NULL'}, PteroID=${server.pteroId}, Status=${server.status}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

showServers()