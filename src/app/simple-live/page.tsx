'use client'

import { useState, useEffect } from 'react'

export default function SimpleLiveServerPage() {
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🚀 Simple page fetching data...');
        const response = await fetch('/api/pterodactyl/servers');
        const data = await response.json();
        console.log('🚀 Simple page got data:', data);
        
        // Log to server
        await fetch('/api/debug-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Simple page data fetch',
            data: { success: data.success, count: data.servers?.length || 0 }
          })
        });
        
        setServers(data.servers || []);
        setLoading(false);
      } catch (error) {
        console.error('🚀 Simple page error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{padding: '20px', background: 'black', color: 'white', minHeight: '100vh'}}>
      <h1>Simple Live Server Page</h1>
      <p>Loading: {loading ? 'Yes' : 'No'}</p>
      <p>Servers: {servers.length}</p>
      <ul>
        {servers.map(server => (
          <li key={server.id}>{server.name} - {server.status}</li>
        ))}
      </ul>
    </div>
  );
}