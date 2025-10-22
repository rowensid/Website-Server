'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Server, Activity, Cpu, MemoryStick, HardDrive, Users, RefreshCw, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PterodactylServer {
  id: string;
  identifier: string;
  name: string;
  description: string;
  status: string;
  limits: {
    memory: number;
    disk: number;
    cpu: number;
  };
  container: {
    environment: {
      SERVER_HOSTNAME?: string;
      MAX_PLAYERS?: string;
    };
  };
}

interface ServerResources {
  status: string;
  resources: {
    cpu_absolute: number;
    memory_bytes: number;
    disk_bytes: number;
    network_rx_bytes: number;
    network_tx_bytes: number;
  };
}

export function ActiveServers() {
  const [servers, setServers] = useState<PterodactylServer[]>([]);
  const [serverResources, setServerResources] = useState<Record<string, ServerResources>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchServers = async () => {
    try {
      const response = await fetch('/api/pterodactyl/sync');
      if (response.ok) {
        const data = await response.json();
        setServers(data.servers || []);
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error);
    }
  };

  const fetchServerResources = async (serverIdentifier: string) => {
    try {
      const response = await fetch('/api/pterodactyl/server-resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          panelUrl: 'https://panel.androwproject.cloud',
          apiKey: 'ptla_oaieo4yp4BQP3VXosTCjRkE8QaX1zGvLevxca1ncDx5',
          serverIdentifier
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setServerResources(prev => ({
          ...prev,
          [serverIdentifier]: data
        }));
      }
    } catch (error) {
      console.error('Failed to fetch server resources:', error);
    }
  };

  const refreshAllServers = async () => {
    setRefreshing(true);
    await fetchServers();
    // Wait a bit then fetch resources
    setTimeout(() => {
      servers.forEach(server => {
        fetchServerResources(server.identifier);
      });
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchServers();
      setLoading(false);
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (servers.length > 0) {
      servers.forEach(server => {
        fetchServerResources(server.identifier);
      });
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        servers.forEach(server => {
          fetchServerResources(server.identifier);
        });
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [servers]);

  const getStatusBadge = (status: string) => {
    const variants = {
      live: 'default',
      running: 'default',
      stopped: 'secondary',
      offline: 'destructive'
    } as const;

    const statusLabels = {
      live: 'Live',
      running: 'Running',
      stopped: 'Stopped',
      offline: 'Offline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className="text-xs">
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatMemory = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-gray-900/50 border-white/10 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="w-full h-32 bg-gray-700 rounded animate-pulse mb-4" />
              <div className="w-3/4 h-4 bg-gray-700 rounded animate-pulse mb-2" />
              <div className="w-1/2 h-3 bg-gray-700 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <div className="text-center py-12">
        <Server className="w-16 h-16 mx-auto text-gray-500 mb-4" />
        <p className="text-gray-400 text-lg">Tidak ada server aktif saat ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-300">
          Menampilkan {servers.length} server aktif
        </p>
        <Button
          onClick={refreshAllServers}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map((server) => {
          const resources = serverResources[server.identifier];
          const maxPlayers = server.container.environment?.MAX_PLAYERS || '64';
          
          return (
            <Card key={server.identifier} className="bg-gray-900/50 border-white/10 backdrop-blur-lg hover:border-green-500/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-green-500" />
                    <CardTitle className="text-lg text-white line-clamp-1">
                      {server.name}
                    </CardTitle>
                  </div>
                  {getStatusBadge(server.status)}
                </div>
                <CardDescription className="text-gray-400 text-sm">
                  {server.description || 'FiveM Roleplay Server'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Server Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>Slot: {maxPlayers}</span>
                  </div>
                  <div className="text-gray-500 text-xs">
                    {server.identifier}
                  </div>
                </div>

                {/* Resource Limits */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-gray-800/50 rounded">
                    <MemoryStick className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                    <div className="text-gray-300">{formatMemory(server.limits.memory)}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-800/50 rounded">
                    <HardDrive className="w-4 h-4 mx-auto mb-1 text-green-400" />
                    <div className="text-gray-300">{formatMemory(server.limits.disk)}</div>
                  </div>
                  <div className="text-center p-2 bg-gray-800/50 rounded">
                    <Cpu className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
                    <div className="text-gray-300">{server.limits.cpu}%</div>
                  </div>
                </div>

                {/* Real-time Resources */}
                {resources && (
                  <div className="space-y-2 pt-2 border-t border-gray-700">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">CPU Usage</span>
                      <span className="text-green-400">
                        {resources.resources.cpu_absolute.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Memory Used</span>
                      <span className="text-blue-400">
                        {formatBytes(resources.resources.memory_bytes)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Disk Used</span>
                      <span className="text-yellow-400">
                        {formatBytes(resources.resources.disk_bytes)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Link href="/pterodactyl">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Manage Server
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}