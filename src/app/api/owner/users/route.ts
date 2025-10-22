import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

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

// Get all users (owner only)
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await db.user.findUnique({
      where: { id: user.userId },
      select: { role: true, isActive: true }
    });

    if (!currentUser || currentUser.role !== 'ADMIN' || !currentUser.isActive) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            services: true,
            orders: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate total spent for each user
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
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt?.toISOString(),
          createdAt: user.createdAt.toISOString(),
          servers: user._count.services,
          orders: user._count.orders,
          totalSpent: totalSpent._sum.amount || 0,
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new user (owner only)
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await db.user.findUnique({
      where: { id: user.userId },
      select: { role: true, isActive: true }
    });

    if (!currentUser || currentUser.role !== 'ADMIN' || !currentUser.isActive) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password } = createUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}