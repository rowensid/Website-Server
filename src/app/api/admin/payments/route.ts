import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Fetch orders from database with user information
    const orders = await db.order.findMany({
      include: {
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

    // Transform data to match expected format
    const formattedPayments = orders.map(order => {
      // Determine payment type based on context
      let type: 'deposit' | 'withdraw' | 'purchase' = 'purchase'
      let description = ''
      
      if (order.service) {
        description = `Pembelian ${order.service.name} (${order.service.type})`
      } else {
        type = 'deposit'
        description = 'Top up saldo'
      }

      return {
        id: order.id,
        userId: order.userId,
        username: order.user.name || order.user.email.split('@')[0],
        amount: order.amount,
        type,
        status: order.status.toLowerCase() as 'pending' | 'completed' | 'failed',
        createdAt: order.createdAt.toISOString(),
        description
      }
    })

    return NextResponse.json(formattedPayments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In a real implementation, you would:
    // 1. Validate input data
    // 2. Process payment through payment gateway
    // 3. Create payment record in database
    // 4. Update user balance
    // 5. Send payment confirmation
    
    // For now, we'll just return success
    return NextResponse.json(
      { message: 'Payment processed successfully', paymentId: 'new-payment-id' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}