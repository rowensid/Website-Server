import { NextRequest, NextResponse } from 'next/server'

// Pterodactyl API Configuration
const PTERODACTYL_API_URL = process.env.PTERODACTYL_URL || 'https://panel.androwproject.cloud'
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_BYPASS_TOKEN || process.env.PTERODACTYL_API_KEY || '3oNEVm8MxY1U0A_8Czb0eJ-9eceEEPJ9bCj3bGTg'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const { signal } = await request.json()
    const serverId = (await params).serverId

    if (!signal) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Power signal is required',
          details: {
            type: 'MISSING_PARAMETER',
            suggestion: 'Provide one of: start, stop, restart, kill'
          }
        },
        { status: 400 }
      )
    }

    // Validate action
    const validActions = ['start', 'stop', 'restart', 'kill']
    if (!validActions.includes(signal)) {
      return NextResponse.json(
        { 
          success: false,
          error: `Invalid power signal: ${signal}`,
          details: {
            type: 'INVALID_SIGNAL',
            validSignals: validActions,
            suggestion: 'Use one of the valid power signals'
          }
        },
        { status: 400 }
      )
    }

    console.log(`🎮 Sending power command to server ${serverId}: ${signal}`)

    // Send power command to Pterodactyl API
    const response = await fetch(`${PTERODACTYL_API_URL}/api/client/servers/${serverId}/power`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'A&S-Studio-Pterodactyl-Bypass/1.0'
      },
      body: JSON.stringify({
        signal: signal
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Power command failed for server ${serverId}:`, response.status, errorText)
      
      // Provide specific error messages
      if (response.status === 401) {
        throw new Error('Pterodactyl API key is invalid or expired. Please check your API key configuration in .env.local')
      } else if (response.status === 403) {
        throw new Error('Access denied. The API key may not have permission to control this server, or the server is not assigned to your account.')
      } else if (response.status === 404) {
        throw new Error(`Server with ID ${serverId} not found in Pterodactyl panel. Verify the server ID is correct.`)
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before sending another command to this server.')
      } else if (response.status >= 500) {
        throw new Error('Pterodactyl panel server error. The panel may be experiencing issues.')
      } else {
        throw new Error(`Pterodactyl API error: ${response.status} - ${errorText}`)
      }
    }

    const result = await response.json()
    console.log(`✅ Power command sent successfully to server ${serverId}: ${signal}`)

    return NextResponse.json({
      success: true,
      message: `Power command "${signal}" sent to server ${serverId}`,
      serverId,
      action: signal,
      timestamp: new Date().toISOString(),
      pterodactylResponse: result
    })

  } catch (error: any) {
    console.error('❌ Power control error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to send power command',
        details: {
          type: 'POWER_CONTROL_ERROR',
          serverId: params.serverId,
          suggestion: 'Check Pterodactyl panel connection, API key permissions, and server status',
          troubleshooting: [
            'Verify PTERODACTYL_API_URL in .env.local',
            'Check PTERODACTYL_API_KEY is valid and has Client API permissions',
            'Ensure server ID exists and is accessible',
            'Check if server is already in the desired state'
          ]
        }
      },
      { status: 500 }
    )
  }
}

// Get current power state of a server
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serverId: string }> }
) {
  try {
    const serverId = (await params).serverId

    console.log(`🔍 Getting power state for server ${serverId}`)

    // Get server resources which includes power state
    const response = await fetch(`${PTERODACTYL_API_URL}/api/client/servers/${serverId}/resources`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Accept': 'application/json',
        'User-Agent': 'A&S-Studio-Pterodactyl-Bypass/1.0'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Failed to get server resources for ${serverId}:`, response.status, errorText)
      
      if (response.status === 401) {
        throw new Error('Pterodactyl API key is invalid or expired.')
      } else if (response.status === 403) {
        throw new Error('Access denied. You may not have permission to view this server.')
      } else if (response.status === 404) {
        throw new Error(`Server with ID ${serverId} not found.`)
      } else {
        throw new Error(`Failed to get server resources: ${response.status} - ${errorText}`)
      }
    }

    const resources = await response.json()
    
    // Determine power state from resource data
    let powerState = 'offline'
    let uptime = 0
    
    if (resources.attributes) {
      const state = resources.attributes.current_state || 'offline'
      uptime = resources.attributes.resources?.uptime || 0
      
      if (state === 'running') powerState = 'online'
      else if (state === 'starting') powerState = 'starting'
      else if (state === 'stopping') powerState = 'stopping'
      else powerState = 'offline'
    }

    console.log(`✅ Server ${serverId} power state: ${powerState} (uptime: ${uptime}s)`)

    return NextResponse.json({
      success: true,
      serverId,
      powerState,
      uptime,
      resources: resources.attributes,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Get power state error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to get server power state',
        details: {
          type: 'POWER_STATE_ERROR',
          serverId: params.serverId,
          suggestion: 'Check server ID and API connection'
        }
      },
      { status: 500 }
    )
  }
}