import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const createServerSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['GAME_HOSTING', 'RDP', 'FIVEM_DEVELOPMENT', 'ROBLOX_DEVELOPMENT']),
  customerEmail: z.string().email(),
  specs: z.string().min(1),
  location: z.string().min(1),
  price: z.number().min(0),
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

// Get all servers (owner only)
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

    const servers = await db.service.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        },
        orders: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      servers: servers.map(server => ({
        id: server.id,
        name: server.name,
        type: server.type,
        status: server.status,
        price: server.price,
        config: server.config,
        userId: server.userId,
        expiresAt: server.expiresAt?.toISOString(),
        createdAt: server.createdAt.toISOString(),
        updatedAt: server.updatedAt.toISOString(),
        user: server.user,
        orders: server.orders
      }))
    });

  } catch (error) {
    console.error('Get servers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new server (owner only)
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
    const { name, type, customerEmail, specs, location, price } = createServerSchema.parse(body);

    // Find customer by email
    const customer = await db.user.findUnique({
      where: { email: customerEmail }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Create server
    const server = await db.service.create({
      data: {
        name,
        type,
        price,
        userId: customer.id,
        status: 'PENDING',
        config: {
          specs,
          location,
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Server created successfully',
      server: {
        id: server.id,
        name: server.name,
        type: server.type,
        status: server.status,
        price: server.price,
        specs: server.config?.specs || '',
        location: server.config?.location || '',
        customer: server.user.email,
        customerName: server.user.name,
        expiresAt: server.expiresAt?.toISOString(),
        createdAt: server.createdAt.toISOString(),
      }
    });

  } catch (error) {
    console.error('Create server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}