import { NextRequest, NextResponse } from 'next/server';
import { insecureFetch } from '@/lib/fetch-ssl';

export async function POST(request: NextRequest) {
  try {
    const { panelUrl, apiKey, serverIdentifier } = await request.json();

    if (!panelUrl || !apiKey || !serverIdentifier) {
      return NextResponse.json(
        { error: 'Panel URL, API key, and server identifier are required' },
        { status: 400 }
      );
    }

    // Get real-time server resources and status
    const response = await insecureFetch(`${panelUrl}/api/client/servers/${serverIdentifier}/resources`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch server resources: ${response.status}`);
    }

    const data = await response.json();
    
    // Determine server status based on resources
    let status = 'offline';
    if (data.attributes) {
      const resources = data.attributes.resources;
      const currentState = data.attributes.current_state;
      
      if (currentState === 'running') {
        status = 'live';
      } else if (currentState === 'stopped') {
        status = 'offline';
      } else if (currentState === 'starting') {
        status = 'starting';
      } else if (currentState === 'stopping') {
        status = 'stopping';
      } else {
        // Fallback to resource usage detection
        if (resources && (resources.cpu_absolute > 0 || resources.memory_bytes > 0)) {
          status = 'live';
        }
      }
    }

    return NextResponse.json({
      success: true,
      status,
      resources: data.attributes?.resources || null,
      current_state: data.attributes?.current_state || null
    });

  } catch (error) {
    console.error('Real-time status check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get real-time status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}