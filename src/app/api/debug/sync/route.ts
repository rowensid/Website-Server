import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Pterodactyl API Configuration
const PTERODACTYL_API_URL = process.env.PTERODACTYL_API_URL || 'https://panel.androwproject.cloud'
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY || 'ptla_oaieo4yp4BQP3VXosTCjRkE8QaX1zGvLevxca1ncDx5'

export async function GET() {
  console.log('=== DEBUG SYNC API ===')
  
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
        message: 'No servers found in Pterodactyl panel',
        servers: []
      })
    }

    // Process only first server for debugging
    const server = servers[0]
    const attributes = server.attributes
    const relationships = attributes.relationships || {}
    const allocation = relationships.allocations?.data?.[0]?.attributes || {}
    const node = relationships.node?.data?.attributes || {}
    
    console.log(`🔄 Syncing server: ${attributes.name} (${attributes.identifier})`)
    console.log(`  📊 Limits: Memory=${attributes.limits?.memory || 0}MB, Disk=${attributes.limits?.disk || 0}MB, CPU=${attributes.limits?.cpu || 0}%`)
    console.log(`  🌐 Allocation: ${allocation.ip || 'N/A'}:${allocation.port || 'N/A'}`)
    
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
      // Resource monitoring data
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

    console.log('📝 Prepared server data:', {
      pteroId: serverData.pteroId,
      identifier: serverData.identifier,
      name: serverData.name,
      memoryLimit: serverData.memoryLimit,
      diskLimit: serverData.diskLimit,
      allocationIp: serverData.allocationIp,
      allocationPort: serverData.allocationPort
    })

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

      console.log(`✅ Synced server: ${attributes.name} (IP: ${allocation.ip || 'N/A'}:${allocation.port || 'N/A'})`)
      
      return NextResponse.json({
        success: true,
        message: 'Debug sync successful',
        server: {
          id: dbServer.id,
          name: dbServer.name,
          identifier: dbServer.identifier,
          allocationIp: dbServer.allocationIp,
          allocationPort: dbServer.allocationPort
        }
      })
      
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
      
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        serverData: serverData
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Debug sync API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}