import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Update server
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, status, price, specs, location } = body

    const server = await db.service.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(price && { price }),
        ...(specs || location) && {
          config: {
            ...(specs && { specs }),
            ...(location && { location }),
          }
        }
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
    })

    return NextResponse.json({
      message: 'Server updated successfully',
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
    })

  } catch (error) {
    console.error('Update server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete server
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.service.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Server deleted successfully'
    })

  } catch (error) {
    console.error('Delete server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}