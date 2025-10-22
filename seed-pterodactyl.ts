import { db } from '@/lib/db'

async function addPterodactylServers() {
  try {
    const servers = await Promise.all([
      db.pterodactylServer.create({
        data: {
          pteroId: '1',
          identifier: 'amerta-roleplay',
          name: 'AMERTA ROLEPLAY V1.5',
          description: 'FiveM Roleplay Server Indonesia',
          status: 'running',
          suspended: false,
          limits: {
            memory: 4096,
            disk: 51200,
            cpu: 200
          },
          featureLimits: {
            databases: 2,
            allocations: 5,
            backups: 2
          },
          nodeId: '1',
          allocationId: '1',
          nestId: '1',
          eggId: '1',
          container: {
            image: 'ghcr.io/parkervcp/yolks:fivem',
            environment: {}
          }
        }
      }),
      db.pterodactylServer.create({
        data: {
          pteroId: '2',
          identifier: 'felavito-roleplay',
          name: 'FELAVITO ROLEPLAY',
          description: 'FiveM Roleplay Server',
          status: 'running',
          suspended: false,
          limits: {
            memory: 6144,
            disk: 61440,
            cpu: 300
          },
          featureLimits: {
            databases: 3,
            allocations: 10,
            backups: 3
          },
          nodeId: '1',
          allocationId: '2',
          nestId: '1',
          eggId: '1',
          container: {
            image: 'ghcr.io/parkervcp/yolks:fivem',
            environment: {}
          }
        }
      }),
      db.pterodactylServer.create({
        data: {
          pteroId: '3',
          identifier: 'medan-city-rp',
          name: 'MEDAN CITY ROLEPLAY',
          description: 'FiveM Server from Medan',
          status: 'stopped',
          suspended: false,
          limits: {
            memory: 3072,
            disk: 40960,
            cpu: 150
          },
          featureLimits: {
            databases: 1,
            allocations: 3,
            backups: 1
          },
          nodeId: '1',
          allocationId: '3',
          nestId: '1',
          eggId: '1',
          container: {
            image: 'ghcr.io/parkervcp/yolks:fivem',
            environment: {}
          }
        }
      })
    ]);

    console.log('Added Pterodactyl servers:', servers.length);
  } catch (error) {
    console.error('Error adding Pterodactyl servers:', error);
  } finally {
    await db.$disconnect();
  }
}

addPterodactylServers();