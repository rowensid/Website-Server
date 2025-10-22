import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Delete all existing data first
    await db.order.deleteMany({})
    await db.service.deleteMany({})
    await db.user.deleteMany({})
    
    // Create simple test data
    const hashedPassword = await bcrypt.hash('password123', 10)
    
    // Create owner account
    const owner = await db.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        isActive: true
      }
    })

    // Create demo member account
    const member = await db.user.create({
      data: {
        email: 'user@example.com',
        name: 'Demo Member',
        password: await bcrypt.hash('user123', 10),
        role: 'USER',
        isActive: true
      }
    })
    
    // Create existing owner account
    const existingOwner = await db.user.create({
      data: {
        email: 'rowensid2802@gmail.com',
        name: 'Rowens ID - Owner',
        password: await bcrypt.hash('Aberzz2802', 10),
        role: 'ADMIN',
        isActive: true
      }
    })
    
    // Create sample services
    await db.service.create({
      data: {
        name: 'Game Hosting Server',
        type: 'GAME_HOSTING',
        status: 'ACTIVE',
        price: 150000,
        userId: member.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        config: {
          slots: 32,
          location: 'Singapore',
          game: 'FiveM'
        }
      }
    })

    await db.service.create({
      data: {
        name: 'RDP Premium',
        type: 'RDP',
        status: 'ACTIVE',
        price: 200000,
        userId: member.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        config: {
          cpu: '4 Cores',
          ram: '8GB',
          storage: '100GB SSD'
        }
      }
    })

    // Create sample orders
    await db.order.createMany({
      data: [
        {
          userId: member.id,
          amount: 150000,
          status: 'COMPLETED',
          paymentMethod: 'TRANSFER'
        },
        {
          userId: member.id,
          amount: 200000,
          status: 'COMPLETED',
          paymentMethod: 'E-WALLET'
        }
      ]
    })

    // Create just 2 additional users
    for (let i = 0; i < 2; i++) {
      await db.user.create({
        data: {
          email: `user${i + 4}@example.com`,
          name: `User ${i + 4}`,
          password: hashedPassword,
          role: 'USER',
          isActive: true,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random within last 7 days
        }
      })
    }

    // Create just 1 additional service
    await db.service.create({
      data: {
        name: 'Additional Service',
        type: 'GAME_HOSTING',
        status: 'ACTIVE',
        price: 250000,
        userId: member.id,
        expiresAt: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }
    })

    return NextResponse.json({
      message: 'Demo accounts created successfully',
      accounts: [
        {
          email: 'admin@example.com',
          password: 'admin123',
          role: 'ADMIN',
          access: ['owner-panel', 'manage-server', 'member-dashboard']
        },
        {
          email: 'user@example.com', 
          password: 'user123',
          role: 'USER',
          access: ['member-dashboard']
        },
        {
          email: 'rowensid2802@gmail.com',
          password: 'Aberzz2802',
          role: 'ADMIN',
          access: ['owner-panel', 'manage-server', 'member-dashboard']
        }
      ],
      stats: {
        users: 3,
        services: 2,
        orders: 2
      }
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to create sample data' },
      { status: 500 }
    )
  }
}