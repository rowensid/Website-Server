'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { 
  Server, 
  Play, 
  Square, 
  RotateCcw, 
  Zap, 
  MoreHorizontal, 
  HardDrive, 
  Cpu, 
  MemoryStick,
  Activity,
  Settings
} from 'lucide-react';
import { PterodactylConfig } from './pterodactyl-config';

interface PterodactylServer {
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
  current_state?: string;
  resources?: {
    cpu_absolute: number;
    memory_bytes: number;
    disk_bytes: number;
    network_rx_bytes: number;
    network_tx_bytes: number;
  };
  suspended: boolean;
  isRealData?: boolean;
  primaryAllocation?: {
    attributes: {
      ip: string;
      port: number;
      is_default: boolean;
    };
  };
}

interface ServerStats {
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

interface PterodactylServersProps {
  config: PterodactylConfig['config'];
  isConnected: boolean;
}

export function PterodactylServers({ config, isConnected }: PterodactylServersProps) {
  const [servers, setServers] = useState<PterodactylServer[]>([]);
  const [serverStats, setServerStats] = useState<Record<string, ServerStats>>({});
  const [loading, setLoading] = useState(false);
  const [selectedServer, setSelectedServer] = useState<PterodactylServer | null>(null);

  const fetchServers = async () => {
    if (!isConnected || !config) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/pterodactyl/servers?panelUrl=${encodeURIComponent(config.panelUrl)}&apiKey=${encodeURIComponent(config.apiKey)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const servers = data.servers || [];
        setServers(servers);
        
        // Check real-time status for each server
        servers.forEach(server => {
          setTimeout(() => fetchServerStats(server), 1000); // Delay to avoid overwhelming
        });
      } else {
        throw new Error('Failed to fetch servers');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch servers from Pterodactyl",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchServerStats = async (server: PterodactylServer) => {
    if (!isConnected || !config) return;

    try {
      // Use port checking for real-time status
      if (server.primaryAllocation) {
        const ip = server.primaryAllocation.attributes.ip;
        const port = server.primaryAllocation.attributes.port;
        
        const response = await fetch('/api/pterodactyl/realtime-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serverIp: ip,
            serverPort: port
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Update server status in real-time
          setServers(prev => prev.map(s => 
            s.identifier === server.identifier 
              ? { ...s, status: data.status, isRealData: data.isRealData }
              : s
          ));
        }
      }
    } catch (error) {
      console.error('Failed to fetch server stats:', error);
    }
  };

  const handlePowerAction = async (serverId: string, action: 'start' | 'stop' | 'restart' | 'kill') => {
    if (!isConnected || !config) return;

    try {
      const response = await fetch(
        `/api/pterodactyl/servers/${serverId}/power?panelUrl=${encodeURIComponent(config.panelUrl)}&apiKey=${encodeURIComponent(config.apiKey)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ signal: action }),
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: `Server ${action} action completed successfully`,
        });
        // Refresh servers after a delay to get updated status
        setTimeout(() => fetchServers(), 2000);
      } else {
        throw new Error('Failed to perform power action');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} server`,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (isConnected && config) {
      fetchServers();
    }
  }, [isConnected, config]);

  useEffect(() => {
    // Auto-refresh server stats every 10 seconds
    const interval = setInterval(() => {
      servers.forEach(server => {
        fetchServerStats(server);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [servers, isConnected, config]);

  const getStatusBadge = (server: PterodactylServer) => {
    // Use the real-time status from the API response first
    const status = server.status || 'offline';
    
    const variants = {
      live: 'default',
      running: 'default',
      stopped: 'secondary',
      starting: 'outline',
      stopping: 'outline',
      offline: 'destructive'
    } as const;

    const statusLabels = {
      live: 'Live',
      running: 'Running',
      stopped: 'Stopped',
      starting: 'Starting',
      stopping: 'Stopping',
      offline: 'Offline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Pterodactyl Servers
          </CardTitle>
          <CardDescription>
            Connect to your Pterodactyl panel to manage servers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please configure your Pterodactyl panel connection first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Pterodactyl Servers
          </div>
          <Button onClick={fetchServers} disabled={loading} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Manage your game servers from Pterodactyl panel
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Activity className="h-6 w-6 animate-spin" />
          </div>
        ) : servers.length === 0 ? (
          <div className="text-center py-8">
            <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No servers found in your Pterodactyl panel</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Server</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Resources</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servers.map((server) => {
                  const stats = serverStats[server.identifier];
                  return (
                    <TableRow key={server.identifier}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{server.name}</div>
                          <div className="text-sm text-muted-foreground">{server.identifier}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(server)}
                          {server.suspended && (
                            <Badge variant="destructive">Suspended</Badge>
                          )}
                          {server.isRealData && (
                            <Badge variant="outline" className="text-xs">
                              Live
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <MemoryStick className="h-3 w-3" />
                            {server.limits.memory} MB
                          </div>
                          <div className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            {server.limits.disk} MB
                          </div>
                          <div className="flex items-center gap-1">
                            <Cpu className="h-3 w-3" />
                            {server.limits.cpu}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {server.resources ? (
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <MemoryStick className="h-3 w-3" />
                              {Math.round((server.resources.memory_bytes / (server.limits.memory * 1024 * 1024)) * 100)}%
                            </div>
                            <div className="flex items-center gap-1">
                              <Cpu className="h-3 w-3" />
                              {Math.round(server.resources.cpu_absolute)}%
                            </div>
                          </div>
                        ) : stats ? (
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <MemoryStick className="h-3 w-3" />
                              {Math.round((stats.memory.current / stats.memory.limit) * 100)}%
                            </div>
                            <div className="flex items-center gap-1">
                              <Cpu className="h-3 w-3" />
                              {Math.round(stats.cpu.current)}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No data</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Play className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handlePowerAction(server.identifier, 'start')}>
                                <Play className="h-4 w-4 mr-2" />
                                Start
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePowerAction(server.identifier, 'stop')}>
                                <Square className="h-4 w-4 mr-2" />
                                Stop
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePowerAction(server.identifier, 'restart')}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Restart
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePowerAction(server.identifier, 'kill')}>
                                <Zap className="h-4 w-4 mr-2" />
                                Kill
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedServer(server)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Server Details</DialogTitle>
                                <DialogDescription>
                                  Detailed information about {server.name}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedServer && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Basic Information</h4>
                                      <div className="space-y-1 text-sm">
                                        <div><strong>Name:</strong> {selectedServer.name}</div>
                                        <div><strong>Identifier:</strong> {selectedServer.identifier}</div>
                                        <div><strong>Description:</strong> {selectedServer.description}</div>
                                        <div><strong>Status:</strong> {getStatusBadge(selectedServer)}</div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Resource Limits</h4>
                                      <div className="space-y-1 text-sm">
                                        <div><strong>Memory:</strong> {selectedServer.limits.memory} MB</div>
                                        <div><strong>Swap:</strong> {selectedServer.limits.swap} MB</div>
                                        <div><strong>Disk:</strong> {selectedServer.limits.disk} MB</div>
                                        <div><strong>CPU:</strong> {selectedServer.limits.cpu}%</div>
                                        <div><strong>IO:</strong> {selectedServer.limits.io}</div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium mb-2">Feature Limits</h4>
                                    <div className="flex gap-4 text-sm">
                                      <div><strong>Databases:</strong> {selectedServer.feature_limits.databases}</div>
                                      <div><strong>Allocations:</strong> {selectedServer.feature_limits.allocations}</div>
                                      <div><strong>Backups:</strong> {selectedServer.feature_limits.backups}</div>
                                    </div>
                                  </div>
                                  
                                  {stats && (
                                    <div>
                                      <h4 className="font-medium mb-2">Current Usage</h4>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <strong>Memory:</strong> {formatBytes(stats.memory.current)} / {formatBytes(stats.memory.limit)}
                                        </div>
                                        <div>
                                          <strong>CPU:</strong> {Math.round(stats.cpu.current)}%
                                        </div>
                                        <div>
                                          <strong>Disk:</strong> {formatBytes(stats.disk.current)} / {formatBytes(stats.disk.limit)}
                                        </div>
                                        <div>
                                          <strong>Network:</strong> ↓{formatBytes(stats.network.rx_bytes)} ↑{formatBytes(stats.network.tx_bytes)}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}