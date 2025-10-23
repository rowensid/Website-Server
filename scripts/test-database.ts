import { db } from '../src/lib/db';

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...\n');
    
    // Test Users table
    const usersCount = await db.user.count();
    console.log(`👥 Users: ${usersCount} records`);
    
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role} - ${user.isActive ? 'Active' : 'Inactive'}`);
    });
    
    // Test Services table
    const servicesCount = await db.service.count();
    console.log(`\n🛠️ Services: ${servicesCount} records`);
    
    const services = await db.service.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        price: true,
        userId: true
      },
      take: 5
    });
    
    services.forEach(service => {
      console.log(`   - ${service.name} (${service.type}) - ${service.status} - Rp ${service.price.toLocaleString()}`);
    });
    
    // Test Orders table
    const ordersCount = await db.order.count();
    console.log(`\n📦 Orders: ${ordersCount} records`);
    
    // Test PterodactylServers table
    const pteroCount = await db.pterodactylServer.count();
    console.log(`\n🎮 Pterodactyl Servers: ${pteroCount} records`);
    
    const pteroServers = await db.pterodactylServer.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        identifier: true,
        userId: true
      },
      take: 3
    });
    
    pteroServers.forEach(server => {
      console.log(`   - ${server.name} (${server.identifier}) - ${server.status}`);
    });
    
    // Test Sessions table
    const sessionsCount = await db.session.count();
    console.log(`\n🔐 Sessions: ${sessionsCount} records`);
    
    // Test ApiConfiguration table
    const apiConfigCount = await db.apiConfiguration.count();
    console.log(`\n⚙️ API Configurations: ${apiConfigCount} records`);
    
    console.log('\n✅ Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await db.$disconnect();
  }
}

testDatabase();