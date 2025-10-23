import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiToken, zoneId, email, globalApiKey } = await request.json();
    
    if (!apiToken && !globalApiKey) {
      return NextResponse.json({
        success: false,
        error: 'Either API Token or Global API Key is required'
      }, { status: 400 });
    }

    // Test Cloudflare API connection
    let testUrl = 'https://api.cloudflare.com/client/v4/user/tokens/verify';
    let headers: any = {
      'Content-Type': 'application/json',
    };

    if (apiToken) {
      headers['Authorization'] = `Bearer ${apiToken}`;
    } else if (globalApiKey && email) {
      headers['X-Auth-Email'] = email;
      headers['X-Auth-Key'] = globalApiKey;
      testUrl = 'https://api.cloudflare.com/client/v4/user';
    }

    const testResponse = await fetch(testUrl, {
      method: 'GET',
      headers,
    });

    if (!testResponse.ok) {
      console.error('Cloudflare API test failed:', testResponse.status, testResponse.statusText);
      return NextResponse.json({
        success: false,
        error: `Failed to connect to Cloudflare API: ${testResponse.status} - ${testResponse.statusText}`,
        details: {
          status: testResponse.status,
          statusText: testResponse.statusText
        }
      }, { status: 400 });
    }

    const data = await testResponse.json();
    
    // Update environment variables (in production, this should be done more securely)
    if (apiToken) {
      process.env.CLOUDFLARE_API_TOKEN = apiToken;
    }
    if (zoneId) {
      process.env.CLOUDFLARE_ZONE_ID = zoneId;
    }
    if (email) {
      process.env.CLOUDFLARE_EMAIL = email;
    }
    if (globalApiKey) {
      process.env.CLOUDFLARE_GLOBAL_API_KEY = globalApiKey;
    }

    console.log('Successfully connected to Cloudflare API');

    return NextResponse.json({
      success: true,
      message: 'Cloudflare API connected successfully',
      config: {
        apiToken: apiToken ? apiToken.substring(0, 10) + '...' : 'Not Set',
        zoneId: zoneId || 'Not Set',
        email: email || 'Not Set',
        globalApiKey: globalApiKey ? globalApiKey.substring(0, 10) + '...' : 'Not Set'
      },
      user: data.result || null
    });

  } catch (error) {
    console.error('Cloudflare setup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to setup Cloudflare API',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    const email = process.env.CLOUDFLARE_EMAIL;
    const globalApiKey = process.env.CLOUDFLARE_GLOBAL_API_KEY;

    if (!apiToken && !globalApiKey) {
      return NextResponse.json({
        success: false,
        error: 'Cloudflare API not configured',
        config: {
          hasApiToken: !!apiToken,
          hasZoneId: !!zoneId,
          hasEmail: !!email,
          hasGlobalApiKey: !!globalApiKey
        }
      }, { status: 400 });
    }

    // Test current configuration
    let testUrl = 'https://api.cloudflare.com/client/v4/user/tokens/verify';
    let headers: any = {
      'Content-Type': 'application/json',
    };

    if (apiToken) {
      headers['Authorization'] = `Bearer ${apiToken}`;
    } else if (globalApiKey && email) {
      headers['X-Auth-Email'] = email;
      headers['X-Auth-Key'] = globalApiKey;
      testUrl = 'https://api.cloudflare.com/client/v4/user';
    }

    const testResponse = await fetch(testUrl, {
      method: 'GET',
      headers,
    });

    if (!testResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Current Cloudflare configuration is not working',
        details: {
          status: testResponse.status,
          statusText: testResponse.statusText
        }
      }, { status: 400 });
    }

    const data = await testResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Cloudflare API is configured and working',
      config: {
        apiToken: apiToken ? apiToken.substring(0, 10) + '...' : 'Not Set',
        zoneId: zoneId || 'Not Set',
        email: email || 'Not Set',
        globalApiKey: globalApiKey ? globalApiKey.substring(0, 10) + '...' : 'Not Set'
      },
      user: data.result || null
    });

  } catch (error) {
    console.error('Cloudflare status check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check Cloudflare status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}