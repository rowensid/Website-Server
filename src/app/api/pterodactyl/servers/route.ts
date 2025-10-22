import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const panelUrl = searchParams.get('panelUrl');
    const apiKey = searchParams.get('apiKey');

    if (!panelUrl || !apiKey) {
      return NextResponse.json(
        { error: 'Panel URL and API key are required' },
        { status: 400 }
      );
    }

    // Fetch servers from Pterodactyl API
    const response = await fetch(`${panelUrl}/api/application/servers?include=allocations,location,node`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch servers: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      servers: data.data || []
    });

  } catch (error) {
    console.error('Pterodactyl servers API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch servers from Pterodactyl panel',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}