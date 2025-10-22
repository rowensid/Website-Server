import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { period, dataType } = body

    if (!period || !dataType) {
      return NextResponse.json(
        { error: 'Period and dataType are required' },
        { status: 400 }
      )
    }

    // Calculate cutoff date
    const now = new Date()
    let cutoffDate: Date

    switch (period) {
      case '1week':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '2weeks':
        cutoffDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        break
      case '1month':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '3months':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '6months':
        cutoffDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
        break
      case '1year':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid period specified' },
          { status: 400 }
        )
    }

    let deletedCount = 0
    let details: any = {}

    try {
      if (dataType === 'all' || dataType === 'orders') {
        // Delete old orders
        const oldOrders = await db.order.findMany({
          where: {
            createdAt: {
              lt: cutoffDate
            }
          }
        })

        if (oldOrders.length > 0) {
          await db.order.deleteMany({
            where: {
              createdAt: {
                lt: cutoffDate
              }
            }
          })
          deletedCount += oldOrders.length
          details.orders = oldOrders.length
        }
      }

      if (dataType === 'all' || dataType === 'services') {
        // Delete old cancelled/suspended services
        const oldServices = await db.service.findMany({
          where: {
            AND: [
              {
                expiresAt: {
                  lt: cutoffDate
                }
              },
              {
                status: {
                  in: ['CANCELLED', 'SUSPENDED']
                }
              }
            ]
          }
        })

        if (oldServices.length > 0) {
          await db.service.deleteMany({
            where: {
              AND: [
                {
                  expiresAt: {
                    lt: cutoffDate
                  }
                },
                {
                  status: {
                    in: ['CANCELLED', 'SUSPENDED']
                  }
                }
              ]
            }
          })
          deletedCount += oldServices.length
          details.services = oldServices.length
        }
      }

      if (dataType === 'all' || dataType === 'inactiveUsers') {
        // Delete inactive users (no login for specified period and no active services)
        const inactiveUsers = await db.user.findMany({
          where: {
            AND: [
              {
                lastLoginAt: {
                  lt: cutoffDate
                }
              },
              {
                services: {
                  none: {}
                }
              },
              {
                role: 'USER'
              }
            ]
          }
        })

        if (inactiveUsers.length > 0) {
          await db.user.deleteMany({
            where: {
              id: {
                in: inactiveUsers.map(u => u.id)
              }
            }
          })
          deletedCount += inactiveUsers.length
          details.inactiveUsers = inactiveUsers.length
        }
      }

      return NextResponse.json({
        message: 'Database cleanup completed successfully',
        deletedCount,
        details,
        cutoffDate: cutoffDate.toISOString(),
        period,
        dataType
      })

    } catch (dbError) {
      console.error('Database cleanup error:', dbError)
      return NextResponse.json(
        { error: 'Database operation failed', details: dbError instanceof Error ? dbError.message : 'Unknown error' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Cleanup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get database statistics
    const [
      totalUsers,
      totalServices,
      totalOrders,
      expiredServices,
      inactiveUsers
    ] = await Promise.all([
      db.user.count(),
      db.service.count(),
      db.order.count(),
      db.service.count({
        where: {
          status: {
            in: ['CANCELLED', 'SUSPENDED']
          }
        }
      }),
      db.user.count({
        where: {
          AND: [
            {
              lastLoginAt: {
                lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
              }
            },
            {
              services: {
                none: {}
              }
            },
            {
              role: 'USER'
            }
          ]
        }
      })
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalServices,
        totalOrders,
        expiredServices,
        inactiveUsers
      }
    })

  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get database statistics' },
      { status: 500 }
    )
  }
}