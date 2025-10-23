import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    console.log('Starting database seeding...');
    
    // Create admin user with your data
    const hashedPassword = await bcrypt.hash('Aberzz2802', 10);
    console.log('Password hashed');
    
    const adminUser = await db.user.upsert({
      where: { email: 'rowensid2802@gmail.com' },
      update: {
        isActive: true,
        lastLoginAt: new Date()
      },
      create: {
        email: 'rowensid2802@gmail.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        lastLoginAt: new Date()
      }
    });
    
    console.log('Admin user created:', adminUser.email);

    // Create sample services
    const services = [
      {
        name: 'AMERTA ROLEPLAY V1.5',
        type: 'GAME_HOSTING' as const,
        status: 'ACTIVE' as const,
        price: 150000,
        ip: '103.42.116.70',
        port: 30111,
        description: 'FiveM server hosting premium',
        userId: adminUser.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      },
      {
        name: 'FELAVITO ROLEPLAY',
        type: 'GAME_HOSTING' as const,
        status: 'ACTIVE' as const,
        price: 150000,
        ip: '103.42.116.172',
        port: 30120,
        description: 'FiveM server with custom scripts',
        userId: adminUser.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'MEDAN CITY ROLEPLAY',
        type: 'GAME_HOSTING' as const,
        status: 'ACTIVE' as const,
        price: 150000,
        ip: '103.42.116.172',
        port: 30121,
        description: 'FiveM server for Indonesian community',
        userId: adminUser.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'RDP Premium 1',
        type: 'RDP' as const,
        status: 'ACTIVE' as const,
        price: 100000,
        ip: '192.168.1.100',
        port: 3389,
        description: 'Windows RDP with high specs',
        userId: adminUser.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'FiveM Development Package',
        type: 'FIVEM_DEVELOPMENT' as const,
        status: 'ACTIVE' as const,
        price: 500000,
        description: 'Custom FiveM scripts development',
        userId: adminUser.id,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      }
    ];

    console.log('Creating services...');
    const createdServices = [];
    for (const serviceData of services) {
      const service = await db.service.create({
        data: serviceData
      });
      createdServices.push(service);
      console.log('Service created:', service.name);
    }

    // Create sample orders
    const orders = [
      {
        userId: adminUser.id,
        serviceId: createdServices[0].id,
        amount: 150000,
        status: 'COMPLETED' as const,
        paymentMethod: 'Transfer Bank'
      },
      {
        userId: adminUser.id,
        serviceId: createdServices[1].id,
        amount: 150000,
        status: 'COMPLETED' as const,
        paymentMethod: 'E-Wallet'
      },
      {
        userId: adminUser.id,
        serviceId: createdServices[2].id,
        amount: 150000,
        status: 'COMPLETED' as const,
        paymentMethod: 'Transfer Bank'
      },
      {
        userId: adminUser.id,
        serviceId: createdServices[3].id,
        amount: 100000,
        status: 'COMPLETED' as const,
        paymentMethod: 'QRIS'
      },
      {
        userId: adminUser.id,
        serviceId: createdServices[4].id,
        amount: 500000,
        status: 'COMPLETED' as const,
        paymentMethod: 'Transfer Bank'
      }
    ];

    console.log('Creating orders...');
    const createdOrders = [];
    for (const orderData of orders) {
      const order = await db.order.create({
        data: orderData
      });
      createdOrders.push(order);
      console.log('Order created:', order.amount);
    }

    const totalRevenue = createdOrders.reduce((sum, order) => sum + order.amount, 0);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully for admin user!',
      data: {
        user: {
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          isActive: adminUser.isActive
        },
        services: createdServices.length,
        orders: createdOrders.length,
        totalRevenue: totalRevenue
      }
    });
  } catch (error: any) {
    console.error('Database seeding error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}