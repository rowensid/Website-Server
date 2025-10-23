const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createRealServer() {
  try {
    console.log('🔄 Creating real server from Pterodactyl data...')
    
    const serverData = {
      pteroId: '1',
      identifier: '99cbffc1',
      name: 'AMERTA ROLEPLAY V1.5',
      description: 'PAKET II FIVEM SERVER ROLEPLAY\'S',
      status: 'offline',
      suspended: false,
      limits: { memory: 4096, disk: 71680, cpu: 100 },
      featureLimits: { databases: 2, allocations: 5, backups: 1 },
      nodeId: '1',
      allocationId: '1',
      allocationIp: '103.42.116.70',
      allocationPort: 30111,
      allocationAlias: null,
      nestId: '5',
      eggId: '15',
      container: { environment: { MAX_PLAYERS: '32' } },
      userId: null,
      cpuUsage: 0,
      memoryUsage: 0,
      memoryLimit: 4096, // Use MB directly instead of bytes
      diskUsage: 0,
      diskLimit: 71680, // Use MB directly instead of bytes
      networkRx: 0,
      networkTx: 0,
      uptime: 0
    }
    
    const server = await prisma.pterodactylServer.upsert({
      where: { identifier: '99cbffc1' },
      update: serverData,
      create: {
        ...serverData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Server created/updated:', server.name)
    console.log('   IP:', server.allocationIp + ':' + server.allocationPort)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createRealServer()