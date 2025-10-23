import { NextRequest, NextResponse } from 'next/server'

const PTERODACTYL_URL = process.env.PTERODACTYL_URL
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY

export async function POST(request: NextRequest) {
  console.log('=== START SERVER 1 API CALLED ===')
  
  if (!PTERODACTYL_URL || !PTERODACTYL_API_KEY) {
    return NextResponse.json(
      { error: 'Pterodactyl credentials not configured' },
      { status: 500 }
    )
  }

  try {
    // Step 1: Get server list to find the identifier
    console.log('🔍 Getting server list from Application API...')
    const serversResponse = await fetch(`${PTERODACTYL_URL}/api/application/servers`, {
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    if (!serversResponse.ok) {
      const errorText = await serversResponse.text()
      console.error('❌ Failed to get servers:', serversResponse.status, errorText)
      return NextResponse.json(
        { error: `Failed to get servers: ${serversResponse.statusText}` },
        { status: serversResponse.status }
      )
    }

    const serversData = await serversResponse.json()
    const server = serversData.data?.find((s: any) => s.attributes.id == 1)
    
    if (!server) {
      return NextResponse.json(
        { error: 'Server with ID 1 not found' },
        { status: 404 }
      )
    }

    const serverIdentifier = server.attributes.identifier
    console.log(`📋 Found server: ${server.attributes.name} (${serverIdentifier})`)

    // Step 2: Use Application API power control (bukan Client API)
    console.log(`🚀 Starting server with Application API...`)
    const controlResponse = await fetch(`${PTERODACTYL_URL}/api/application/servers/${serverIdentifier}/power`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        signal: 'start'
      })
    })

    if (!controlResponse.ok) {
      const errorText = await controlResponse.text()
      console.error('❌ Failed to start server:', controlResponse.status, errorText)
      return NextResponse.json(
        { error: `Failed to start server: ${controlResponse.statusText} (${controlResponse.status}) - ${errorText}` },
        { status: controlResponse.status }
      )
    }

    console.log('✅ Successfully sent start command to server')
    
    return NextResponse.json({
      success: true,
      action: 'start',
      serverId: '1',
      serverIdentifier: serverIdentifier,
      serverName: server.attributes.name,
      message: 'Successfully sent start command to server',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Error starting server 1:', error)
    return NextResponse.json(
      { error: 'Failed to start server' },
      { status: 500 }
    )
  }
}