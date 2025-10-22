import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Get all active services that need billing this month
    const activeServices = await db.service.findMany({
      where: {
        status: 'ACTIVE',
        expiresAt: {
          lte: new Date(currentYear, currentMonth + 1, 1) // Next month 1st
        }
      },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        }
      }
    })

    const generatedInvoices = []

    for (const service of activeServices) {
      // Check if already billed this month
      const existingOrder = await db.order.findFirst({
        where: {
          userId: service.userId,
          serviceId: service.id,
          createdAt: {
            gte: new Date(currentYear, currentMonth, 1),
            lt: new Date(currentYear, currentMonth + 1, 1)
          }
        }
      })

      if (!existingOrder) {
        // Generate new order for this month
        const newOrder = await db.order.create({
          data: {
            userId: service.userId,
            serviceId: service.id,
            amount: service.price,
            status: 'PENDING',
            paymentMethod: 'Bank Transfer',
            createdAt: new Date()
          }
        })

        // Update service expiry
        await db.service.update({
          where: { id: service.id },
          data: {
            expiresAt: new Date(currentYear, currentMonth + 2, 1) // Next next month
          }
        })

        generatedInvoices.push({
          id: newOrder.id,
          customer: service.user.name,
          service: service.name,
          amount: service.price,
          dueDate: new Date(currentYear, currentMonth + 1, 1)
        })
      }
    }

    return NextResponse.json({
      message: `Generated ${generatedInvoices.length} invoices`,
      invoices: generatedInvoices
    })

  } catch (error) {
    console.error('Billing generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoices' },
      { status: 500 }
    )
  }
}