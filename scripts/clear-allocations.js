const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearAllocationIPs() {
  try {
    console.log('🔄 Clearing old allocation IP data...')
    
    // Update all servers to clear allocation IP and Port
    const result = await prisma.pterodactylServer.updateMany({
      where: {
        OR: [
          { allocationIp: { contains: '192.168.' } },
          { allocationIp: { contains: '10.' } },
          { allocationIp: { contains: '172.' } },
          { allocationIp: '127.0.0.1' }
        ]
      },
      data: {
        allocationIp: null,
        allocationPort: null,
        allocationAlias: null
      }
    })
    
    console.log(`✅ Cleared allocation data for ${result.count} servers`)
    
    // Show current servers
    const servers = await prisma.pterodactylServer.findMany({
      select: {
        id: true,
        name: true,
        identifier: true,
        allocationIp: true,
        allocationPort: true,
        pteroId: true
      }
    })
    
    console.log('\n📊 Current servers in database:')
    servers.forEach(server => {
      console.log(`  - ${server.name} (${server.identifier}): IP=${server.allocationIp || 'NULL'}, Port=${server.allocationPort || 'NULL'}, PteroID=${server.pteroId}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearAllocationIPs()