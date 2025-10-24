import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { serviceId, amount, paymentMethod, notes } = body

    if (!serviceId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Service ID, amount, and payment method are required' },
        { status: 400 }
      )
    }

    // Validate service exists and is active
    const service = await db.storeItem.findUnique({
      where: { id: serviceId }
    })

    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: 'Service not found or inactive' },
        { status: 404 }
      )
    }

    // Validate amount matches service price
    if (amount !== service.price) {
      return NextResponse.json(
        { error: 'Amount does not match service price' },
        { status: 400 }
      )
    }

    // Create order
    const order = await db.order.create({
      data: {
        userId: session.userId,
        serviceId,
        amount,
        paymentMethod,
        status: 'PENDING'
      }
    })

    // If this is a hosting/service type, create a service record
    if (['HOSTING', 'SERVER'].includes(service.category)) {
      await db.service.create({
        data: {
          userId: session.userId,
          name: service.title,
          type: service.category === 'HOSTING' ? 'RDP' : 'GAME_HOSTING',
          status: 'PENDING',
          price: amount,
          description: service.description,
          config: {
            orderId: order.id,
            storeItemId: serviceId,
            notes: notes || '',
            category: service.category
          }
        }
      })
    }

    return NextResponse.json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        amount: order.amount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt.toISOString()
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Failed to create order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'all'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = { userId: session.userId }
    
    if (status !== 'all') {
      where.status = status
    }

    // Get total count
    const total = await db.order.count({ where })

    // Get orders
    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        service: {
          select: {
            name: true,
            type: true,
            status: true,
            config: true
          }
        }
      }
    })

    const pages = Math.ceil(total / limit)

    // Format orders
    const formattedOrders = orders.map(order => ({
      id: order.id,
      title: order.service?.name || 'Unknown Service',
      type: order.service?.type || 'UNKNOWN',
      amount: order.amount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      serviceStatus: order.service?.status || null,
      config: order.service?.config || null
    }))

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })

  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}