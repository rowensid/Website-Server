import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('🔍 DEBUG LOG:', body.message);
    console.log('🔍 DEBUG DATA:', JSON.stringify(body.data, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('🔍 DEBUG LOG ERROR:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}