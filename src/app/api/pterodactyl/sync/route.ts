import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Mock Pterodactyl servers data
const mockServers = [
  {
    id: "1",
    identifier: "99cbffc1",
    name: "AMERTA ROLEPLAY V1.5",
    description: "PAKET II FIVEM SERVER ROLEPLAY'S",
    limits: { memory: 4096, disk: 71680, cpu: 100 },
    feature_limits: { databases: 1, allocations: 0, backups: 1 },
    container: {
      environment: {
        MAX_PLAYERS: "64",
        SERVER_HOSTNAME: "Amerta Roleplay"
      }
    },
    nest: 5,
    egg: 15
  },
  {
    id: "5", 
    identifier: "813a90ef",
    name: "FELAVITO ROLEPLAY",
    description: "PAKET 1 FIVEM SERVER ROLEPLAY'S",
    limits: { memory: 3072, disk: 50000, cpu: 80 },
    feature_limits: { databases: 1, allocations: 0, backups: 1 },
    container: {
      environment: {
        MAX_PLAYERS: "128",
        SERVER_HOSTNAME: "JAWARA ROLEPLAY"
      }
    },
    nest: 5,
    egg: 15
  },
  {
    id: "7",
    identifier: "c88c654c", 
    name: "MEDAN CITY ROLEPLAY",
    description: "PAKET II FIVEM SERVER ROLEPLAY'S",
    limits: { memory: 4096, disk: 60000, cpu: 100 },
    feature_limits: { databases: 1, allocations: 0, backups: 1 },
    container: {
      environment: {
        MAX_PLAYERS: "128",
        SERVER_HOSTNAME: "MEDAN CITY"
      }
    },
    nest: 5,
    egg: 15
  }
]

export async function GET() {
  try {
    // Sync to database
    const syncedServers = []
    
    for (const server of mockServers) {
      const serverData = {
        pteroId: server.id,
        identifier: server.identifier,
        name: server.name,
        description: server.description,
        status: 'running',
        suspended: false,
        limits: server.limits,
        featureLimits: server.feature_limits,
        nodeId: '1',
        allocationId: '1', 
        nestId: server.nest.toString(),
        eggId: server.egg.toString(),
        container: server.container,
        lastSyncAt: new Date()
      }

      try {
        // Upsert server to database
        const dbServer = await db.pterodactylServer.upsert({
          where: { identifier: server.identifier },
          update: serverData,
          create: serverData
        })

        syncedServers.push(dbServer)
      } catch (error) {
        console.error(`Failed to sync server ${server.identifier}:`, error)
      }
    }

    // Transform the data to our format
    const servers = syncedServers.map(server => ({
      id: server.id,
      identifier: server.identifier,
      name: server.name,
      description: server.description,
      status: server.status,
      limits: server.limits as {
        memory: number
        disk: number
        cpu: number
      },
      container: {
        environment: server.container as Record<string, string> || {}
      },
      feature_limits: server.featureLimits
    }))

    return NextResponse.json({
      success: true,
      servers,
      total: mockServers.length,
      synced: syncedServers.length
    })

  } catch (error) {
    console.error('Pterodactyl sync error:', error)
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