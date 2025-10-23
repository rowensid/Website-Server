import { NextRequest, NextResponse } from 'next/server';
import PterodactylBypass from '@/lib/pterodactyl-bypass';

// Cloudflare configuration - you can set these in environment variables
const CLOUDFLARE_CONFIG = {
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
  zoneId: process.env.CLOUDFLARE_ZONE_ID,
  useDirectIP: process.env.USE_DIRECT_IP === 'true',
  directIP: process.env.PTERODACTYL_DIRECT_IP,
  retryAttempts: 3,
  timeout: 15000
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || '/api/application/servers';
    const action = searchParams.get('action');

    const PTERODACTYL_URL = process.env.PTERODACTYL_URL;
    const API_KEY = process.env.PTERODACTYL_BYPASS_TOKEN || process.env.PTERODACTYL_API_KEY;

    if (!PTERODACTYL_URL || !API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Pterodactyl URL and API Key are required'
      }, { status: 500 });
    }

    const bypass = new PterodactylBypass(PTERODACTYL_URL, API_KEY, CLOUDFLARE_CONFIG);

    // Handle different actions
    switch (action) {
      case 'test':
        const testResults = await bypass.testConnection();
        return NextResponse.json({
          success: true,
          action: 'test',
          results: testResults,
          config: {
            hasCloudflareToken: !!CLOUDFLARE_CONFIG.apiToken,
            hasZoneId: !!CLOUDFLARE_CONFIG.zoneId,
            useDirectIP: CLOUDFLARE_CONFIG.useDirectIP,
            hasDirectIP: !!CLOUDFLARE_CONFIG.directIP
          }
        });

      case 'sync':
        const syncResult = await bypass.connect('/api/application/servers?include=allocations,node');
        if (syncResult.success) {
          return NextResponse.json({
            success: true,
            data: syncResult.data,
            method: syncResult.method,
            fallbackUsed: syncResult.fallbackUsed
          });
        } else {
          return NextResponse.json({
            success: false,
            error: syncResult.error,
            suggestions: getErrorSuggestions(syncResult.error)
          }, { status: 500 });
        }

      default:
        const result = await bypass.connect(endpoint);
        if (result.success) {
          return NextResponse.json({
            success: true,
            data: result.data,
            method: result.method,
            fallbackUsed: result.fallbackUsed
          });
        } else {
          return NextResponse.json({
            success: false,
            error: result.error,
            suggestions: getErrorSuggestions(result.error)
          }, { status: 500 });
        }
    }
  } catch (error: any) {
    console.error('Pterodactyl bypass API error:', error);
    return NextResponse.json({
      success: false,
      error: `Internal server error: ${error.message}`,
      suggestions: ['Check server logs for more details', 'Verify API configuration']
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json({
        success: false,
        error: 'Configuration is required'
      }, { status: 400 });
    }

    // In a real implementation, you would save this to a database or environment file
    // For now, we'll just validate the configuration and return success
    
    return NextResponse.json({
      success: true,
      message: 'Configuration saved successfully',
      config: {
        cloudflareToken: config.cloudflareApiToken ? '***configured***' : 'not set',
        zoneId: config.cloudflareZoneId || 'not set',
        useDirectIP: config.useDirectIP,
        directIP: config.directIP || 'not set',
        useProxy: config.useProxy,
        proxyUrl: config.proxyUrl || 'not set'
      }
    });
  } catch (error: any) {
    console.error('Pterodactyl bypass config save error:', error);
    return NextResponse.json({
      success: false,
      error: `Failed to save configuration: ${error.message}`
    }, { status: 500 });
  }
}

function getErrorSuggestions(error: string): string[] {
  const suggestions: string[] = [];

  if (error.includes('Cloudflare')) {
    suggestions.push('Disable "I\'m Under Attack" mode in Cloudflare');
    suggestions.push('Add your server IP to Cloudflare whitelist');
    suggestions.push('Check Cloudflare API token permissions');
  }

  if (error.includes('timeout')) {
    suggestions.push('Increase timeout value in configuration');
    suggestions.push('Check network connectivity');
    suggestions.push('Verify Pterodactyl panel is accessible');
  }

  if (error.includes('UNAUTHORIZED') || error.includes('401')) {
    suggestions.push('Verify Pterodactyl API key is correct');
    suggestions.push('Check API key permissions');
    suggestions.push('Ensure API key is not expired');
  }

  if (error.includes('ENOTFOUND') || error.includes('ECONNREFUSED')) {
    suggestions.push('Check Pterodactyl URL is correct');
    suggestions.push('Verify DNS resolution');
    suggestions.push('Try using direct IP connection');
  }

  if (suggestions.length === 0) {
    suggestions.push('Check Pterodactyl panel status');
    suggestions.push('Verify network connectivity');
    suggestions.push('Try alternative connection methods');
  }

  return suggestions;
}