import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return decoded
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get stats from database (public access for landing page)
    const [
      totalUsers,
      recentUsers,
      totalServices,
      recentServices,
      totalOrders,
      totalRevenue
    ] = await Promise.all([
      // Total users
      db.user.count({
        where: { isActive: true }
      }),
      
      // Recent users (last 7 days)
      db.user.count({
        where: {
          isActive: true,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Total services
      db.service.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Recent services (last 7 days)
      db.service.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Total orders
      db.order.count(),
      
      // Total revenue
      db.order.aggregate({
        where: {
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      })
    ])

    const stats = {
      totalUsers,
      recentUsers,
      totalServices,
      recentServices,
      totalOrders,
      totalRevenue: totalRevenue._sum.amount || 0,
      uptime: '99.9%',
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}