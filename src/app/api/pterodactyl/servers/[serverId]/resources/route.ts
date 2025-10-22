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
    const resources = await pterodactyl.getServerResources(params.serverId);

    return NextResponse.json(resources);
  } catch (error) {
    console.error('Pterodactyl server resources API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch server resources from Pterodactyl' },
      { status: 500 }
    );
  }
}