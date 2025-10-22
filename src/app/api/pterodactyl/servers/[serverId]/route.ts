import { NextRequest, NextResponse } from 'next/server';
import { createPterodactylClient } from '@/lib/pterodactyl';

export async function GET(
  request: NextRequest,
  { params }: { params: { serverId: string } }
) {
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

    const pterodactyl = createPterodactylClient({ panelUrl, apiKey });
    const server = await pterodactyl.getServer(params.serverId);

    return NextResponse.json(server);
  } catch (error) {
    console.error('Pterodactyl server API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server from Pterodactyl' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { serverId: string } }
) {
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

    const pterodactyl = createPterodactylClient({ panelUrl, apiKey });
    await pterodactyl.deleteServer(params.serverId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pterodactyl delete server API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete server from Pterodactyl' },
      { status: 500 }
    );
  }
}