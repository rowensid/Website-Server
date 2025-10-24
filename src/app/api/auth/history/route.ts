import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find session by token
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get login history for this user
    const loginHistory = await db.session.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        token: false, // Don't expose token
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Mock IP and location data (in real app, you'd store this in the session)
    const mockHistory = loginHistory.map((session, index) => ({
      id: session.id,
      loginTime: session.createdAt.toISOString(),
      ip: `192.168.1.${100 + index}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: ['Jakarta, Indonesia', 'Surabaya, Indonesia', 'Bandung, Indonesia'][index % 3],
      device: ['Desktop', 'Mobile', 'Tablet'][index % 3],
      browser: ['Chrome', 'Firefox', 'Safari'][index % 3],
      isActive: session.expiresAt > new Date()
    }))

    return NextResponse.json({
      history: mockHistory,
      total: mockHistory.length
    })

  } catch (error) {
    console.error('Failed to fetch login history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch login history' },
      { status: 500 }
    )
  }
}
