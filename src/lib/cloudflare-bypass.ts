import { Agent } from 'undici';

// Enhanced fetch with multiple Cloudflare bypass techniques
export class CloudflareBypass {
  private static agents = [
    // Agent 1: Standard insecure
    new Agent({
      connect: {
        rejectUnauthorized: false
      }
    }),
    // Agent 2: With custom TLS settings
    new Agent({
      connect: {
        rejectUnauthorized: false,
        secureProtocol: 'TLSv1_2_method'
      }
    }),
    // Agent 3: With additional options
    new Agent({
      connect: {
        rejectUnauthorized: false,
        servername: undefined,
        checkServerIdentity: () => undefined
      }
    })
  ];

  private static userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
  ];

  private static headers = [
    {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Upgrade-Insecure-Requests': '1'
    },
    {
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    },
    {
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive'
    }
  ];

  static async bypassFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const errors: Error[] = [];

    // Try different combinations of agents, user agents, and headers
    for (let agentIndex = 0; agentIndex < this.agents.length; agentIndex++) {
      for (let uaIndex = 0; uaIndex < this.userAgents.length; uaIndex++) {
        for (let headerIndex = 0; headerIndex < this.headers.length; headerIndex++) {
          try {
            const agent = this.agents[agentIndex];
            const userAgent = this.userAgents[uaIndex];
            const headers = this.headers[headerIndex];

            const fetchOptions: RequestInit = {
              ...options,
              headers: {
                ...headers,
                'User-Agent': userAgent,
                ...options.headers,
              },
              // @ts-ignore - undici agent is not in the default fetch types
              dispatcher: agent,
            };

            console.log(`🔄 Trying combination: Agent ${agentIndex + 1}, UA ${uaIndex + 1}, Headers ${headerIndex + 1}`);

            const response = await fetch(url, fetchOptions);

            if (response.ok) {
              console.log(`✅ Success with combination: Agent ${agentIndex + 1}, UA ${uaIndex + 1}, Headers ${headerIndex + 1}`);
              return response;
            } else {
              console.log(`❌ Response ${response.status} with combination: Agent ${agentIndex + 1}, UA ${uaIndex + 1}, Headers ${headerIndex + 1}`);
            }

            // Add small delay between attempts
            await new Promise(resolve => setTimeout(resolve, 500));

          } catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            errors.push(err);
            console.log(`❌ Error with combination: Agent ${agentIndex + 1}, UA ${uaIndex + 1}, Headers ${headerIndex + 1}: ${err.message}`);
          }
        }
      }
    }

    // If all attempts failed, throw the last error or a combined error
    if (errors.length > 0) {
      const lastError = errors[errors.length - 1];
      throw new Error(`All bypass attempts failed. Last error: ${lastError.message}. Total attempts: ${errors.length}`);
    }

    throw new Error('All bypass attempts failed');
  }

  // Simple wrapper for common use case
  static async createBypassedFetch() {
    return async (url: string, options: RequestInit = {}) => {
      return this.bypassFetch(url, options);
    };
  }
}

// Export the bypassed fetch function
export const cloudflareBypassFetch = async (url: string, options: RequestInit = {}) => {
  return CloudflareBypass.bypassFetch(url, options);
}