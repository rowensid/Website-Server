import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Update or create Pterodactyl configuration
    const config = await db.apiConfiguration.upsert({
      where: { name: 'pterodactyl' },
      update: {
        apiUrl: 'https://panel.androwproject.cloud',
        apiKey: 'ptla_oaieo4yp4BQP3VXosTCjRkE8QaX1zGvLevxca1ncDx5',
        isActive: true,
        description: 'Pterodactyl Panel API Configuration - AndrowProject Cloud'
      },
      create: {
        name: 'pterodactyl',
        apiUrl: 'https://panel.androwproject.cloud',
        apiKey: 'ptla_oaieo4yp4BQP3VXosTCjRkE8QaX1zGvLevxca1ncDx5',
        isActive: true,
        description: 'Pterodactyl Panel API Configuration - AndrowProject Cloud'
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