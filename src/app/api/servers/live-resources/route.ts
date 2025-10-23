import { NextResponse } from 'next/server'

export async function GET() {
  console.log('=== LIVE RESOURCES API CALLED AT:', new Date().toISOString(), '===')
  
  try {
    // Generate realistic resource updates
    const servers = [
      {
        id: '1',
        identifier: '99cbffc1',
        name: 'AMERTA ROLEPLAY V1.5',
        status: 'online',
        resources: {
          cpu: {
            current: Math.floor(Math.random() * 40) + 10, // 10-50% CPU
            limit: 100,
            percentage: 0
          },
          memory: {
            current: Math.floor((4096 * 1024 * 1024) * (0.3 + Math.random() * 0.4)), // 30-70% memory
            limit: 4096 * 1024 * 1024,
            percentage: 0
          },
          disk: {
            current: Math.floor((71680 * 1024 * 1024) * (0.2 + Math.random() * 0.3)), // 20-50% disk
            limit: 71680 * 1024 * 1024,
            percentage: 0
          },
          network: {
            rx: Math.floor(Math.random() * 1000000),
            tx: Math.floor(Math.random() * 1000000)
          },
          uptime: Math.floor(Math.random() * 86400 * 3) // Up to 3 days
        },
        lastUpdate: new Date().toISOString()
      },
      {
        id: '2',
        identifier: '813a90ef',
        name: 'FELAVITO ROLEPLAY',
        status: 'offline',
        resources: {
          cpu: { current: 0, limit: 80, percentage: 0 },
          memory: { current: 0, limit: 3072 * 1024 * 1024, percentage: 0 },
          disk: { current: Math.floor((50000 * 1024 * 1024) * 0.1), limit: 50000 * 1024 * 1024, percentage: 0 },
          network: { rx: 0, tx: 0 },
          uptime: 0
        },
        lastUpdate: new Date().toISOString()
      },
      {
        id: '3',
        identifier: 'c88c654c',
        name: 'MEDAN CITY ROLEPLAY',
        status: 'starting',
        resources: {
          cpu: {
            current: Math.floor(Math.random() * 20) + 5, // 5-25% CPU
            limit: 100,
            percentage: 0
          },
          memory: {
            current: Math.floor((4096 * 1024 * 1024) * (0.2 + Math.random() * 0.2)), // 20-40% memory
            limit: 4096 * 1024 * 1024,
            percentage: 0
          },
          disk: {
            current: Math.floor((60000 * 1024 * 1024) * 0.1), // 10% disk
            limit: 60000 * 1024 * 1024,
            percentage: 0
          },
          network: {
            rx: Math.floor(Math.random() * 100000),
            tx: Math.floor(Math.random() * 100000)
          },
          uptime: 0
        },
        lastUpdate: new Date().toISOString()
      }
    ]

    // Calculate percentages
    servers.forEach(server => {
      server.resources.cpu.percentage = Math.round((server.resources.cpu.current / server.resources.cpu.limit) * 100)
      server.resources.memory.percentage = Math.round((server.resources.memory.current / server.resources.memory.limit) * 100)
      server.resources.disk.percentage = Math.round((server.resources.disk.current / server.resources.disk.limit) * 100)
    })

    console.log(`✅ Generated resource updates for ${servers.length} servers`)
    
    servers.forEach(server => {
      console.log(`  📊 ${server.name}: CPU ${server.resources.cpu.percentage}% | Memory ${server.resources.memory.percentage}%`)
    })

    return NextResponse.json({
      success: true,
      servers: servers,
      total: servers.length,
      updated: servers.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Live resources error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        servers: []
      },
      { status: 500 }
    )
  }
}