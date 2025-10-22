import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get total users
    const totalUsers = await db.user.count({
      where: {
        isActive: true
      }
    })

    // Get total active services
    const totalServices = await db.service.count({
      where: {
        status: 'ACTIVE'
      }
    })

    // Get total active Pterodactyl servers
    const totalPteroServers = await db.pterodactylServer.count({
      where: {
        status: 'running',
        suspended: false
      }
    })

    // Combine services and Pterodactyl servers for total active services
    const combinedServices = totalServices + totalPteroServers

    // Get total completed orders
    const totalOrders = await db.order.count({
      where: {
        status: 'COMPLETED'
      }
    })

    // Get total revenue
    const revenueResult = await db.order.aggregate({
      where: {
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      }
    })

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentUsers = await db.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        },
        isActive: true
      }
    })

    const recentServices = await db.service.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        },
        status: 'ACTIVE'
      }
    })

    const recentPteroServers = await db.pterodactylServer.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        },
        status: 'running'
      }
    })

    const combinedRecentServices = recentServices + recentPteroServers

    // Get service distribution by type
    const servicesByType = await db.service.groupBy({
      by: ['type'],
      where: {
        status: 'ACTIVE'
      },
      _count: {
        type: true
      }
    })

    return NextResponse.json({
      totalUsers,
      totalServices: combinedServices,
      totalOrders,
      totalRevenue: revenueResult._sum.amount || 0,
      recentUsers,
      recentServices: combinedRecentServices,
      servicesByType,
      uptime: '99.9%',
      lastUpdated: new Date().toISOString(),
      // Additional breakdown
      serviceBreakdown: {
        localServices: totalServices,
        pterodactylServers: totalPteroServers
      }
    })

  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}