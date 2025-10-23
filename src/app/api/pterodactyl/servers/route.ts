import { NextRequest, NextResponse } from 'next/server';
import { insecureFetch } from '@/lib/fetch-ssl';

export async function GET(request: NextRequest) {
  console.log('=== PTERODACTYL SERVERS API CALLED AT:', new Date().toISOString(), '===');
  
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
    const response = await insecureFetch(`${panelUrl}/api/application/servers?include=allocations,location,node`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch servers: ${response.status}`);
    }

    const data = await response.json();
    const servers = data.data || [];

    // Process servers with real-time status
    const serversWithStatus = servers.map((server: any) => {
      const attributes = server.attributes;
      const relationships = attributes.relationships || {};
      
      // Determine status based on server description and other indicators
      // Since we can't access real-time resources with application API,
      // we'll use a different approach
      let status = 'offline';
      
      // Check if server has any allocation information that might indicate it's running
      if (relationships.allocations?.data && relationships.allocations.data.length > 0) {
        // Find the default allocation or use the first one
        const defaultAllocation = relationships.allocations.data[0];
        
        if (defaultAllocation && defaultAllocation.attributes) {
          // Server has network allocation - could be running
          // We'll mark it as unknown for now, and let the frontend handle the real-time check
          status = 'unknown';
        }
      }

      // Create the result without spreading attributes first to avoid conflicts
      const firstAllocation = relationships.allocations?.data?.[0];
      const result = {
        id: attributes.id,
        external_id: attributes.external_id,
        uuid: attributes.uuid,
        identifier: attributes.identifier,
        name: attributes.name,
        description: attributes.description,
        status: status,
        current_state: status,
        suspended: attributes.suspended,
        limits: attributes.limits,
        feature_limits: attributes.feature_limits,
        user: attributes.user,
        node: attributes.node,
        allocation: attributes.allocation,
        nest: attributes.nest,
        egg: attributes.egg,
        container: attributes.container,
        updated_at: attributes.updated_at,
        created_at: attributes.created_at,
        relationships: relationships, // Keep relationships for reference
        resources: null,
        isRealData: false,
        // Add allocation info for manual checking
        primaryAllocation: firstAllocation,
        testAllocation: { test: 'test value' }
      };
      
      // Debug: log the primaryAllocation
      console.log(`Server ${attributes.name}: firstAllocation =`, JSON.stringify(firstAllocation, null, 2));
      console.log(`Server ${attributes.name}: result.primaryAllocation =`, JSON.stringify(result.primaryAllocation, null, 2));
      
      return result;
    });
    
    return NextResponse.json({
      success: true,
      servers: serversWithStatus
    });

  } catch (error) {
    console.error('Pterodactyl servers API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch servers from Pterodactyl panel',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}