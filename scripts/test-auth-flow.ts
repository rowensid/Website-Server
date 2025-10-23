async function testAuthFlow() {
  try {
    console.log('🔐 Testing authentication flow...\n');
    
    // Step 1: Login
    console.log('1️⃣ Logging in as owner...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'rowensid2802@gmail.com',
        password: 'Aberzz2802'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful!');
      console.log(`   User: ${loginData.user.name} (${loginData.user.email})`);
      console.log(`   Role: ${loginData.user.role}`);
      
      // Extract cookie from response
      const setCookieHeader = loginResponse.headers.get('set-cookie');
      if (setCookieHeader) {
        const authToken = setCookieHeader.split(';')[0].split('=')[1];
        console.log(`   Token: ${authToken.substring(0, 20)}...`);
        
        // Step 2: Test owner API
        console.log('\n2️⃣ Testing owner API access...');
        
        const ownerResponse = await fetch('http://localhost:3001/api/owner/users', {
          headers: {
            'Cookie': `auth-token=${authToken}`
          }
        });
        
        const ownerData = await ownerResponse.json();
        
        if (ownerResponse.ok) {
          console.log('✅ Owner API access successful!');
          console.log(`   Total users: ${ownerData.users.length}`);
          ownerData.users.forEach((user: any) => {
            console.log(`   - ${user.name} (${user.email}) - ${user.role} - ${user.servers} servers`);
          });
        } else {
          console.log('❌ Owner API access failed:', ownerData.error);
        }
        
        // Step 3: Test other owner APIs
        console.log('\n3️⃣ Testing other owner APIs...');
        
        // Test orders API
        const ordersResponse = await fetch('http://localhost:3001/api/owner/orders', {
          headers: {
            'Cookie': `auth-token=${authToken}`
          }
        });
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          console.log(`✅ Orders API: ${ordersData.orders?.length || 0} orders`);
        } else {
          console.log('❌ Orders API failed');
        }
        
        // Test servers API
        const serversResponse = await fetch('http://localhost:3001/api/owner/servers', {
          headers: {
            'Cookie': `auth-token=${authToken}`
          }
        });
        
        if (serversResponse.ok) {
          const serversData = await serversResponse.json();
          console.log(`✅ Servers API: ${serversData.servers?.length || 0} servers`);
        } else {
          console.log('❌ Servers API failed');
        }
        
      } else {
        console.log('❌ No auth token received');
      }
    } else {
      console.log('❌ Login failed:', loginData.error);
    }
    
  } catch (error) {
    console.error('❌ Auth flow test failed:', error);
  }
}

testAuthFlow();