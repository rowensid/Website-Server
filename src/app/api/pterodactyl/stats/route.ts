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
    const serversResponse = await fetch(`${panelUrl}/api/application/servers`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!serversResponse.ok) {
      throw new Error(`Failed to fetch servers: ${serversResponse.status}`);
    }

    const serversData = await serversResponse.json();
    const servers = serversData.data || [];

    // Calculate statistics
    const totalServers = servers.length;
    const activeServers = servers.filter((server: any) => server.attributes.status === 'running').length;
    const suspendedServers = servers.filter((server: any) => server.attributes.status === 'suspended').length;

    // Calculate memory usage
    const totalMemory = servers.reduce((sum: number, server: any) => 
      sum + (server.attributes.limits.memory || 0), 0
    );
    const usedMemory = servers.reduce((sum: number, server: any) => 
      sum + (server.attributes.resources?.memory?.current || 0), 0
    );

    // Calculate disk usage
    const totalDisk = servers.reduce((sum: number, server: any) => 
      sum + (server.attributes.limits.disk || 0), 0
    );
    const usedDisk = servers.reduce((sum: number, server: any) => 
      sum + (server.attributes.resources?.disk?.current || 0), 0
    );

    return NextResponse.json({
      totalServers,
      activeServers,
      suspendedServers,
      totalMemory,
      usedMemory,
      totalDisk,
      usedDisk
    });

  } catch (error) {
    console.error('Pterodactyl stats API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Pterodactyl statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}