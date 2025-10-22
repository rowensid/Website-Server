import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    // Get orders with user information
    const orders = await db.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get total count
    const total = await db.order.count({ where });

    // Calculate statistics
    const stats = await db.order.groupBy({
      by: ['status'],
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    });

    const completedOrders = await db.order.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats,
      recentOrders: completedOrders
    });

  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, status = 'PENDING', description } = body;

    if (!userId || !amount) {
      return NextResponse.json(
        { success: false, error: 'userId and amount are required' },
        { status: 400 }
      );
    }

    // Create order
    const order = await db.order.create({
      data: {
        userId,
        amount,
        status,
        description: description || `Order for user ${userId}`
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}