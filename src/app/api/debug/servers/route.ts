import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const servers = await db.pterodactylServer.findMany({
      select: {
        id: true,
        pteroId: true,
        identifier: true,
        name: true,
        status: true
      }
    })

    return NextResponse.json({ 
      servers,
      count: servers.length 
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ error: 'Failed to fetch debug data' }, { status: 500 })
  }
}