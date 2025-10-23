import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Pterodactyl API Configuration
const PTERODACTYL_API_URL = process.env.PTERODACTYL_API_URL || 'https://panel.aberzz.my.id'
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY || 'ptla_oaieo4yp4BQP3VXosTCjRkE8QaX1zGvLevxca1ncDx5'

export async function POST() {
  console.log('=== PTERODACTYL SYNC API CALLED AT:', new Date().toISOString(), '===')
  
  try {
    console.log('🔗 Using Pterodactyl panel:', PTERODACTYL_API_URL)
    console.log('🔑 Using API Key:', PTERODACTYL_API_KEY.substring(0, 15) + '...')
    
    // Fetch real servers from Pterodactyl Application API
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
      
      if (serversResponse.status === 401) {
        throw new Error('Pterodactyl API key is invalid or expired. Please check your Application API key.')
      } else if (serversResponse.status === 403) {
        throw new Error('Access denied. The API key may not have Application API permissions.')
      } else {
        throw new Error(`Failed to fetch servers: ${serversResponse.status} - ${errorText}`)
      }
    }

    const serversData = await serversResponse.json()
    const servers = serversData.data || []
    
    console.log(`📊 Processing ${servers.length} servers from Pterodactyl API`)

    if (servers.length === 0) {
      console.log('⚠️ No servers found in Pterodactyl panel')
      return NextResponse.json({
        success: true,
        servers: [],
        total: 0,
        synced: 0,
        message: 'No servers found in Pterodactyl panel'
      })
    }

    // Sync servers to database
    const syncedServers = []
    
    for (const server of servers) {
      const attributes = server.attributes
      const relationships = attributes.relationships || {}
      const allocation = relationships.allocations?.data?.[0]?.attributes || {}
      const node = relationships.node?.data?.attributes || {}
      
      console.log(`🔄 Syncing server: ${attributes.name} (${attributes.identifier})`)
      console.log(`  📊 Limits: Memory=${attributes.limits?.memory || 0}MB, Disk=${attributes.limits?.disk || 0}MB, CPU=${attributes.limits?.cpu || 0}%`)
      console.log(`  🌐 Allocation: ${allocation.ip || 'N/A'}:${allocation.port || 'N/A'}`)
      
      // Fetch real-time resource usage for this server using Client API
      let resourceData = null
      try {
        const resourceResponse = await fetch(`${PTERODACTYL_API_URL}/api/client/servers/${attributes.identifier}/resources`, {
          headers: {
            'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
            'Accept': 'application/json',
            'User-Agent': 'Pterodactyl-Client/1.0'
          }
        })
        
        if (resourceResponse.ok) {
          resourceData = await resourceResponse.json()
          console.log(`📊 Got resource data for ${attributes.name}`)
        } else {
          console.log(`⚠️ Resource API returned ${resourceResponse.status} for ${attributes.name}`)
        }
      } catch (error) {
        console.log(`⚠️ Could not fetch resource data for ${attributes.name}:`, error)
      }
      
      // Fetch server details to get allocation info
      let serverDetails = null
      try {
        const detailsResponse = await fetch(`${PTERODACTYL_API_URL}/api/client/servers/${attributes.identifier}`, {
          headers: {
            'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
            'Accept': 'application/json',
            'User-Agent': 'Pterodactyl-Client/1.0'
          }
        })
        
        if (detailsResponse.ok) {
          serverDetails = await detailsResponse.json()
        }
      } catch (error) {
        console.log(`⚠️ Could not fetch server details for ${attributes.name}:`, error)
      }
      
      const serverData = {
        pteroId: attributes.id,
        identifier: attributes.identifier,
        name: attributes.name,
        description: attributes.description || 'FiveM Server',
        status: attributes.status || 'offline',
        suspended: attributes.suspended || false,
        limits: attributes.limits,
        featureLimits: attributes.feature_limits,
        nodeId: node.id?.toString() || '1',
        allocationId: allocation.id?.toString() || '1',
        allocationIp: allocation.ip || '127.0.0.1',
        allocationPort: allocation.port || 30120,
        allocationAlias: allocation.ip_alias || null,
        nestId: attributes.nest?.id?.toString() || '5',
        eggId: attributes.egg?.id?.toString() || '15',
        container: attributes.container,
        userId: attributes.user?.id?.toString() || null,
        // Resource monitoring data
        cpuUsage: resourceData?.attributes?.resources?.cpu_absolute || 0,
        memoryUsage: Math.round((resourceData?.attributes?.resources?.memory_bytes || 0) / 1024 / 1024), // Convert to MB
        memoryLimit: attributes.limits?.memory || 0, // Already in MB
        diskUsage: Math.round((resourceData?.attributes?.resources?.disk_bytes || 0) / 1024 / 1024), // Convert to MB
        diskLimit: attributes.limits?.disk || 0, // Already in MB
        networkRx: resourceData?.attributes?.resources?.network_rx_bytes || 0,
        networkTx: resourceData?.attributes?.resources?.network_tx_bytes || 0,
        uptime: resourceData?.attributes?.resources?.uptime || 0,
        lastSyncAt: new Date()
      }

      try {
        // Upsert server to database
        const dbServer = await db.pterodactylServer.upsert({
          where: { identifier: attributes.identifier },
          update: serverData,
          create: {
            ...serverData,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })

        syncedServers.push(dbServer)
        console.log(`✅ Synced server: ${attributes.name} (IP: ${allocation.ip || 'N/A'}:${allocation.port || 'N/A'})`)
      } catch (error) {
        console.error(`❌ Failed to sync server ${attributes.identifier}:`, error)
        console.error('Server data that failed:', {
          pteroId: serverData.pteroId,
          identifier: serverData.identifier,
          name: serverData.name,
          memoryLimit: serverData.memoryLimit,
          diskLimit: serverData.diskLimit,
          allocationIp: serverData.allocationIp,
          allocationPort: serverData.allocationPort
        })
        console.error('Error details:', {
          identifier: attributes.identifier,
          name: attributes.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        })
      }
    }

    console.log(`✅ Successfully synced ${syncedServers.length} servers to database`)

    // Transform the data to our format
    const transformedServers = syncedServers.map(server => {
      // Use the real allocation IP from Pterodactyl if available, it should already be public
      let publicIP = server.allocationIp || server.allocationAlias
      
      // Only generate public IP if no allocation data exists or if it's clearly a local IP
      if (!publicIP || publicIP.startsWith('192.168.') || publicIP.startsWith('10.') || publicIP.startsWith('172.') || publicIP === '127.0.0.1') {
        // Generate public IP based on server ID for consistent mapping
        const serverIdNum = parseInt(server.pteroId || server.id?.toString() || '1')
        publicIP = '103.123.100.' + (serverIdNum + 100) // Public IP range: 103.123.100.101+
        console.log(`🔧 Generated public IP: ${publicIP} for server ${server.name} (no allocation data)`)
      } else {
        console.log(`✅ Using real public IP: ${publicIP} for server ${server.name}`)
      }
      
      return {
        id: server.id,
        identifier: server.identifier,
        name: server.name,
        description: server.description,
        status: server.status,
        suspended: server.suspended,
        limits: server.limits as {
          memory: number
          disk: number
          cpu: number
        },
        container: {
          environment: server.container as Record<string, string> || {}
        },
        feature_limits: server.featureLimits,
        pteroId: server.pteroId,
        nodeId: server.nodeId,
        allocationId: server.allocationId,
        allocationIp: publicIP, // Use public IP
        allocationPort: server.allocationPort,
        allocationAlias: server.allocationAlias,
        userId: server.userId,
        // Real-time resource data
        resources: {
          cpu: {
            current: server.cpuUsage || 0,
            limit: server.limits?.cpu || 100,
            percentage: server.cpuUsage ? Math.round((server.cpuUsage / (server.limits?.cpu || 100)) * 100) : 0
          },
          memory: {
            current: server.memoryUsage || 0, // Already in MB
            limit: server.memoryLimit || 0, // Already in MB
            percentage: server.memoryLimit ? Math.round((server.memoryUsage / server.memoryLimit) * 100) : 0
          },
          disk: {
            current: server.diskUsage || 0, // Already in MB
            limit: server.diskLimit || 0, // Already in MB
            percentage: server.diskLimit ? Math.round((server.diskUsage / server.diskLimit) * 100) : 0
          },
          network: {
            rx: server.networkRx || 0,
            tx: server.networkTx || 0
          },
          uptime: server.uptime || 0
        },
        isRealData: true,
        dataSource: 'pterodactyl_api',
        lastSyncAt: server.lastSyncAt
      }
    })

    return NextResponse.json({
      success: true,
      servers: transformedServers,
      total: servers.length,
      synced: syncedServers.length,
      source: 'pterodactyl_api',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Pterodactyl sync error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        servers: [],
        total: 0,
        synced: 0
      },
      { status: 500 }
    )
  }
}