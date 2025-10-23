import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { panelUrl, bypassToken, apiKey } = await request.json();
    
    if (!panelUrl || (!bypassToken && !apiKey)) {
      return NextResponse.json({
        success: false,
        error: 'Panel URL and either Bypass Token or API Key are required'
      }, { status: 400 });
    }

    // Use API key if provided, otherwise use bypass token
    const token = apiKey || bypassToken;

    // Test connection to Pterodactyl panel
    const testResponse = await fetch(`${panelUrl}/api/application/servers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'A&S-Studio-Pterodactyl-Bypass/1.0',
      },
    });

    if (!testResponse.ok) {
      console.error('Pterodactyl connection test failed:', testResponse.status, testResponse.statusText);
      
      // Check if it's HTML (Cloudflare protection)
      const contentType = testResponse.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        return NextResponse.json({
          success: false,
          error: `Cloudflare protection detected on panel ${panelUrl}`,
          details: {
            status: testResponse.status,
            statusText: testResponse.statusText,
            needsBypass: true
          }
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: false,
        error: `Failed to connect to Pterodactyl panel: ${testResponse.status} - ${testResponse.statusText}`,
        details: {
          status: testResponse.status,
          statusText: testResponse.statusText
        }
      }, { status: 400 });
    }

    let data;
    try {
      data = await testResponse.json();
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON response from Pterodactyl panel',
        details: {
          status: testResponse.status,
          statusText: testResponse.statusText,
          contentType: testResponse.headers.get('content-type')
        }
      }, { status: 400 });
    }
    const servers = data.data || [];

    // Update environment variables (in production, this should be done more securely)
    process.env.PTERODACTYL_URL = panelUrl;
    if (apiKey) {
      process.env.PTERODACTYL_API_KEY = apiKey;
    }
    if (bypassToken) {
      process.env.PTERODACTYL_BYPASS_TOKEN = bypassToken;
    }

    console.log(`Successfully connected to Pterodactyl panel at ${panelUrl}`);
    console.log(`Found ${servers.length} servers`);

    return NextResponse.json({
      success: true,
      message: 'Pterodactyl panel connected successfully',
      config: {
        panelUrl,
        token: token.substring(0, 10) + '...'
      },
      servers: {
        count: servers.length,
        data: servers.map((server: any) => ({
          id: server.attributes.id,
          name: server.attributes.name,
          description: server.attributes.description,
          status: 'unknown'
        }))
      }
    });

  } catch (error) {
    console.error('Pterodactyl setup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to setup Pterodactyl panel',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const panelUrl = process.env.PTERODACTYL_URL;
    const bypassToken = process.env.PTERODACTYL_BYPASS_TOKEN;

    if (!panelUrl || !bypassToken) {
      return NextResponse.json({
        success: false,
        error: 'Pterodactyl panel not configured',
        config: {
          hasPanelUrl: !!panelUrl,
          hasBypassToken: !!bypassToken
        }
      }, { status: 400 });
    }

    // Test current configuration
    const testResponse = await fetch(`${panelUrl}/api/application/servers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bypassToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'A&S-Studio-Pterodactyl-Bypass/1.0',
      },
    });

    if (!testResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Current configuration is not working',
        details: {
          status: testResponse.status,
          statusText: testResponse.statusText
        }
      }, { status: 400 });
    }

    const data = await testResponse.json();
    const servers = data.data || [];

    return NextResponse.json({
      success: true,
      message: 'Pterodactyl panel is configured and working',
      config: {
        panelUrl,
        bypassToken: bypassToken.substring(0, 10) + '...'
      },
      servers: {
        count: servers.length,
        data: servers.map((server: any) => ({
          id: server.attributes.id,
          name: server.attributes.name,
          description: server.attributes.description,
          status: 'unknown'
        }))
      }
    });

  } catch (error) {
    console.error('Pterodactyl status check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check Pterodactyl status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}