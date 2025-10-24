import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    const body = await request.json()
    const { amount, paymentMethod } = body

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method is required' }, { status: 400 })
    }

    // Get current user balance
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { balance: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const newBalance = user.balance + amount

    // Create transaction record
    const transaction = await db.walletTransaction.create({
      data: {
        userId: decoded.userId,
        type: 'TOP_UP',
        amount,
        description: `Top up via ${paymentMethod}`,
        balance: newBalance,
        metadata: {
          paymentMethod
        }
      }
    })

    // Update user balance
    await db.user.update({
      where: { id: decoded.userId },
      data: { balance: newBalance }
    })

    return NextResponse.json({
      message: 'Top up successful',
      transaction,
      newBalance
    })
  } catch (error) {
    console.error('Top up error:', error)
    return NextResponse.json({ error: 'Failed to process top up' }, { status: 500 })
  }
}