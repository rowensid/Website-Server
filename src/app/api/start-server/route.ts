import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('=== START SERVER API CALLED ===')
  
  return NextResponse.json({
    message: 'Start server API working!',
    timestamp: new Date().toISOString()
  })
}