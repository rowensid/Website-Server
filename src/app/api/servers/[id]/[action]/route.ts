import { NextRequest, NextResponse } from 'next/server'

const PTERODACTYL_URL = process.env.PTERODACTYL_URL
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const resolvedParams = await params
  console.log(`=== SERVER CONTROL API: ${resolvedParams.action.toUpperCase()} SERVER ${resolvedParams.id} ===`)
  
  if (!PTERODACTYL_URL || !PTERODACTYL_API_KEY) {
    return NextResponse.json(
      { error: 'Pterodactyl credentials not configured' },
      { status: 500 }
    )
  }

  const action = resolvedParams.action
  const serverId = resolvedParams.id

  // Validasi action
  const validActions = ['start', 'stop', 'restart', 'kill']
  if (!validActions.includes(action)) {
    return NextResponse.json(
      { error: 'Invalid action. Use: start, stop, restart, kill' },
      { status: 400 }
    )
  }

  try {
    // Kirim perintah ke Pterodactyl
    const controlResponse = await fetch(`${PTERODACTYL_URL}/api/application/servers/${serverId}/power`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        signal: action
      })
    })

    if (!controlResponse.ok) {
      const errorText = await controlResponse.text()
      console.error(`❌ Failed to ${action} server ${serverId}:`, errorText)
      return NextResponse.json(
        { error: `Failed to ${action} server: ${controlResponse.statusText}` },
        { status: controlResponse.status }
      )
    }

    console.log(`✅ Successfully sent ${action} command to server ${serverId}`)
    
    // Ambil status terbaru server
    const statusResponse = await fetch(`${PTERODACTYL_URL}/api/application/servers/${serverId}`, {
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Accept': 'application/json'
      }
    })

    let currentStatus = 'unknown'
    if (statusResponse.ok) {
      const statusData = await statusResponse.json()
      currentStatus = statusData.attributes?.status || 'unknown'
    }

    return NextResponse.json({
      success: true,
      action: action,
      serverId: serverId,
      message: `Successfully sent ${action} command to server`,
      currentStatus: currentStatus,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error(`❌ Error controlling server ${serverId}:`, error)
    return NextResponse.json(
      { error: 'Failed to control server' },
      { status: 500 }
    )
  }
}