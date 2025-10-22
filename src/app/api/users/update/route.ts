import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function PUT(request: NextRequest) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized - No token provided' },
        { status: 401 }
      )
    }

    // Verify token
    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      )
    }

    // Get request body
    const { name, avatar } = await request.json()

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { message: 'Nama tidak boleh kosong' },
        { status: 400 }
      )
    }

    if (name.length > 100) {
      return NextResponse.json(
        { message: 'Nama terlalu panjang. Maksimal 100 karakter' },
        { status: 400 }
      )
    }

    // Validate avatar if provided
    if (avatar) {
      // Check if it's a valid base64 image
      const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/
      if (!base64Regex.test(avatar)) {
        return NextResponse.json(
          { message: 'Format avatar tidak valid' },
          { status: 400 }
        )
      }

      // Check size (base64 string length * 0.75 ≈ bytes)
      const base64Data = avatar.split(',')[1]
      const imageSizeBytes = Math.round(base64Data.length * 0.75)
      const maxSizeBytes = 5 * 1024 * 1024 // 5MB

      if (imageSizeBytes > maxSizeBytes) {
        return NextResponse.json(
          { message: 'Ukuran avatar terlalu besar. Maksimal 5MB' },
          { status: 400 }
        )
      }
    }

    // Update user in database
    const updatedUser = await db.user.update({
      where: {
        id: decoded.userId
      },
      data: {
        name: name.trim(),
        avatar: avatar || null,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Format response
    const responseUser = {
      ...updatedUser,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString()
    }

    return NextResponse.json({
      message: 'Profil berhasil diperbarui',
      user: responseUser
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat memperbarui profil' },
      { status: 500 }
    )
  }
}