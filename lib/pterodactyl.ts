// Pterodactyl API Configuration Helper
export interface PterodactylConfig {
  panelUrl: string
  apiKey: string
}

export function getPterodactylConfig(): PterodactylConfig {
  const config = {
    panelUrl: process.env.PTERODACTYL_URL || 'https://panel.androwproject.cloud',
    apiKey: process.env.PTERODACTYL_API_KEY || ''
  }

  // Validate config
  if (!config.apiKey || config.apiKey === 'your-ptero-api-key-here') {
    throw new Error('Pterodactyl API Key tidak dikonfigurasi! Silakan setup PTERODACTYL_API_KEY di environment variables.')
  }

  if (!config.panelUrl) {
    throw new Error('Pterodactyl URL tidak dikonfigurasi! Silakan setup PTERODACTYL_URL di environment variables.')
  }

  return config
}

export function validatePterodactylConfig(): { isValid: boolean; error?: string } {
  try {
    getPterodactylConfig()
    return { isValid: true }
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Configuration error' 
    }
  }
}

// Instructions untuk setup API Key
export const SETUP_INSTRUCTIONS = `
## 🚀 Setup Pterodactyl API Integration

### 1. Dapatkan Application API Key dari Pterodactyl Panel:
1. Login ke Pterodactyl Panel: https://panel.androwproject.cloud
2. Go to **Admin** → **API Credentials**
3. Click **Create New**
4. Pilih **Application API Key**
5. Beri nama: "Server Management App"
6. Pilih permissions:
   - ✅ Read servers
   - ✅ Read nodes
   - ✅ Read users
   - ✅ Read allocations
7. Copy API Key yang dihasilkan

### 2. Setup Environment Variables:
Edit file \`.env\` di project root:
\`\`\`
PTERODACTYL_URL="https://panel.androwproject.cloud"
PTERODACTYL_API_KEY="paste-api-key-disini"
\`\`\`

### 3. Restart Development Server:
\`\`\`bash
npm run dev
\`\`\`

### 4. Test API Integration:
Buka: http://localhost:3000/api/servers/live

### 🔍 Troubleshooting:
- Pastikan API Key punya permission yang cukup
- Pastikan panel URL benar
- Check network connection ke panel
- Verify API Key tidak expired
`