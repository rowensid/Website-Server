import { NextRequest, NextResponse } from 'next/server'

// Pterodactyl API Configuration
const PTERODACTYL_API_URL = process.env.PTERODACTYL_API_URL || 'https://panel.aberzz.my.id'
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY || 'ptla_oaieo4yp4BQP3VXosTCjRkE8QaX1zGvLevxca1ncDx5'

export async function GET(
  request: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const serverId = params.serverId

    console.log(`🔌 Setting up console WebSocket for server ${serverId}`)

    // Get WebSocket connection details from Pterodactyl
    const response = await fetch(`${PTERODACTYL_API_URL}/api/client/servers/${serverId}/websocket`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Failed to get WebSocket details for server ${serverId}:`, response.status, errorText)
      
      if (response.status === 401) {
        throw new Error('Pterodactyl API key is invalid or expired.')
      } else if (response.status === 403) {
        throw new Error('Access denied. You may not have permission to access this server\'s console.')
      } else if (response.status === 404) {
        throw new Error(`Server with ID ${serverId} not found.`)
      } else {
        throw new Error(`Failed to get WebSocket details: ${response.status} - ${errorText}`)
      }
    }

    const wsData = await response.json()
    
    if (!wsData.data) {
      throw new Error('Invalid WebSocket response from Pterodactyl API')
    }

    const socket = wsData.data.socket
    const token = wsData.data.token

    console.log(`✅ Got WebSocket details for server ${serverId}: socket=${socket}`)

    return NextResponse.json({
      success: true,
      serverId,
      websocket: {
        socket: socket,
        token: token,
        url: `${PTERODACTYL_API_URL.replace('http', 'ws')}/api/servers/${serverId}/ws/${socket}`
      },
      connectionInfo: {
        pterodactylUrl: PTERODACTYL_API_URL,
        connectUrl: `wss://panel.aberzz.my.id/api/servers/${serverId}/ws/${socket}`,
        headers: {
          'Origin': PTERODACTYL_API_URL
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Console WebSocket error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to setup console WebSocket',
        details: {
          type: 'WEBSOCKET_ERROR',
          serverId: params.serverId,
          suggestion: 'Check server ID, API connection, and server status',
          troubleshooting: [
            'Verify server exists and is running',
            'Check API key has Client API permissions',
            'Ensure WebSocket connections are allowed',
            'Check network connectivity to Pterodactyl panel'
          ]
        }
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const serverId = params.serverId
    const { command } = await request.json()

    if (!command) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Console command is required',
          details: {
            type: 'MISSING_COMMAND',
            suggestion: 'Provide a command to send to the server console'
          }
        },
        { status: 400 }
      )
    }

    console.log(`💬 Sending command to server ${serverId}: "${command}"`)

    const wsResponse = await fetch(`${PTERODACTYL_API_URL}/api/client/servers/${serverId}/websocket`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Accept': 'application/json'
      }
    })

    if (!wsResponse.ok) {
      throw new Error('Failed to get WebSocket connection details')
    }

    const wsData = await wsResponse.json()
    const socket = wsData.data.socket
    const token = wsData.data.token

    return NextResponse.json({
      success: true,
      message: 'Command prepared for sending via WebSocket',
      serverId,
      command,
      websocket: {
        socket: socket,
        token: token,
        url: `wss://panel.aberzz.my.id/api/servers/${serverId}/ws/${socket}`
      },
      note: 'Actual command sending requires WebSocket connection. Use the provided WebSocket details to connect and send the command.',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Send command error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to send console command',
        details: {
          type: 'COMMAND_ERROR',
          serverId: params.serverId,
          suggestion: 'Check server ID, API connection, and WebSocket availability'
        }
      },
      { status: 500 }
    )
  }
}