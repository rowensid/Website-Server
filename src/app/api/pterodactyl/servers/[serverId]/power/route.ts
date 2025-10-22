import { NextRequest, NextResponse } from 'next/server';
import { createPterodactylClient } from '@/lib/pterodactyl';

export async function POST(
  request: NextRequest,
  { params }: { params: { serverId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const panelUrl = searchParams.get('panelUrl');
    const apiKey = searchParams.get('apiKey');
    const { signal } = await request.json();

    if (!panelUrl || !apiKey || !signal) {
      return NextResponse.json(
        { error: 'Panel URL, API key, and signal are required' },
        { status: 400 }
      );
    }

    const pterodactyl = createPterodactylClient({ panelUrl, apiKey });

    switch (signal) {
      case 'start':
        await pterodactyl.startServer(params.serverId);
        break;
      case 'stop':
        await pterodactyl.stopServer(params.serverId);
        break;
      case 'restart':
        await pterodactyl.restartServer(params.serverId);
        break;
      case 'kill':
        await pterodactyl.killServer(params.serverId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid signal. Must be start, stop, restart, or kill' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pterodactyl server power API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform power action on server' },
      { status: 500 }
    );
  }
}