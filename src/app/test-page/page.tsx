'use client'

import { useEffect } from 'react'

export default function TestPage() {
  useEffect(() => {
    console.log('🧪 TEST PAGE LOADED!');
    fetch('/api/pterodactyl/servers')
      .then(res => res.json())
      .then(data => {
        console.log('🧪 API Response:', data);
        console.log('🧪 Server count:', data.servers?.length || 0);
      })
      .catch(err => console.error('🧪 Error:', err));
  }, []);

  return (
    <div style={{padding: '20px', background: 'black', color: 'white', minHeight: '100vh'}}>
      <h1>Test Page</h1>
      <p>Check console for logs</p>
    </div>
  );
}