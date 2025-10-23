import { NextRequest, NextResponse } from 'next/server';

const PTERODACTYL_CLIENT_API_KEY = 'ptlc_kkZU6BTInFCz9TRa7YhWHHV2fIRhYjCmFcEQkJ9gijo';
const PTERODACTYL_PANEL_URL = 'https://panel.frostyxgaming.xyz';

export async function GET() {
  try {
    console.log('Fetching servers from Pterodactyl Client API');

    // Use Client API endpoint to list servers
    const apiUrl = `${PTERODACTYL_PANEL_URL}/api/client`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_CLIENT_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
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
          error: 'Failed to fetch servers',
          details: errorData,
          status: response.status
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

    console.log('Servers fetched successfully:', resultData);

    return NextResponse.json({
      success: true,
      data: resultData
    });

  } catch (error) {
    console.error('List servers error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}