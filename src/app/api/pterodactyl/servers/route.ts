import { NextRequest, NextResponse } from 'next/server';
import { insecureFetch } from '@/lib/fetch-ssl';

export async function GET(request: NextRequest) {
  console.log('=== PTERODACTYL SERVERS API CALLED AT:', new Date().toISOString(), '===');
  
  try {
    const { searchParams } = new URL(request.url);
    const panelUrl = searchParams.get('panelUrl') || process.env.PTERODACTYL_URL;
    const apiKey = searchParams.get('apiKey') || process.env.PTERODACTYL_API_KEY;

    if (!panelUrl || !apiKey) {
      return NextResponse.json(
        { error: 'Panel URL and API key are required' },
        { status: 400 }
      );
    }

    console.log('Using panel URL:', panelUrl);
    console.log('Using API key:', apiKey.substring(0, 10) + '...');

    // Fetch servers from Pterodactyl Application API
    const response = await insecureFetch(`${panelUrl}/api/application/servers?include=allocations,location,node,user`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'Application/vnd.pterodactyl.v1+json',
        'Content-Type': 'application/json',
        'User-Agent': 'A&S-Studio-Pterodactyl-Integration/1.0'
      },
    });

    if (!response.ok) {
      console.error('Pterodactyl API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your Pterodactyl Application API key.' },
          { status: 401 }
        );
      } else if (response.status === 403) {
        return NextResponse.json(
          { error: 'Access denied. API key may not have sufficient permissions.' },
          { status: 403 }
        );
      }
      
      throw new Error(`Failed to fetch servers: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw Pterodactyl response:', JSON.stringify(data, null, 2));
    
    const servers = data.data || [];
    console.log(`Found ${servers.length} servers from Pterodactyl panel`);

    if (servers.length === 0) {
      console.log('No servers found in Pterodactyl panel');
      return NextResponse.json({
        success: true,
        servers: [],
        message: 'No servers found in Pterodactyl panel'
      });
    }

    // Process servers with real data from Pterodactyl
    const serversWithStatus = servers.map((server: any) => {
      const attributes = server.attributes;
      const relationships = attributes.relationships || {};
      const allocation = relationships.allocations?.data?.[0]?.attributes || {};
      const node = relationships.node?.data?.attributes || {};
      const user = relationships.user?.data?.attributes || {};
      
      console.log(`Processing server: ${attributes.name}`);
      console.log(`  - Status: ${attributes.status || 'unknown'}`);
      console.log(`  - Limits:`, attributes.limits);
      console.log(`  - Allocation: ${allocation.ip}:${allocation.port}`);
      console.log(`  - Node: ${node.name || 'Unknown'}`);
      
      // Get server status - Pterodactyl doesn't provide real-time status in Application API
      // We'll use the server's current state from the attributes or default to running for demo
      let status = attributes.status || 'running';
      
      // Create the server object with real Pterodactyl data
      const result = {
        id: attributes.id.toString(),
        pteroId: attributes.id.toString(),
        external_id: attributes.external_id,
        uuid: attributes.uuid,
        identifier: attributes.identifier,
        name: attributes.name,
        description: attributes.description || 'Server Pterodactyl',
        status: status,
        current_state: status,
        suspended: attributes.suspended || false,
        limits: attributes.limits || { memory: 4096, disk: 20480, cpu: 100 },
        feature_limits: attributes.feature_limits || { databases: 1, allocations: 1, backups: 1 },
        user: attributes.user,
        node: attributes.node,
        allocation: attributes.allocation,
        nest: attributes.nest,
        egg: attributes.egg,
        container: attributes.container || { environment: {} },
        updated_at: attributes.updated_at,
        created_at: attributes.created_at,
        relationships: relationships,
        
        // Additional fields for our frontend
        node_name: node.name || 'Node 1',
        allocation_ip: allocation.ip || '127.0.0.1',
        allocation_port: allocation.port || 30120,
        allocation_alias: allocation.ip_alias || null,
        user_email: user.email || 'admin@example.com',
        user_name: user.username || 'admin',
        
        // Resource data (will be fetched separately or generated)
        resources: null,
        isRealData: true,
        dataSource: 'pterodactyl_api'
      };
      
      return result;
    });
    
    console.log(`Successfully processed ${serversWithStatus.length} servers from Pterodactyl panel`);
    
    return NextResponse.json({
      success: true,
      servers: serversWithStatus,
      total: servers.length,
      source: 'pterodactyl_api',
      panel_url: panelUrl,
      timestamp: new Date().toISOString()
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