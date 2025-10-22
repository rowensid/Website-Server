import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token' },
        { status: 401 }
      )
    }

    // Find session
    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!session.user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      )
    }

    // Get user's services
    const services = await db.service.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        type: service.type,
        status: service.status,
        price: service.price,
        expiresAt: service.expiresAt?.toISOString(),
        createdAt: service.createdAt.toISOString(),
      }))
    })

  } catch (error) {
    console.error('Services fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token' },
        { status: 401 }
      )
    }

    // Find session
    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!session.user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, type, price } = body

    // Create new service
    const service = await db.service.create({
      data: {
        name,
        type,
        price,
        userId: session.user.id,
        status: 'PENDING',
      }
    })

    return NextResponse.json({
      message: 'Service created successfully',
      service: {
        id: service.id,
        name: service.name,
        type: service.type,
        status: service.status,
        price: service.price,
        createdAt: service.createdAt.toISOString(),
      }
    })

  } catch (error) {
    console.error('Service creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}