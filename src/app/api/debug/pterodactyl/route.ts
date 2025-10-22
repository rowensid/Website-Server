import { NextRequest, NextResponse } from 'next/server'
import { insecureFetch } from '@/lib/fetch-ssl'

export async function GET(request: NextRequest) {
  try {
    const pteroConfig = {
      panelUrl: process.env.PTERODACTYL_URL || 'https://panel.androwproject.cloud',
      apiKey: process.env.PTERODACTYL_API_KEY || ''
    }

    let realPteroData: any[] = []
    
    if (pteroConfig.apiKey) {
      try {
        // Use the simple approach that works
        const response = await insecureFetch(`${pteroConfig.panelUrl}/api/application/servers`, {
          headers: {
            'Authorization': `Bearer ${pteroConfig.apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Pterodactyl-Client/1.0'
          }
        })

        if (response.ok) {
          const data = await response.json()
          realPteroData = data.data || []
          
          // Extract relevant info for debugging
          const serverInfo = realPteroData.map(s => ({
            identifier: s.attributes?.identifier,
            id: s.attributes?.id,
            name: s.attributes?.name,
            status: s.attributes?.status || s.attributes?.state || 'unknown',
            description: s.attributes?.description,
            limits: s.attributes?.limits,
            feature_limits: s.attributes?.feature_limits
          }))
          
          return NextResponse.json({ 
            success: true,
            count: realPteroData.length,
            servers: serverInfo
          })
        } else {
          return NextResponse.json({ 
            success: false, 
            error: `HTTP ${response.status}: ${response.statusText}` 
          })
        }
      } catch (error) {
        return NextResponse.json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'No API key configured' 
      })
    }
  } catch (error) {
    console.error('Debug Pterodactyl API error:', error)
    return NextResponse.json({ error: 'Failed to fetch Pterodactyl data' }, { status: 500 })
  }
}