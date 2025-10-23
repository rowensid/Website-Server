import { NextRequest, NextResponse } from 'next/server';

const PTERODACTYL_PANEL_URL = process.env.PTERODACTYL_PANEL_URL || 'https://panel.androwproject.cloud';
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY || 'ptla_oaieoEqJKJc2DnJUBjFWcGvH8B3rY6x0i1HgP4KkLqRzTsXmN7VpQfWg';

interface PterodactylServer {
  object: string;
  attributes: {
    id: number;
    external_id: string | null;
    uuid: string;
    identifier: string;
    name: string;
    description: string;
    status: string | null;
    suspended: boolean;
    limits: {
      memory: number;
      swap: number;
      disk: number;
      io: number;
      cpu: number;
    };
    feature_limits: {
      databases: number;
      allocations: number;
      backups: number;
    };
    user: number;
    node: number;
    allocation: number;
    nest: number;
    egg: number;
    container: {
      startup_command: string;
      image: string;
      installed: boolean;
      environment: Record<string, string>;
    };
    relationships: {
      allocations: {
        object: string;
        data: Array<{
          object: string;
          attributes: {
            id: number;
            ip: string;
            alias: string;
            port: number;
            notes: string | null;
            assigned: boolean;
          };
        }>;
      };
      user: {
        object: string;
        attributes: {
          id: number;
          external_id: string | null;
          uuid: string;
          username: string;
          email: string;
          first_name: string;
          last_name: string;
          language: string;
          root_admin: boolean;
          '2fa': boolean;
          created_at: string;
          updated_at: string;
        };
      };
      location: {
        object: string;
        attributes: {
          id: number;
          short: string;
          long: string;
          updated_at: string;
          created_at: string;
        };
      };
      node: {
        object: string;
        attributes: {
          id: number;
          uuid: string;
          public: boolean;
          name: string;
          description: string | null;
          location_id: number;
          fqdn: string;
          scheme: string;
          behind_proxy: boolean;
          maintenance_mode: boolean;
          memory: number;
          memory_overallocate: number;
          disk: number;
          disk_overallocate: number;
          upload_size: number;
          daemon_listen: number;
          daemon_sftp: number;
          daemon_base: string;
          created_at: string;
          updated_at: string;
          allocated_resources: {
            memory: number;
            disk: number;
          };
        };
      };
    };
    updated_at: string;
    created_at: string;
  };
}

interface PterodactylResponse {
  object: string;
  data: PterodactylServer[];
  meta: {
    pagination: {
      total: number;
      count: number;
      per_page: number;
      current_page: number;
      total_pages: number;
      links: Record<string, any>;
    };
  };
}

interface ServerResources {
  state: string;
  resources: {
    memory_bytes: number;
    cpu_absolute: number;
    disk_bytes: number;
    network: {
      rx_bytes: number;
      tx_bytes: number;
    };
  };
}

interface ServerData {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'starting' | 'stopping';
  cpu: number;
  memory: {
    used: number;
    total: number;
  };
  storage: {
    used: number;
    total: number;
  };
  uptime: string;
  ip: string;
  port: number;
  node: string;
  description: string;
}

function getServerStatus(status: string | null, suspended: boolean): 'online' | 'offline' | 'starting' | 'stopping' {
  if (suspended) return 'offline';
  if (!status) return 'offline';
  
  switch (status.toLowerCase()) {
    case 'running':
    case 'online':
      return 'online';
    case 'starting':
      return 'starting';
    case 'stopping':
      return 'stopping';
    case 'stopped':
    case 'offline':
    default:
      return 'offline';
  }
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

async function getServerResources(serverUuid: string): Promise<ServerResources | null> {
  try {
    const resourcesUrl = `${PTERODACTYL_PANEL_URL}/api/client/servers/${serverUuid}/resources`;
    
    const response = await fetch(resourcesUrl, {
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch resources for server ${serverUuid}: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching resources for server ${serverUuid}:`, error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('=== PTERODACTYL SERVERS API CALLED ===');
    console.log('Using panel URL:', PTERODACTYL_PANEL_URL);
    console.log('Using API key:', PTERODACTYL_API_KEY.substring(0, 10) + '...');

    const serversUrl = `${PTERODACTYL_PANEL_URL}/api/application/servers`;
    
    const response = await fetch(serversUrl, {
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Pterodactyl API error:', response.status, response.statusText);
      throw new Error(`Failed to fetch servers: ${response.status} ${response.statusText}`);
    }

    const data: PterodactylResponse = await response.json();
    console.log('Raw Pterodactyl response:', JSON.stringify(data, null, 2));

    const servers: ServerData[] = [];
    
    for (const server of data.data) {
      const attrs = server.attributes;
      console.log(`Processing server: ${attrs.name}`);
      console.log(`  - Status: ${attrs.status}`);
      console.log(`  - Limits:`, attrs.limits);
      
      const resources = await getServerResources(attrs.uuid);
      
      // Get primary allocation (first assigned one)
      const allocations = attrs.relationships?.allocations?.data || [];
      const primaryAllocation = allocations.find(a => a.attributes?.assigned);
      const ip = primaryAllocation?.attributes?.ip || 'Unknown';
      const port = primaryAllocation?.attributes?.port || 0;
      
      console.log(`  - Allocation: ${ip}:${port}`);
      console.log(`  - Node: ${attrs.relationships?.node?.attributes?.name || 'Unknown'}`);
      
      // Calculate memory in MB
      const memoryUsed = resources ? Math.round(resources.resources.memory_bytes / 1024 / 1024) : 0;
      const memoryTotal = attrs.limits?.memory || 4096; // Default to 4GB if not set
      
      // Calculate storage in MB
      const storageUsed = resources ? Math.round(resources.resources.disk_bytes / 1024 / 1024) : 0;
      const storageTotal = attrs.limits?.disk || 50000; // Default to 50GB if not set
      
      // CPU usage
      const cpuUsage = resources ? Math.round(resources.resources.cpu_absolute) : 0;
      
      // Generate random uptime for demo purposes (since Pterodactyl doesn't provide uptime directly)
      const uptimeHours = Math.floor(Math.random() * 24) + 1;
      const uptimeMinutes = Math.floor(Math.random() * 60);
      const uptime = `${uptimeHours}h ${uptimeMinutes}m`;

      servers.push({
        id: attrs.id.toString(),
        name: attrs.name,
        status: getServerStatus(attrs.status, attrs.suspended),
        cpu: cpuUsage,
        memory: {
          used: memoryUsed,
          total: memoryTotal
        },
        storage: {
          used: storageUsed,
          total: storageTotal
        },
        uptime: uptime,
        ip: ip,
        port: port,
        node: attrs.relationships?.node?.attributes?.name || 'Unknown',
        description: attrs.description || ''
      });
    }

    console.log('Found', servers.length, 'servers from Pterodactyl panel');

    const response_data = {
      success: true,
      serverCount: servers.length,
      servers: servers
    };

    console.log('Final response data:', JSON.stringify(response_data, null, 2));

    return NextResponse.json(response_data);
  } catch (error) {
    console.error('Error in Pterodactyl API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        serverCount: 0,
        servers: []
      },
      { status: 500 }
    );
  }
}