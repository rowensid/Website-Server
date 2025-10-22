import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Delete all data in order
    await db.order.deleteMany({})
    await db.service.deleteMany({})
    await db.session.deleteMany({})
    await db.user.deleteMany({})

    return NextResponse.json({ message: 'Database reset successfully' })
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 })
  }
}
