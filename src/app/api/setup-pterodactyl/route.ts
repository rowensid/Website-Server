import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiUrl, apiKey } = body

    if (!apiUrl || !apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'API URL and API key are required' 
      }, { status: 400 })
    }

    // Update or create Pterodactyl configuration
    const config = await db.apiConfiguration.upsert({
      where: { name: 'pterodactyl' },
      update: {
        apiUrl: apiUrl,
        apiKey: apiKey,
        isActive: true,
        description: 'Pterodactyl Panel API Configuration'
      },
      create: {
        name: 'pterodactyl',
        apiUrl: apiUrl,
        apiKey: apiKey,
        isActive: true,
        description: 'Pterodactyl Panel API Configuration'
      }
    })

    console.log('Pterodactyl configuration updated:', config)

    return NextResponse.json({ 
      success: true, 
      message: 'Pterodactyl configuration updated successfully',
      config: {
        name: config.name,
        apiUrl: config.apiUrl,
        isActive: config.isActive,
        description: config.description
      }
    })
  } catch (error) {
    console.error('Error setting up Pterodactyl configuration:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to setup Pterodactyl configuration' 
    }, { status: 500 })
  }
}