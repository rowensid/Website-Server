import { NextRequest, NextResponse } from 'next/server'

interface ServerResources {
  state: string
  resources: {
    cpu_absolute: number
    memory_bytes: number
    disk_bytes: number
    network_rx_bytes: number
    network_tx_bytes: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const { panelUrl, apiKey, serverIdentifier } = await request.json()

    if (!panelUrl || !apiKey || !serverIdentifier) {
      return NextResponse.json(
        { error: 'Missing required parameters: panelUrl, apiKey, serverIdentifier' },
        { status: 400 }
      )
    }

    // Get server resources using application API
    const resourcesResponse = await fetch(
      `${panelUrl}/api/application/servers/${serverIdentifier}/resources`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      }
    )

    if (!resourcesResponse.ok) {
      throw new Error(`Resources API error: ${resourcesResponse.status}`)
    }

    const resourcesData = await resourcesResponse.json()

    // Get server details using application API to check status
    const detailsResponse = await fetch(
      `${panelUrl}/api/application/servers/${serverIdentifier}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      }
    )

    let serverStatus = 'offline'
    if (detailsResponse.ok) {
      const detailsData = await detailsResponse.json()
      serverStatus = 'running' // Application API doesn't provide state, assume running if exists
    }

    return NextResponse.json({
      status: serverStatus,
      resources: resourcesData.attributes?.resources || {
        cpu_absolute: 0,
        memory_bytes: 0,
        disk_bytes: 0,
        network_rx_bytes: 0,
        network_tx_bytes: 0
      }
    })

  } catch (error) {
    console.error('Server resources error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'offline',
        resources: {
          cpu_absolute: 0,
          memory_bytes: 0,
          disk_bytes: 0,
          network_rx_bytes: 0,
          network_tx_bytes: 0
        }
      },
      { status: 500 }
    )
  }
}