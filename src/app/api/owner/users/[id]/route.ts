import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, email, role, isActive } = body

    const user = await db.user.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      }
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}