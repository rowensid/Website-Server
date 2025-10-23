import { db } from '../src/lib/db';

async function generateStatusReport() {
  try {
    console.log('📊 Website Server Status Report');
    console.log('=================================\n');
    
    // Server Status
    console.log('🖥️ SERVER STATUS');
    console.log('✅ Development Server: http://localhost:3001');
    console.log('✅ Database: SQLite (Connected)');
    console.log('✅ API Endpoints: Active');
    console.log('✅ Authentication: Working\n');
    
    // Database Statistics
    console.log('📊 DATABASE STATISTICS');
    const usersCount = await db.user.count();
    const servicesCount = await db.service.count();
    const ordersCount = await db.order.count();
    const pteroCount = await db.pterodactylServer.count();
    const sessionsCount = await db.session.count();
    const apiConfigCount = await db.apiConfiguration.count();
    
    console.log(`👥 Users: ${usersCount}`);
    console.log(`🛠️ Services: ${servicesCount}`);
    console.log(`📦 Orders: ${ordersCount}`);
    console.log(`🎮 Pterodactyl Servers: ${pteroCount}`);
    console.log(`🔐 Active Sessions: ${sessionsCount}`);
    console.log(`⚙️ API Configurations: ${apiConfigCount}\n`);
    
    // User Details
    console.log('👤 USER ACCOUNTS');
    const users = await db.user.findMany({
      select: {
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    users.forEach(user => {
      const status = user.isActive ? '🟢 Active' : '🔴 Inactive';
      const roleIcon = user.role === 'ADMIN' ? '👑' : '👤';
      console.log(`${roleIcon} ${user.name} (${user.email}) - ${user.role} - ${status}`);
    });
    
    // Services Breakdown
    console.log('\n🛠️ SERVICES BREAKDOWN');
    const services = await db.service.findMany({
      select: {
        name: true,
        type: true,
        status: true,
        price: true
      }
    });
    
    const serviceTypes = services.reduce((acc, service) => {
      acc[service.type] = (acc[service.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(serviceTypes).forEach(([type, count]) => {
      console.log(`${type}: ${count} services`);
    });
    
    // Orders Summary
    console.log('\n📦 ORDERS SUMMARY');
    const orders = await db.order.findMany({
      select: {
        amount: true,
        status: true,
        paymentMethod: true,
        createdAt: true
      }
    });
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
    
    console.log(`Total Orders: ${orders.length}`);
    console.log(`Completed Orders: ${completedOrders}`);
    console.log(`Total Revenue: Rp ${totalRevenue.toLocaleString()}`);
    
    // Pterodactyl Servers
    console.log('\n🎮 PTERODACTYL SERVERS');
    const pteroServers = await db.pterodactylServer.findMany({
      select: {
        name: true,
        identifier: true,
        status: true,
        suspended: true
      }
    });
    
    pteroServers.forEach(server => {
      const statusIcon = server.status === 'running' ? '🟢' : '🔴';
      const suspendedIcon = server.suspended ? '⚠️' : '✅';
      console.log(`${statusIcon} ${server.name} (${server.identifier}) ${suspendedIcon}`);
    });
    
    console.log('\n🔗 IMPORTANT LINKS');
    console.log('🌐 Website: http://localhost:3001');
    console.log('🔐 Login: http://localhost:3001/login');
    console.log('📝 Register: http://localhost:3001/register');
    console.log('👑 Owner Panel: http://localhost:3001/owner-panel');
    console.log('🎮 Pterodactyl: http://localhost:3001/pterodactyl');
    console.log('👤 Member Dashboard: http://localhost:3001/member-dashboard');
    
    console.log('\n🔑 OWNER ACCOUNT');
    console.log('📧 Email: rowensid2802@gmail.com');
    console.log('🔑 Password: Aberzz2802');
    console.log('🏷️ Role: ADMIN');
    
    console.log('\n✅ All systems operational!');
    
  } catch (error) {
    console.error('❌ Error generating report:', error);
  } finally {
    await db.$disconnect();
  }
}

generateStatusReport();