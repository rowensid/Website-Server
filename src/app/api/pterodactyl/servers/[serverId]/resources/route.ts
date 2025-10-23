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

    console.log(`📊 Getting real-time resources for server ${serverId}`)

    // Get real-time server resources from Pterodactyl API
    const response = await fetch(`${PTERODACTYL_API_URL}/api/client/servers/${serverId}/resources`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Failed to get server resources for ${serverId}:`, response.status, errorText)
      
      // Provide specific error messages
      if (response.status === 401) {
        throw new Error('Pterodactyl API key is invalid or expired. Please check your API key configuration.')
      } else if (response.status === 403) {
        throw new Error('Access denied. You may not have permission to view this server\'s resources.')
      } else if (response.status === 404) {
        throw new Error(`Server with ID ${serverId} not found in Pterodactyl panel.`)
      } else if (response.status >= 500) {
        throw new Error('Pterodactyl panel server error. Unable to fetch server resources.')
      } else {
        throw new Error(`Failed to get server resources: ${response.status} - ${errorText}`)
      }
    }

    const resources = await response.json()
    
    if (!resources.attributes) {
      throw new Error('Invalid response format from Pterodactyl API')
    }

    // Extract resource data
    const resourceData = resources.attributes.resources || {}
    const state = resources.attributes.current_state || 'offline'
    
    // Transform data to match our frontend format
    const transformedResources = {
      serverId,
      current_state: state,
      resources: {
        cpu_absolute: resourceData.cpu_absolute || 0,
        memory_bytes: resourceData.memory_bytes || 0,
        memory_limit_bytes: resourceData.memory_limit_bytes || 0,
        disk_bytes: resourceData.disk_bytes || 0,
        disk_limit_bytes: resourceData.disk_limit_bytes || 0,
        network_rx_bytes: resourceData.network_rx_bytes || 0,
        network_tx_bytes: resourceData.network_tx_bytes || 0,
        uptime: resourceData.uptime || 0
      },
      // Transformed values for easier frontend consumption
      transformed: {
        cpu_percent: Math.round((resourceData.cpu_absolute || 0) * 100),
        memory_used_mb: Math.round((resourceData.memory_bytes || 0) / 1024 / 1024),
        memory_total_mb: Math.round((resourceData.memory_limit_bytes || 0) / 1024 / 1024),
        memory_percent: Math.round(((resourceData.memory_bytes || 0) / (resourceData.memory_limit_bytes || 1)) * 100),
        disk_used_mb: Math.round((resourceData.disk_bytes || 0) / 1024 / 1024),
        disk_total_mb: Math.round((resourceData.disk_limit_bytes || 0) / 1024 / 1024),
        disk_percent: Math.round(((resourceData.disk_bytes || 0) / (resourceData.disk_limit_bytes || 1)) * 100),
        network_rx_mbps: Math.round((resourceData.network_rx_bytes || 0) / 1024 / 1024 * 8) / 1024,
        network_tx_mbps: Math.round((resourceData.network_tx_bytes || 0) / 1024 / 1024 * 8) / 1024,
        uptime_formatted: formatUptime(resourceData.uptime || 0),
        status: state === 'running' ? 'online' : state === 'starting' ? 'starting' : state === 'stopping' ? 'stopping' : 'offline'
      }
    }

    console.log(`✅ Server ${serverId} resources: CPU ${transformedResources.transformed.cpu_percent}%, Memory ${transformedResources.transformed.memory_percent}%`)

    return NextResponse.json({
      success: true,
      data: transformedResources,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Server resources error:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to fetch server resources',
        details: {
          type: 'RESOURCES_ERROR',
          serverId: params.serverId,
          suggestion: 'Check server ID, API connection, and server status',
          troubleshooting: [
            'Verify server exists and is accessible',
            'Check API key has Client API permissions',
            'Ensure server is not suspended',
            'Check network connectivity to Pterodactyl panel'
          ]
        }
      },
      { status: 500 }
    )
  }
}

// Helper function to format uptime
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}