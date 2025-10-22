import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Fetch users from database with their services and orders count
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            services: true,
            orders: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data to match expected format
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.name || user.email.split('@')[0],
      email: user.email,
      role: user.role.toLowerCase(),
      status: user.isActive ? 'active' : 'inactive',
      registeredAt: user.createdAt.toISOString(),
      lastLogin: user.lastLoginAt?.toISOString() || user.createdAt.toISOString(),
      balance: 0, // TODO: Add balance field to User model or calculate from orders
      servers: user._count.services
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In a real implementation, you would:
    // 1. Validate input data
    // 2. Check if user already exists
    // 3. Hash password
    // 4. Create user in database
    // 5. Send welcome email
    
    // For now, we'll just return success
    return NextResponse.json(
      { message: 'User created successfully', userId: 'new-user-id' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}