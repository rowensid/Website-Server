import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('API: Fetching services for server dashboard (NEW)')
    
    // Test database connection first
    try {
      await db.$queryRaw`SELECT 1`
      console.log('API: Database connection successful')
    } catch (dbError) {
      console.error('API: Database connection failed:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }
    
    const services = await db.service.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        price: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`API: Found ${services.length} services`)

    // Transform data to match expected format
    const transformedServices = services.map(service => ({
      id: service.id,
      name: service.name,
      type: service.type,
      status: service.status.toLowerCase() as 'active' | 'inactive' | 'maintenance',
      uptime: Math.random() * 100, // Mock uptime
      cpu: Math.floor(Math.random() * 80), // Mock CPU usage
      memory: Math.floor(Math.random() * 90), // Mock memory usage
      storage: Math.floor(Math.random() * 70), // Mock storage usage
      users: service._count.orders, // Use order count as user count
      lastCheck: new Date().toISOString(),
      description: `${service.type} Service - ${service.name} (Rp ${service.price.toLocaleString()})`,
      ip: '192.168.1.100', // Mock IP
      port: 8080 // Mock port
    }))

    return NextResponse.json({
      success: true,
      services: transformedServices
    })
  } catch (error) {
    console.error('API: Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}