import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  console.log('=== DEBUG PTERODACTYL API ===')
  
  try {
    // Get Pterodactyl configuration
    const config = await db.apiConfiguration.findUnique({
      where: { name: 'pterodactyl' }
    })

    if (!config) {
      return NextResponse.json({ error: 'No Pterodactyl configuration found' })
    }

    console.log('Config:', {
      apiUrl: config.apiUrl,
      apiKey: config.apiKey.substring(0, 10) + '...',
      isActive: config.isActive
    })

    // Test API connection - try client endpoint first
    let testUrl = `${config.apiUrl}/api/client`
    console.log('Testing client endpoint first...')
    
    const testResponse = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    console.log('API Response Status:', testResponse.status)
    console.log('API Response Headers:', Object.fromEntries(testResponse.headers.entries()))

    const responseText = await testResponse.text()
    console.log('API Response (first 500 chars):', responseText.substring(0, 500))

    if (testResponse.ok) {
      try {
        const responseData = JSON.parse(responseText)
        console.log('Parsed JSON successfully, servers count:', responseData.data?.length || 0)
        return NextResponse.json({
          success: true,
          config: {
            apiUrl: config.apiUrl,
            isActive: config.isActive
          },
          apiStatus: testResponse.status,
          serversCount: responseData.data?.length || 0,
          servers: responseData.data?.slice(0, 3) || [] // First 3 servers
        })
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError)
        return NextResponse.json({
          success: false,
          error: 'Failed to parse API response',
          responseText: responseText.substring(0, 1000)
        })
      }
    } else {
      return NextResponse.json({
        success: false,
        error: `API Error: ${testResponse.status} ${testResponse.statusText}`,
        responseText: responseText.substring(0, 1000)
      })
    }

  } catch (error) {
    console.error('Debug Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}