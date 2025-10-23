import { db } from '../src/lib/db';

async function seedSampleData() {
  try {
    console.log('🌱 Seeding sample data...\n');
    
    // Create sample services
    const services = [
      {
        name: 'Game Hosting Premium',
        type: 'GAME_HOSTING',
        status: 'ACTIVE',
        price: 150000,
        description: 'Server game hosting dengan performa tinggi',
        ip: '192.168.1.100',
        port: 7777,
        userId: 'cmh2zd42b0000rt84zmscfk68' // Owner ID
      },
      {
        name: 'RDP Business Pro',
        type: 'RDP',
        status: 'ACTIVE',
        price: 250000,
        description: 'Remote Desktop untuk kebutuhan bisnis',
        ip: '192.168.1.101',
        port: 3389,
        userId: 'cmh2zd42b0000rt84zmscfk68'
      },
      {
        name: 'FiveM Development',
        type: 'FIVEM_DEVELOPMENT',
        status: 'ACTIVE',
        price: 500000,
        description: 'Jasa development custom FiveM server',
        userId: 'cmh2zd42b0000rt84zmscfk68'
      }
    ];
    
    for (const service of services) {
      const existingService = await db.service.findFirst({
        where: { name: service.name }
      });
      
      if (!existingService) {
        await db.service.create({
          data: service
        });
        console.log(`✅ Created service: ${service.name}`);
      } else {
        console.log(`ℹ️ Service already exists: ${service.name}`);
      }
    }
    
    // Create sample orders
    const orders = [
      {
        userId: 'cmh2zd42b0000rt84zmscfk68',
        amount: 150000,
        status: 'COMPLETED',
        paymentMethod: 'Transfer Bank'
      },
      {
        userId: 'cmh2zd42b0000rt84zmscfk68',
        amount: 250000,
        status: 'COMPLETED',
        paymentMethod: 'E-Wallet'
      }
    ];
    
    for (const order of orders) {
      await db.order.create({
        data: order
      });
      console.log(`✅ Created order: Rp ${order.amount.toLocaleString()}`);
    }
    
    // Create sample Pterodactyl servers
    const pteroServers = [
      {
        pteroId: '1',
        identifier: 'server-001',
        name: 'Minecraft Survival',
        description: 'Minecraft server survival mode',
        status: 'running',
        suspended: false,
        limits: { memory: 2048, disk: 10240, cpu: 100 },
        featureLimits: { databases: 2, backups: 2, allocations: 2 },
        nodeId: '1',
        allocationId: '1',
        allocationIp: '192.168.1.200',
        allocationPort: 25565,
        nestId: '1',
        eggId: '1',
        userId: 'cmh2zd42b0000rt84zmscfk68'
      },
      {
        pteroId: '2',
        identifier: 'server-002',
        name: 'FiveM Roleplay',
        description: 'FiveM server for roleplay',
        status: 'running',
        suspended: false,
        limits: { memory: 4096, disk: 20480, cpu: 200 },
        featureLimits: { databases: 5, backups: 5, allocations: 3 },
        nodeId: '1',
        allocationId: '2',
        allocationIp: '192.168.1.201',
        allocationPort: 30120,
        nestId: '1',
        eggId: '1',
        userId: 'cmh2zd42b0000rt84zmscfk68'
      }
    ];
    
    for (const server of pteroServers) {
      const existingServer = await db.pterodactylServer.findFirst({
        where: { identifier: server.identifier }
      });
      
      if (!existingServer) {
        await db.pterodactylServer.create({
          data: server
        });
        console.log(`✅ Created Pterodactyl server: ${server.name}`);
      } else {
        console.log(`ℹ️ Pterodactyl server already exists: ${server.name}`);
      }
    }
    
    // Create API Configuration
    const existingApiConfig = await db.apiConfiguration.findFirst({
      where: { name: 'Pterodactyl Main' }
    });
    
    if (!existingApiConfig) {
      await db.apiConfiguration.create({
        data: {
          name: 'Pterodactyl Main',
          apiUrl: 'http://pterodactyl.example.com',
          apiKey: 'ptlc_sample_key_here',
          isActive: true,
          description: 'Main Pterodactyl panel configuration'
        }
      });
      console.log('✅ Created API Configuration');
    } else {
      console.log('ℹ️ API Configuration already exists');
    }
    
    console.log('\n🎉 Sample data seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await db.$disconnect();
  }
}

seedSampleData();