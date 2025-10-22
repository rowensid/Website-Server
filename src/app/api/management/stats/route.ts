import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('API: Fetching management stats')
    
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
    
    const [
      totalServices,
      activeServices,
      totalUsers,
      activeUsers,
      totalRevenue,
      pendingPayments,
      completedPayments
    ] = await Promise.all([
      db.service.count(),
      db.service.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      db.user.count(),
      db.user.count({
        where: {
          isActive: true
        }
      }),
      db.order.aggregate({
        where: {
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      }),
      db.order.count({
        where: {
          status: 'PENDING'
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
      activeUsers,
      totalRevenue: totalRevenue._sum.amount || 0,
      pendingPayments,
      completedPayments,
      systemUptime: 99.5 + Math.random() * 0.4 // Mock uptime between 99.5-99.9%
    }

    console.log('API: Management stats calculated:', stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('API: Error fetching management stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch management stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}