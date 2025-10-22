/**
 * Pterodactyl Panel API Integration
 * Provides server management functionality for game hosting
 */

export interface PterodactylConfig {
  panelUrl: string;
  apiKey: string;
}

export interface PterodactylServer {
  id: string;
  identifier: string;
  name: string;
  description: string;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
  };
  feature_limits: {
    databases: number;
    allocations: number;
    backups: number;
  };
  user: number;
  node: number;
  allocation: number;
  nest: number;
  egg: number;
  container: {
    startup_command: string;
    image: string;
    environment: Record<string, string>;
  };
  status: string;
  suspended: boolean;
}

export interface PterodactylNode {
  id: number;
  name: string;
  description: string;
  location_id: number;
  fqdn: string;
  scheme: string;
  daemon_base: string;
  memory: number;
  memory_overallocate: number;
  disk: number;
  disk_overallocate: number;
  upload_size: number;
  daemon_sftp: number;
  daemon_listen: number;
  allocated_resources: {
    memory: number;
    disk: number;
  };
  created_at: string;
  updated_at: string;
}

export interface PterodactylUser {
  id: number;
  external_id: string;
  uuid: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  language: string;
  root_admin: boolean;
  twoFactorEnabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServerStats {
  state: string;
  memory: {
    current: number;
    limit: number;
  };
  cpu: {
    current: number;
    cores: number[];
  };
  disk: {
    current: number;
    limit: number;
  };
  network: {
    rx_bytes: number;
    tx_bytes: number;
  };
}

export interface CreateServerRequest {
  name: string;
  description: string;
  user: number;
  egg: number;
  docker_image: string;
  startup: string;
  environment: Record<string, string>;
  limits: {
    memory: number;
    swap: number;
    disk: number;
    io: number;
    cpu: number;
  };
  feature_limits: {
    databases: number;
    allocations: number;
    backups: number;
  };
  allocation: {
    default: number;
    additional: number[];
  };
  start_on_completion: boolean;
}

class PterodactylAPI {
  private config: PterodactylConfig;
  private baseUrl: string;

  constructor(config: PterodactylConfig) {
    this.config = config;
    this.baseUrl = config.panelUrl.replace(/\/$/, '') + '/api';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Pterodactyl API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Pterodactyl API request failed:', error);
      throw error;
    }
  }

  // Server Management
  async getServers(): Promise<{ data: PterodactylServer[] }> {
    return this.makeRequest('/application/servers');
  }

  async getServer(serverId: string): Promise<{ data: PterodactylServer }> {
    return this.makeRequest(`/application/servers/${serverId}`);
  }

  async createServer(serverData: CreateServerRequest): Promise<{ data: PterodactylServer }> {
    return this.makeRequest('/application/servers', {
      method: 'POST',
      body: JSON.stringify(serverData),
    });
  }

  async updateServer(serverId: string, serverData: Partial<CreateServerRequest>): Promise<{ data: PterodactylServer }> {
    return this.makeRequest(`/application/servers/${serverId}`, {
      method: 'PATCH',
      body: JSON.stringify(serverData),
    });
  }

  async deleteServer(serverId: string): Promise<void> {
    await this.makeRequest(`/application/servers/${serverId}`, {
      method: 'DELETE',
    });
  }

  async suspendServer(serverId: string): Promise<void> {
    await this.makeRequest(`/application/servers/${serverId}/suspend`, {
      method: 'POST',
    });
  }

  async unsuspendServer(serverId: string): Promise<void> {
    await this.makeRequest(`/application/servers/${serverId}/unsuspend`, {
      method: 'POST',
    });
  }

  async reinstallServer(serverId: string): Promise<void> {
    await this.makeRequest(`/application/servers/${serverId}/reinstall`, {
      method: 'POST',
    });
  }

  // Server Power Management
  async startServer(serverId: string): Promise<void> {
    await this.makeRequest(`/client/servers/${serverId}/power`, {
      method: 'POST',
      body: JSON.stringify({ signal: 'start' }),
    });
  }

  async stopServer(serverId: string): Promise<void> {
    await this.makeRequest(`/client/servers/${serverId}/power`, {
      method: 'POST',
      body: JSON.stringify({ signal: 'stop' }),
    });
  }

  async restartServer(serverId: string): Promise<void> {
    await this.makeRequest(`/client/servers/${serverId}/power`, {
      method: 'POST',
      body: JSON.stringify({ signal: 'restart' }),
    });
  }

  async killServer(serverId: string): Promise<void> {
    await this.makeRequest(`/client/servers/${serverId}/power`, {
      method: 'POST',
      body: JSON.stringify({ signal: 'kill' }),
    });
  }

  // Server Resources
  async getServerResources(serverId: string): Promise<{ data: ServerStats }> {
    return this.makeRequest(`/client/servers/${serverId}/resources`);
  }

  // Node Management
  async getNodes(): Promise<{ data: PterodactylNode[] }> {
    return this.makeRequest('/application/nodes');
  }

  async getNode(nodeId: number): Promise<{ data: PterodactylNode }> {
    return this.makeRequest(`/application/nodes/${nodeId}`);
  }

  // User Management
  async getUsers(): Promise<{ data: PterodactylUser[] }> {
    return this.makeRequest('/application/users');
  }

  async getUser(userId: number): Promise<{ data: PterodactylUser }> {
    return this.makeRequest(`/application/users/${userId}`);
  }

  async createUser(userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password?: string;
    root_admin?: boolean;
  }): Promise<{ data: PterodactylUser }> {
    return this.makeRequest('/application/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: number, userData: Partial<{
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    root_admin: boolean;
  }>): Promise<{ data: PterodactylUser }> {
    return this.makeRequest(`/application/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: number): Promise<void> {
    await this.makeRequest(`/application/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Utility Methods
  async testConnection(): Promise<boolean> {
    try {
      await this.getNodes();
      return true;
    } catch (error) {
      console.error('Pterodactyl connection test failed:', error);
      return false;
    }
  }

  async getServerStats(): Promise<{
    totalServers: number;
    activeServers: number;
    suspendedServers: number;
    totalMemory: number;
    usedMemory: number;
    totalDisk: number;
    usedDisk: number;
  }> {
    const servers = await this.getServers();
    const nodes = await this.getNodes();
    
    const stats = {
      totalServers: servers.data.length,
      activeServers: servers.data.filter(s => !s.suspended).length,
      suspendedServers: servers.data.filter(s => s.suspended).length,
      totalMemory: nodes.data.reduce((acc, node) => acc + node.memory, 0),
      usedMemory: nodes.data.reduce((acc, node) => acc + node.allocated_resources.memory, 0),
      totalDisk: nodes.data.reduce((acc, node) => acc + node.disk, 0),
      usedDisk: nodes.data.reduce((acc, node) => acc + node.allocated_resources.disk, 0),
    };

    return stats;
  }
}

// Singleton instance
let pterodactylInstance: PterodactylAPI | null = null;

export function createPterodactylClient(config: PterodactylConfig): PterodactylAPI {
  if (!pterodactylInstance) {
    pterodactylInstance = new PterodactylAPI(config);
  }
  return pterodactylInstance;
}

export function getPterodactylClient(): PterodactylAPI {
  if (!pterodactylInstance) {
    throw new Error('Pterodactyl client not initialized. Call createPterodactylClient first.');
  }
  return pterodactylInstance;
}

export default PterodactylAPI;