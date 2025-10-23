const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const PTERODACTYL_API_URL = 'https://panel.androwproject.cloud'
const PTERODACTYL_API_KEY = 'ptla_oaieo4yp4BQP3VXosTCjRkE8QaX1zGvLevxca1ncDx5'

async function debugSync() {
  try {
    console.log('=== DEBUG SYNC ===')
    
    // Fetch servers from Pterodactyl
    const serversResponse = await fetch(`${PTERODACTYL_API_URL}/api/application/servers?include=allocations,node`, {
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Pterodactyl-Client/1.0'
      }
    })

    if (!serversResponse.ok) {
      const errorText = await serversResponse.text()
      console.error('❌ Failed to fetch servers:', serversResponse.status, errorText)
      return
    }

    const serversData = await serversResponse.json()
    const servers = serversData.data || []
    
    console.log(`📊 Processing ${servers.length} servers from Pterodactyl API`)

    if (servers.length === 0) {
      console.log('⚠️ No servers found')
      return
    }

    // Process first server
    const server = servers[0]
    const attributes = server.attributes
    const relationships = attributes.relationships || {}
    const allocation = relationships.allocations?.data?.[0]?.attributes || {}
    const node = relationships.node?.data?.attributes || {}
    
    console.log('🔄 Processing server:', attributes.name)
    console.log('  PteroID:', attributes.id)
    console.log('  Identifier:', attributes.identifier)
    console.log('  Allocation IP:', allocation.ip)
    console.log('  Allocation Port:', allocation.port)
    
    const serverData = {
      pteroId: attributes.id.toString(),
      identifier: attributes.identifier,
      name: attributes.name,
      description: attributes.description || 'FiveM Server',
      status: attributes.status || 'offline',
      suspended: attributes.suspended || false,
      limits: attributes.limits,
      featureLimits: attributes.feature_limits,
      nodeId: node.id?.toString() || '1',
      allocationId: allocation.id?.toString() || '1',
      allocationIp: allocation.ip || null,
      allocationPort: allocation.port || null,
      allocationAlias: allocation.ip_alias || null,
      nestId: attributes.nest?.id?.toString() || '5',
      eggId: attributes.egg?.id?.toString() || '15',
      container: attributes.container,
      userId: attributes.user?.id?.toString() || null,
      cpuUsage: 0,
      memoryUsage: 0,
      memoryLimit: attributes.limits?.memory || 0,
      diskUsage: 0,
      diskLimit: attributes.limits?.disk || 0,
      networkRx: 0,
      networkTx: 0,
      uptime: 0,
      lastSyncAt: new Date()
    }
    
    console.log('📝 Server data prepared:')
    console.log('  Full limits object:', JSON.stringify(attributes.limits, null, 2))
    console.log('  Memory limit:', serverData.memoryLimit)
    console.log('  Disk limit:', serverData.diskLimit)
    
    try {
      const dbServer = await prisma.pterodactylServer.upsert({
        where: { identifier: attributes.identifier },
        update: serverData,
        create: {
          ...serverData,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      console.log('✅ Server synced successfully:', dbServer.name)
      console.log('  Database ID:', dbServer.id)
      console.log('  IP:', dbServer.allocationIp + ':' + dbServer.allocationPort)
      
    } catch (error) {
      console.error('❌ Failed to upsert server:', error.message)
      console.error('Error details:', error)
    }
    
  } catch (error) {
    console.error('❌ Debug sync error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugSync()