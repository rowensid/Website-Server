import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Check total users
    const totalUsers = await db.user.count();
    const activeUsers = await db.user.count({ where: { isActive: true } });
    const adminUsers = await db.user.count({ where: { role: 'ADMIN' } });
    
    // Get all users
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true
      }
    });
    
    // Check services
    const totalServices = await db.service.count();
    const activeServices = await db.service.count({ where: { status: 'ACTIVE' } });
    
    // Check orders
    const totalOrders = await db.order.count();
    const completedOrders = await db.order.count({ where: { status: 'COMPLETED' } });
    
    // Check Pterodactyl servers
    const totalPteroServers = await db.pterodactylServer.count();
    const activePteroServers = await db.pterodactylServer.count({ 
      where: { suspended: false } 
    });

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admin: adminUsers,
          list: users
        },
        services: {
          total: totalServices,
          active: activeServices
        },
        orders: {
          total: totalOrders,
          completed: completedOrders
        },
        pteroServers: {
          total: totalPteroServers,
          active: activePteroServers
        }
      }
    });
  } catch (error: any) {
    console.error('Database check error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}