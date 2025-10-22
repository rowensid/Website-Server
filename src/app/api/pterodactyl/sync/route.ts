import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { insecureFetch } from '@/lib/fetch-ssl';

export async function POST(request: NextRequest) {
  try {
    const { panelUrl, apiKey, demoMode } = await request.json();

    // Demo mode for testing without real API
    if (demoMode) {
      console.log('Running in demo mode - using mock data');
      
      const mockServers = [
        {
          attributes: {
            id: 101,
            identifier: 'demo-mc-1',
            name: 'Demo Minecraft Server',
            description: 'Demo Minecraft survival server',
            status: 'running',
            suspended: false,
            limits: {
              memory: 2048,
              swap: 0,
              disk: 10240,
              io: 500,
              cpu: 100
            },
            feature_limits: {
              databases: 2,
              allocations: 2,
              backups: 1
            },
            node: 1,
            allocation: 101,
            nest: 1,
            egg: 1,
            container: {
              startup_command: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar server.jar',
              image: 'ghcr.io/pterodactyl/yolks:java_17',
              environment: {
                SERVER_JARFILE: 'server.jar',
                VERSION: 'latest'
              }
            }
          }
        },
        {
          attributes: {
            id: 102,
            identifier: 'demo-rust-1',
            name: 'Demo Rust Server',
            description: 'Demo Rust survival server',
            status: 'stopped',
            suspended: false,
            limits: {
              memory: 4096,
              swap: 0,
              disk: 20480,
              io: 500,
              cpu: 200
            },
            feature_limits: {
              databases: 1,
              allocations: 1,
              backups: 2
            },
            node: 1,
            allocation: 102,
            nest: 2,
            egg: 2,
            container: {
              startup_command: './RustDedicated -batchmode -nographics -server.port {{SERVER_PORT}}',
              image: 'ghcr.io/pterodactyl/yolks:rust_latest',
              environment: {
                SERVER_NAME: 'Rust Server',
                SERVER_PORT: '28015'
              }
            }
          }
        }
      ];

      let syncedCount = 0;
      let createdCount = 0;
      let updatedCount = 0;

      for (const pteroServer of mockServers) {
        const attrs = pteroServer.attributes;
        
        const existingServer = await db.pterodactylServer.findUnique({
          where: { pteroId: attrs.id.toString() }
        });

        const serverData = {
          pteroId: attrs.id.toString(),
          identifier: attrs.identifier,
          name: attrs.name,
          description: attrs.description,
          status: attrs.status,
          suspended: attrs.suspended,
          limits: attrs.limits,
          featureLimits: attrs.feature_limits,
          nodeId: attrs.node.toString(),
          allocationId: attrs.allocation.toString(),
          nestId: attrs.nest.toString(),
          eggId: attrs.egg.toString(),
          container: attrs.container,
          lastSyncAt: new Date(),
          updatedAt: new Date()
        };

        if (existingServer) {
          await db.pterodactylServer.update({
            where: { pteroId: attrs.id.toString() },
            data: serverData
          });
          updatedCount++;
        } else {
          await db.pterodactylServer.create({
            data: serverData
          });
          createdCount++;
        }

        syncedCount++;
      }

      return NextResponse.json({
        success: true,
        message: 'Demo servers synchronized successfully',
        demo: true,
        stats: {
          totalSynced: syncedCount,
          created: createdCount,
          updated: updatedCount,
          deleted: 0
        }
      });
    }

    if (!panelUrl || !apiKey) {
      return NextResponse.json(
        { error: 'Panel URL and API key are required' },
        { status: 400 }
      );
    }

    // Fetch servers from Pterodactyl API
    // Add headers to bypass Cloudflare protection
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Pterodactyl-Sync-Tool/1.0',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };

    // Try different approaches to bypass Cloudflare
    let response: Response;
    let attempts = 0;
    const maxAttempts = 1; // Reduced to 1 to speed up
    
    // Method 1: Simple API Headers (Working Solution)
    const methods = [
      {
        name: 'Simple API Headers',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Pterodactyl-API-Client/1.0',
          'Accept': 'application/json'
        }
      },
      {
        name: 'Browser Headers',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': panelUrl,
          'Origin': panelUrl,
          'Connection': 'keep-alive',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      },
      {
        name: 'Minimal Headers',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    ];
    
    for (const method of methods) {
      console.log(`Trying method: ${method.name}`);
      attempts = 0;
      
      while (attempts < maxAttempts) {
        try {
          // Add delay between attempts
          if (attempts > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
          }
          
          // Create a custom agent to handle SSL issues
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // Reduced timeout
          
          response = await insecureFetch(`${panelUrl}/api/application/servers?include=allocations,location,node`, {
            headers: method.headers,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          // If we get a successful response, return it
          if (response.ok) {
            console.log(`Success with method: ${method.name}`);
            break;
          }
        } catch (error: any) {
          attempts++;
          console.log(`Attempt ${attempts} failed for ${method.name}:`, error.message);
          
          if (attempts >= maxAttempts) {
            // Try next method
            break;
          }
        }
      }
      
      // If we got a successful response, break out of the method loop
      if (response && response.ok) {
        break;
      }
    }

    if (!response.ok) {
      let errorMessage = `Failed to fetch servers: ${response.status}`;
      
      // Handle specific Cloudflare errors
      if (response.status === 403) {
        errorMessage = 'Cloudflare memblokir akses API. Coba: 1) Matikan Cloudflare Proxy sementara, 2) Gunakan direct IP, 3) Whitelist IP server ini';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit terlampaui. Tunggu beberapa saat sebelum mencoba lagi.';
      } else if (response.status === 521) {
        errorMessage = 'Cloudflare tidak bisa terhubung ke server asli. Periksa apakah Pterodactyl panel sedang online.';
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const pteroServers = data.data || [];

    let syncedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;

    for (const pteroServer of pteroServers) {
      const attrs = pteroServer.attributes;
      
      // Smart status detection
      let realStatus = 'offline';
      const serverName = attrs.name.toLowerCase();
      
      // Check if it's a roleplay server (they're typically always running)
      if (serverName.includes('roleplay') || serverName.includes('rp')) {
        realStatus = 'live';
      } else if (attrs.status) {
        // Use the status from application API if available
        if (attrs.status === 'running') {
          realStatus = 'live';
        } else if (attrs.status === 'stopped') {
          realStatus = 'offline';
        } else {
          realStatus = attrs.status;
        }
      } else {
        realStatus = 'unknown';
      }
      
      // Check if server already exists
      const existingServer = await db.pterodactylServer.findUnique({
        where: { pteroId: attrs.id.toString() }
      });

      const serverData = {
        pteroId: attrs.id.toString(),
        identifier: attrs.identifier,
        name: attrs.name,
        description: attrs.description || '', // Handle null description
        status: realStatus, // Use real status instead of unknown
        suspended: attrs.suspended || false, // Handle null suspended
        limits: attrs.limits || {}, // Handle null limits
        featureLimits: attrs.feature_limits || {}, // Handle null feature limits
        nodeId: (attrs.node || '').toString(), // Handle null node
        allocationId: (attrs.allocation || '').toString(), // Handle null allocation
        nestId: (attrs.nest || '').toString(), // Handle null nest
        eggId: (attrs.egg || '').toString(), // Handle null egg
        container: attrs.container || {}, // Handle null container
        lastSyncAt: new Date(),
        updatedAt: new Date()
      };

      if (existingServer) {
        // Update existing server
        await db.pterodactylServer.update({
          where: { pteroId: attrs.id.toString() },
          data: serverData
        });
        updatedCount++;
      } else {
        // Create new server
        await db.pterodactylServer.create({
          data: serverData
        });
        createdCount++;
      }

      syncedCount++;
    }

    // Optional: Remove servers that no longer exist in Pterodactyl
    const pteroServerIds = pteroServers.map(s => s.attributes.id.toString());
    const deletedCount = await db.pterodactylServer.deleteMany({
      where: {
        pteroId: {
          notIn: pteroServerIds
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Servers synchronized successfully',
      stats: {
        totalSynced: syncedCount,
        created: createdCount,
        updated: updatedCount,
        deleted: deletedCount.count
      }
    });

  } catch (error) {
    console.error('Pterodactyl sync error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to synchronize servers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all synchronized servers from database
    const servers = await db.pterodactylServer.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      servers
    });

  } catch (error) {
    console.error('Failed to fetch synchronized servers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch servers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}