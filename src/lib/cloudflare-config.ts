export interface CloudflareBypassConfig {
  // Cloudflare settings
  cloudflareApiToken?: string;
  cloudflareZoneId?: string;
  
  // Direct connection settings
  useDirectIP?: boolean;
  directIP?: string;
  directPort?: number;
  
  // Proxy settings
  useProxy?: boolean;
  proxyUrl?: string;
  proxyAuth?: string;
  
  // Connection settings
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  
  // Headers for bypassing
  customHeaders?: Record<string, string>;
  
  // SSL settings
  allowSelfSigned?: boolean;
}

export const defaultCloudflareConfig: CloudflareBypassConfig = {
  timeout: 15000,
  retryAttempts: 3,
  retryDelay: 1000,
  useDirectIP: false,
  useProxy: false,
  allowSelfSigned: true,
  customHeaders: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  }
};

export function loadCloudflareConfig(): CloudflareBypassConfig {
  return {
    ...defaultCloudflareConfig,
    cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN,
    cloudflareZoneId: process.env.CLOUDFLARE_ZONE_ID,
    useDirectIP: process.env.USE_DIRECT_IP === 'true',
    directIP: process.env.PTERODACTYL_DIRECT_IP,
    directPort: process.env.PTERODACTYL_DIRECT_PORT ? parseInt(process.env.PTERODACTYL_DIRECT_PORT) : 443,
    useProxy: process.env.USE_PROXY === 'true',
    proxyUrl: process.env.PROXY_URL,
    proxyAuth: process.env.PROXY_AUTH,
    timeout: process.env.PTERODACTYL_TIMEOUT ? parseInt(process.env.PTERODACTYL_TIMEOUT) : defaultCloudflareConfig.timeout,
    retryAttempts: process.env.PTERODACTYL_RETRY_ATTEMPTS ? parseInt(process.env.PTERODACTYL_RETRY_ATTEMPTS) : defaultCloudflareConfig.retryAttempts,
    retryDelay: process.env.PTERODACTYL_RETRY_DELAY ? parseInt(process.env.PTERODACTYL_RETRY_DELAY) : defaultCloudflareConfig.retryDelay,
    allowSelfSigned: process.env.ALLOW_SELF_SIGNED !== 'false'
  };
}

export function validateConfig(config: CloudflareBypassConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.cloudflareApiToken && !config.useDirectIP && !config.useProxy) {
    errors.push('At least one bypass method must be configured (Cloudflare token, Direct IP, or Proxy)');
  }

  if (config.useDirectIP && !config.directIP) {
    errors.push('Direct IP is required when useDirectIP is enabled');
  }

  if (config.useProxy && !config.proxyUrl) {
    errors.push('Proxy URL is required when useProxy is enabled');
  }

  if (config.timeout && config.timeout < 1000) {
    errors.push('Timeout should be at least 1000ms');
  }

  if (config.retryAttempts && config.retryAttempts < 1) {
    errors.push('Retry attempts should be at least 1');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}