import { NextRequest, NextResponse } from 'next/server';

const PTERODACTYL_CLIENT_API_KEY = 'ptlc_kkZU6BTInFCz9TRa7YhWHHV2fIRhYjCmFcEQkJ9gijo';
const PTERODACTYL_PANEL_URL = 'https://panel.androwproject.cloud';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serverId, action } = body;

    if (!serverId || !action) {
      return NextResponse.json(
        { error: 'Server ID and action are required' },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ['start', 'stop', 'restart', 'kill'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be one of: ' + validActions.join(', ') },
        { status: 400 }
      );
    }

    console.log(`Attempting to ${action} server ${serverId} using Client API`);

    // Use Client API endpoint
    const apiUrl = `${PTERODACTYL_PANEL_URL}/api/client/servers/${serverId}/power`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_CLIENT_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signal: action === 'kill' ? 'kill' : action
      })
    });

    console.log('Client API Response Status:', response.status);
    console.log('Client API Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Client API Response Body:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { message: responseText };
      }

      console.error('Client API Error:', errorData);

      return NextResponse.json(
        { 
          error: 'Failed to control server',
          details: errorData,
          status: response.status,
          serverId,
          action
        },
        { status: response.status }
      );
    }

    let resultData;
    try {
      resultData = JSON.parse(responseText);
    } catch (e) {
      resultData = { message: responseText };
    }

    console.log('Server control successful:', resultData);

    return NextResponse.json({
      success: true,
      message: `Server ${action} command sent successfully`,
      data: resultData,
      serverId,
      action
    });

  } catch (error) {
    console.error('Server control error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}