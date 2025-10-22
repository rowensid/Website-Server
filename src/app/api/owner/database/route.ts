import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Get database statistics
export async function GET(request: NextRequest) {
  try {
    const [
      totalUsers,
      activeUsers,
      totalServers,
      activeServers,
      totalOrders,
      completedOrders,
      totalRevenue
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.service.count(),
      db.service.count({ where: { status: 'ACTIVE' } }),
      db.order.count(),
      db.order.count({ where: { status: 'COMPLETED' } }),
      db.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      })
    ])

    const recentUsers = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    const recentServers = await db.service.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalServers,
        activeServers,
        totalOrders,
        completedOrders,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
      recentUsers: recentUsers.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString()
      })),
      recentServers: recentServers.map(server => ({
        id: server.id,
        name: server.name,
        type: server.type,
        status: server.status,
        price: server.price,
        customer: server.user.name,
        customerEmail: server.user.email,
        createdAt: server.createdAt.toISOString(),
      }))
    })

  } catch (error) {
    console.error('Database stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Clear database (dangerous - owner only)
export async function DELETE(request: NextRequest) {
  try {
    const { confirm } = await request.json()

    if (confirm !== 'DELETE_ALL_DATA') {
      return NextResponse.json(
        { error: 'Invalid confirmation' },
        { status: 400 }
      )
    }

    // Delete all data in order
    await db.order.deleteMany()
    await db.service.deleteMany()
    await db.session.deleteMany()
    await db.user.deleteMany()

    return NextResponse.json({
      message: 'Database cleared successfully'
    })

  } catch (error) {
    console.error('Clear database error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}