import axios, { AxiosRequestConfig } from 'axios';
import { NextRequest } from 'next/server';

export interface CloudflareConfig {
  apiToken?: string;
  zoneId?: string;
  useDirectIP?: boolean;
  directIP?: string;
  retryAttempts?: number;
  timeout?: number;
}

export interface ConnectionResult {
  success: boolean;
  data?: any;
  error?: string;
  method?: string;
  fallbackUsed?: boolean;
}

class PterodactylBypass {
  private config: CloudflareConfig;
  private readonly PTERODACTYL_URL: string;
  private readonly API_KEY: string;

  constructor(pterodactylUrl: string, apiKey: string, config: CloudflareConfig = {}) {
    this.PTERODACTYL_URL = pterodactylUrl;
    this.API_KEY = apiKey;
    this.config = {
      retryAttempts: config.retryAttempts || 3,
      timeout: config.timeout || 10000,
      useDirectIP: config.useDirectIP || false,
      ...config
    };
  }

  // Method 1: Cloudflare Token Bypass
  private async cloudflareTokenBypass(endpoint: string): Promise<ConnectionResult> {
    if (!this.config.apiToken) {
      return { success: false, error: 'Cloudflare API token not provided' };
    }

    try {
      const url = new URL(this.PTERODACTYL_URL);
      const zoneId = this.config.zoneId || await this.getZoneId(url.hostname);
      
      if (!zoneId) {
        return { success: false, error: 'Could not get Cloudflare zone ID' };
      }

      // Bypass Cloudflare using token
      const response = await axios.get(`${this.PTERODACTYL_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Accept': 'application/json',
          'User-Agent': 'Pterodactyl-Panel-Bypass/1.0',
          'CF-Access-Client-Secret': this.config.apiToken,
          'CF-Access-Client-Id': 'pterodactyl-bypass'
        },
        timeout: this.config.timeout
      });

      return { 
        success: true, 
        data: response.data, 
        method: 'cloudflare-token'
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: `Cloudflare token bypass failed: ${error.message}`,
        method: 'cloudflare-token'
      };
    }
  }

  // Method 2: Direct IP Connection
  private async directIPConnection(endpoint: string): Promise<ConnectionResult> {
    if (!this.config.directIP && !this.config.useDirectIP) {
      return { success: false, error: 'Direct IP not configured' };
    }

    try {
      const url = new URL(this.PTERODACTYL_URL);
      const directIP = this.config.directIP || this.extractDirectIP(url.hostname);
      
      if (!directIP) {
        return { success: false, error: 'Could not determine direct IP' };
      }

      const directUrl = `https://${directIP}${endpoint}`;
      
      const response = await axios.get(directUrl, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Accept': 'application/json',
          'Host': url.hostname,
          'User-Agent': 'Pterodactyl-Direct-IP/1.0'
        },
        timeout: this.config.timeout,
        // Allow self-signed certificates for direct IP
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      });

      return { 
        success: true, 
        data: response.data, 
        method: 'direct-ip',
        fallbackUsed: true
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: `Direct IP connection failed: ${error.message}`,
        method: 'direct-ip'
      };
    }
  }

  // Method 3: Proxy Connection
  private async proxyConnection(endpoint: string): Promise<ConnectionResult> {
    try {
      // Use a proxy service that can bypass Cloudflare
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${this.PTERODACTYL_URL}${endpoint}`;
      
      const response = await axios.get(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: this.config.timeout
      });

      return { 
        success: true, 
        data: response.data, 
        method: 'proxy',
        fallbackUsed: true
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: `Proxy connection failed: ${error.message}`,
        method: 'proxy'
      };
    }
  }

  // Method 4: Standard Connection with Headers
  private async standardConnection(endpoint: string): Promise<ConnectionResult> {
    try {
      const response = await axios.get(`${this.PTERODACTYL_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: this.config.timeout
      });

      return { 
        success: true, 
        data: response.data, 
        method: 'standard'
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: `Standard connection failed: ${error.message}`,
        method: 'standard'
      };
    }
  }

  // Helper method to get Cloudflare zone ID
  private async getZoneId(domain: string): Promise<string | null> {
    if (!this.config.apiToken) return null;

    try {
      const response = await axios.get(`https://api.cloudflare.com/client/v4/zones?name=${domain}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success && response.data.result.length > 0) {
        return response.data.result[0].id;
      }
    } catch (error) {
      console.error('Failed to get zone ID:', error);
    }

    return null;
  }

  // Helper method to extract direct IP
  private extractDirectIP(hostname: string): string | null {
    // Common direct IP mappings for Pterodactyl panels
    const ipMappings: Record<string, string> = {
      'panel.example.com': '192.168.1.100',
      'pterodactyl.example.com': '192.168.1.101',
      // Add your mappings here
    };

    return ipMappings[hostname] || null;
  }

  // Main connection method with fallback
  async connect(endpoint: string): Promise<ConnectionResult> {
    const methods = [
      () => this.standardConnection(endpoint),
      () => this.cloudflareTokenBypass(endpoint),
      () => this.directIPConnection(endpoint),
      () => this.proxyConnection(endpoint)
    ];

    let lastError: string = '';

    for (let attempt = 0; attempt < this.config.retryAttempts!; attempt++) {
      for (const method of methods) {
        try {
          const result = await method();
          
          if (result.success) {
            return result;
          }
          
          lastError = result.error || 'Unknown error';
          
          // Wait before next attempt
          if (attempt < this.config.retryAttempts! - 1) {
            await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
          }
        } catch (error: any) {
          lastError = error.message;
        }
      }
    }

    return {
      success: false,
      error: `All connection methods failed. Last error: ${lastError}`,
      fallbackUsed: true
    };
  }

  // Test all connection methods
  async testConnection(): Promise<{ method: string; success: boolean; error?: string; latency?: number }[]> {
    const testEndpoint = '/api/application/servers?per_page=1';
    const methods = [
      { name: 'Standard', func: () => this.standardConnection(testEndpoint) },
      { name: 'Cloudflare Token', func: () => this.cloudflareTokenBypass(testEndpoint) },
      { name: 'Direct IP', func: () => this.directIPConnection(testEndpoint) },
      { name: 'Proxy', func: () => this.proxyConnection(testEndpoint) }
    ];

    const results = [];

    for (const method of methods) {
      const startTime = Date.now();
      try {
        const result = await method.func();
        const latency = Date.now() - startTime;
        
        results.push({
          method: method.name,
          success: result.success,
          error: result.error,
          latency
        });
      } catch (error: any) {
        results.push({
          method: method.name,
          success: false,
          error: error.message,
          latency: Date.now() - startTime
        });
      }
    }

    return results;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default PterodactylBypass;