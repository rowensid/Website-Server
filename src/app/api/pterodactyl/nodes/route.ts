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

    // Test connection to Pterodactyl API
    const response = await fetch(`${panelUrl}/api/application/nodes`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      nodes: data.data || [],
      message: 'Connection successful'
    });

  } catch (error) {
    console.error('Pterodactyl API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to connect to Pterodactyl panel',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}