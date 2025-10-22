import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user data
    const userData = await db.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's servers count
    const totalServers = await db.server.count({
      where: { userId: user.userId }
    });

    // Get user's orders count and total spent
    const orders = await db.order.findMany({
      where: { userId: user.userId },
      select: {
        amount: true,
        status: true
      }
    });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);

    const userWithStats = {
      ...userData,
      totalServers,
      totalOrders,
      totalSpent
    };

    return NextResponse.json({ user: userWithStats });

  } catch (error) {
    console.error('Error fetching member profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}