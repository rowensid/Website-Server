const PTERODACTYL_API_URL = 'https://panel.androwproject.cloud'
const PTERODACTYL_API_KEY = 'ptla_oaieo4yp4BQP3VXosTCjRkE8QaX1zGvLevxca1ncDx5'

async function testPterodactylAPI() {
  try {
    console.log('🔗 Testing Pterodactyl API connection...')
    console.log('URL:', PTERODACTYL_API_URL)
    console.log('Key:', PTERODACTYL_API_KEY.substring(0, 15) + '...')
    
    const response = await fetch(`${PTERODACTYL_API_URL}/api/application/servers?include=allocations,node`, {
      headers: {
        'Authorization': `Bearer ${PTERODACTYL_API_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Pterodactyl-Client/1.0'
      }
    })

    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error response:', errorText)
      return
    }

    const data = await response.json()
    const servers = data.data || []
    
    console.log(`✅ Found ${servers.length} servers`)
    
    servers.forEach((server, index) => {
      const attributes = server.attributes
      const allocation = attributes.relationships?.allocations?.data?.[0]?.attributes || {}
      console.log(`  ${index + 1}. ${attributes.name} (${attributes.identifier})`)
      console.log(`     Status: ${attributes.status}`)
      console.log(`     IP: ${allocation.ip || 'N/A'}:${allocation.port || 'N/A'}`)
      console.log(`     PteroID: ${attributes.id}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testPterodactylAPI()