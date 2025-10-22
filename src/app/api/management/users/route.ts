import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('API: Fetching users for management')
    
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
    
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        avatar: true,
        _count: {
          select: {
            services: true,
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`API: Found ${users.length} users`)

    // Calculate total spent and active services for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const totalSpent = await db.order.aggregate({
          where: {
            userId: user.id,
            status: 'COMPLETED'
          },
          _sum: {
            amount: true
          }
        })

        const activeServices = await db.service.count({
          where: {
            userId: user.id,
            status: 'ACTIVE'
          }
        })

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          avatar: user.avatar,
          services: user._count.services,
          activeServices: activeServices,
          totalSpent: totalSpent._sum.amount || 0
        }
      })
    )

    return NextResponse.json({
      success: true,
      users: usersWithStats
    })
  } catch (error) {
    console.error('API: Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}