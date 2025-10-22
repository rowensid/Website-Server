import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('API: Fetching server stats (NEW)')
    
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
    
    const [totalServices, activeServices, totalUsers] = await Promise.all([
      db.service.count(),
      db.service.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      db.order.count({
        where: {
          status: 'COMPLETED'
        }
      })
    ])

    const stats = {
      totalServices,
      activeServices,
      totalUsers,
      averageUptime: 95.5 + Math.random() * 4 // Mock uptime between 95.5-99.5%
    }

    console.log('API: Server stats calculated:', stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('API: Error fetching server stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch server stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}