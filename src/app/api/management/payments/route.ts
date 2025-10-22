import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('API: Fetching payments for management')
    
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
    
    const payments = await db.order.findMany({
      select: {
        id: true,
        userId: true,
        amount: true,
        status: true,
        paymentMethod: true,
        createdAt: true,
        updatedAt: true,
        serviceId: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        service: {
          select: {
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`API: Found ${payments.length} payments`)

    return NextResponse.json({
      success: true,
      payments: payments
    })
  } catch (error) {
    console.error('API: Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}