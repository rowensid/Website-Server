const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testServerCreation() {
  try {
    console.log('🧪 Testing server creation...')
    
    const testServer = {
      pteroId: 'test123',
      identifier: 'test-server',
      name: 'Test Server',
      description: 'Test Description',
      status: 'offline',
      suspended: false,
      limits: { memory: 4096, disk: 50000, cpu: 100 },
      featureLimits: { databases: 2, allocations: 5, backups: 1 },
      nodeId: '1',
      allocationId: '1',
      allocationIp: '103.123.100.101',
      allocationPort: 30120,
      allocationAlias: null,
      nestId: '5',
      eggId: '15',
      container: { environment: { TEST: 'value' } },
      userId: null,
      cpuUsage: 0,
      memoryUsage: 0,
      memoryLimit: 0,
      diskUsage: 0,
      diskLimit: 0,
      networkRx: 0,
      networkTx: 0,
      uptime: 0
    }
    
    const server = await prisma.pterodactylServer.create({
      data: testServer
    })
    
    console.log('✅ Test server created:', server.name)
    
    // Clean up
    await prisma.pterodactylServer.delete({
      where: { identifier: 'test-server' }
    })
    
    console.log('🧹 Test server cleaned up')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testServerCreation()