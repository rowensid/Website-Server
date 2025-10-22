import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { serviceId } = params
    const { action } = await request.json()

    console.log(`API: Performing action "${action}" on service ${serviceId}`)

    // Find the service
    const service = await db.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Update service status based on action
    let newStatus: string
    switch (action) {
      case 'start':
        newStatus = 'ACTIVE'
        break
      case 'stop':
        newStatus = 'INACTIVE'
        break
      case 'restart':
        newStatus = 'ACTIVE'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Update service status
    const updatedService = await db.service.update({
      where: { id: serviceId },
      data: { 
        status: newStatus,
        updatedAt: new Date()
      }
    })

    console.log(`API: Service ${serviceId} status updated to ${newStatus}`)

    return NextResponse.json({
      success: true,
      service: updatedService,
      action: action,
      newStatus: newStatus
    })
  } catch (error) {
    console.error('API: Error performing service action:', error)
    return NextResponse.json(
      { error: 'Failed to perform service action' },
      { status: 500 }
    )
  }
}