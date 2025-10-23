import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { serverIp, serverPort } = await request.json();

    if (!serverIp || !serverPort) {
      return NextResponse.json(
        { error: 'Server IP and port are required' },
        { status: 400 }
      );
    }

    // Check if server is running by attempting to connect to the port
    // This is a simple TCP connection check
    const status = await checkServerPort(serverIp, parseInt(serverPort));

    return NextResponse.json({
      success: true,
      status: status ? 'live' : 'offline',
      isRealData: true
    });

  } catch (error) {
    console.error('Server status check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check server status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function checkServerPort(ip: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    // Use a simple fetch with timeout to check if the server is responding
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    fetch(`http://${ip}:${port}`, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors' // This will allow CORS errors but still tell us if server is up
    })
    .then(() => {
      clearTimeout(timeoutId);
      resolve(true);
    })
    .catch(() => {
      clearTimeout(timeoutId);
      // Even if it fails (CORS or connection error), the server might be up
      // Let's try a different approach
      resolve(false);
    });
  });
}