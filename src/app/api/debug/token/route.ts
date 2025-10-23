import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    console.log('=== TOKEN DEBUG ===')
    
    // 检查token
    const token = request.cookies.get('auth-token')?.value
    console.log('Token from cookie:', token ? 'EXISTS' : 'MISSING')
    
    if (!token) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 })
    }
    
    try {
      // 尝试验证token
      const decoded = jwt.verify(token, JWT_SECRET) as any
      console.log('Token decoded successfully:', decoded)
      
      // 查找用户
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true
        }
      })
      
      console.log('User found:', user ? { id: user.id, email: user.email, role: user.role, isActive: user.isActive } : 'NOT FOUND')
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 })
      }
      
      if (!user.isActive) {
        return NextResponse.json({ error: 'User is inactive' }, { status: 401 })
      }
      
      return NextResponse.json({
        success: true,
        user,
        decoded
      })
      
    } catch (jwtError: any) {
      console.log('JWT verification failed:', jwtError.message)
      return NextResponse.json({ 
        error: 'JWT verification failed', 
        message: jwtError.message 
      }, { status: 401 })
    }
    
  } catch (error: any) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ 
      error: 'Debug error', 
      message: error.message 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATING NEW TOKEN ===')
    
    // 创建新的token用于测试
    const adminUser = await db.user.findUnique({
      where: { email: 'rowensid2802@gmail.com' }
    })
    
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 })
    }
    
    const token = jwt.sign(
      { 
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    console.log('New token created for user:', adminUser.email)
    
    // 设置cookie并返回
    const response = NextResponse.json({
      success: true,
      message: 'New token created',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role
      }
    })
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })
    
    return response
    
  } catch (error: any) {
    console.error('Create token error:', error)
    return NextResponse.json({ 
      error: 'Create token error', 
      message: error.message 
    }, { status: 500 })
  }
}