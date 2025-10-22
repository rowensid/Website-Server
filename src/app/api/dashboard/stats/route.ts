import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get total users
    const totalUsers = await db.user.count({
      where: { isActive: true }
    })

    // Get total services
    const totalServices = await db.service.count()

    // Get active services
    const activeServices = await db.service.count({
      where: { status: 'ACTIVE' }
    })

    // Get total revenue (completed orders)
    const revenueResult = await db.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    })

    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentOrders = await db.order.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: 'COMPLETED'
      }
    })

    // Get recent revenue (last 7 days)
    const recentRevenueResult = await db.order.aggregate({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: 'COMPLETED'
      },
      _sum: { amount: true }
    })

    // Get service distribution
    const serviceDistribution = await db.service.groupBy({
      by: ['type'],
      _count: { id: true }
    })

    // Get monthly revenue trend (last 6 months) - simplified
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyOrders = await db.order.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: 'COMPLETED'
      },
      select: {
        createdAt: true,
        amount: true
      }
    })

    // Group by month manually
    const monthlyRevenueMap = new Map<string, { revenue: number; orders: number }>()
    monthlyOrders.forEach(order => {
      const month = order.createdAt.toISOString().slice(0, 7) // YYYY-MM
      const existing = monthlyRevenueMap.get(month) || { revenue: 0, orders: 0 }
      monthlyRevenueMap.set(month, {
        revenue: existing.revenue + order.amount,
        orders: existing.orders + 1
      })
    })

    const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Get latest activities
    const latestActivities = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        },
        service: {
          select: { name: true, type: true }
        }
      }
    })

    // Format activities
    const activities = latestActivities.map(activity => ({
      id: activity.id,
      type: 'order',
      description: `Order ${activity.status.toLowerCase()} - ${activity.service?.name || 'Service'}`,
      user: activity.user.name || activity.user.email,
      timestamp: activity.createdAt,
      amount: activity.amount
    }))

    const stats = {
      overview: {
        totalUsers,
        totalServices,
        activeServices,
        totalRevenue: revenueResult._sum.amount || 0,
        recentOrders,
        recentRevenue: recentRevenueResult._sum.amount || 0
      },
      serviceDistribution: serviceDistribution.map(item => ({
        type: item.type,
        count: item._count.id
      })),
      monthlyRevenue: monthlyRevenue.map(item => ({
        month: item.month,
        revenue: Number(item.revenue),
        orders: Number(item.orders)
      })),
      activities
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}