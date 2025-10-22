'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
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
  Settings,
  RefreshCw,
  User,
  Link as LinkIcon
} from 'lucide-react';

interface PterodactylServer {
  id: string;
  pteroId: string;
  identifier: string;
  name: string;
  description: string | null;
  status: string;
  suspended: boolean;
  limits: any;
  featureLimits: any;
  userId: string | null;
  nodeId: string;
  allocationId: string;
  nestId: string;
  eggId: string;
  container: any;
  lastSyncAt: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface SynchronizedServersProps {
  panelUrl: string;
  apiKey: string;
}

export function SynchronizedServers({ panelUrl, apiKey }: SynchronizedServersProps) {
  const [servers, setServers] = useState<PterodactylServer[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedServer, setSelectedServer] = useState<PterodactylServer | null>(null);

  const fetchServers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pterodactyl/sync');
      
      if (response.ok) {
        const data = await response.json();
        setServers(data.servers || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch synchronized servers');
      }
    } catch (error) {
      console.error('Fetch servers error:', error);
      toast({
        title: "Error Mengambil Data",
        description: error instanceof Error ? error.message : "Gagal mengambil data server yang tersinkronisasi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const syncServers = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/pterodactyl/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ panelUrl, apiKey }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "✅ Sync Berhasil",
          description: `Berhasil sync ${data.stats.totalSynced} server (${data.stats.created} baru, ${data.stats.updated} diupdate)`,
        });
        // Refresh servers list
        await fetchServers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to sync servers');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "❌ Sync Gagal",
        description: error instanceof Error ? error.message : "Gagal sinkronisasi server dari Pterodactyl",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const handlePowerAction = async (serverId: string, action: 'start' | 'stop' | 'restart' | 'kill') => {
    try {
      const response = await fetch(
        `/api/pterodactyl/servers/${serverId}/power?panelUrl=${encodeURIComponent(panelUrl)}&apiKey=${encodeURIComponent(apiKey)}`,
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
        // Refresh servers after a delay
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
    fetchServers();
  }, []);

  const getStatusBadge = (status: string, suspended: boolean) => {
    if (suspended) {
      return <Badge variant="destructive">Suspended</Badge>;
    }

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

  const formatMemory = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Pterodactyl Servers
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={syncServers} 
              disabled={syncing}
              variant="outline" 
              size="sm"
            >
              {syncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </>
              )}
            </Button>
            <Button onClick={fetchServers} disabled={loading} variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Manage your Pterodactyl servers - sync, monitor, and control power
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
            <p className="text-muted-foreground mb-4">No servers found from Pterodactyl panel</p>
            <Button onClick={syncServers} disabled={syncing}>
              {syncing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Servers from Pterodactyl
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {servers.length} servers synchronized
              </p>
              <p className="text-xs text-muted-foreground">
                Last sync: {servers.length > 0 ? formatDate(servers[0].lastSyncAt) : 'Never'}
              </p>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Server</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Resources</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servers.map((server) => (
                  <TableRow key={server.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{server.name}</div>
                        <div className="text-sm text-muted-foreground">{server.identifier}</div>
                        {server.description && (
                          <div className="text-xs text-muted-foreground mt-1">{server.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(server.status, server.suspended)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {server.user ? (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="text-sm">{server.user.name || server.user.email}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <MemoryStick className="h-3 w-3" />
                          {formatMemory(server.limits?.memory || 0)}
                        </div>
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {formatMemory(server.limits?.disk || 0)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Cpu className="h-3 w-3" />
                          {server.limits?.cpu || 0}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        Node {server.nodeId}
                      </div>
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
                                      <div><strong>Description:</strong> {selectedServer.description || 'No description'}</div>
                                      <div><strong>Status:</strong> {getStatusBadge(selectedServer.status, selectedServer.suspended)}</div>
                                      <div><strong>Pterodactyl ID:</strong> {selectedServer.pteroId}</div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Resource Limits</h4>
                                    <div className="space-y-1 text-sm">
                                      <div><strong>Memory:</strong> {formatMemory(selectedServer.limits?.memory || 0)}</div>
                                      <div><strong>Swap:</strong> {formatMemory(selectedServer.limits?.swap || 0)}</div>
                                      <div><strong>Disk:</strong> {formatMemory(selectedServer.limits?.disk || 0)}</div>
                                      <div><strong>CPU:</strong> {selectedServer.limits?.cpu || 0}%</div>
                                      <div><strong>IO:</strong> {selectedServer.limits?.io || 0}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Feature Limits</h4>
                                  <div className="flex gap-4 text-sm">
                                    <div><strong>Databases:</strong> {selectedServer.featureLimits?.databases || 0}</div>
                                    <div><strong>Allocations:</strong> {selectedServer.featureLimits?.allocations || 0}</div>
                                    <div><strong>Backups:</strong> {selectedServer.featureLimits?.backups || 0}</div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Owner</h4>
                                    <div className="text-sm">
                                      {selectedServer.user ? (
                                        <div className="flex items-center gap-1">
                                          <User className="h-3 w-3" />
                                          {selectedServer.user.name || selectedServer.user.email}
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground">Unassigned</span>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Sync Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <div><strong>Created:</strong> {formatDate(selectedServer.createdAt)}</div>
                                      <div><strong>Last Sync:</strong> {formatDate(selectedServer.lastSyncAt)}</div>
                                      <div><strong>Updated:</strong> {formatDate(selectedServer.updatedAt)}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 pt-4 border-t">
                                  <Button variant="outline" size="sm" asChild>
                                    <a 
                                      href={`${panelUrl}/server/${selectedServer.identifier}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <LinkIcon className="h-4 w-4 mr-2" />
                                      Open in Pterodactyl
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}