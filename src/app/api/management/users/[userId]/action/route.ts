import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const { action } = await request.json()

    console.log(`API: Performing action "${action}" on user ${userId}`)

    // Find the user
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user based on action
    let updateData: any = {}
    
    switch (action) {
      case 'activate':
        updateData.isActive = true
        break
      case 'deactivate':
        updateData.isActive = false
        break
      case 'promote':
        updateData.role = 'ADMIN'
        break
      case 'demote':
        updateData.role = 'USER'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { 
        ...updateData,
        updatedAt: new Date()
      }
    })

    console.log(`API: User ${userId} updated with action ${action}`)

    return NextResponse.json({
      success: true,
      user: updatedUser,
      action: action
    })
  } catch (error) {
    console.error('API: Error performing user action:', error)
    return NextResponse.json(
      { error: 'Failed to perform user action' },
      { status: 500 }
    )
  }
}