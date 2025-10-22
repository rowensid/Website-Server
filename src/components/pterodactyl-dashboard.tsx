'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Server, 
  HardDrive, 
  Cpu, 
  MemoryStick, 
  Activity,
  Users,
  Database,
  Shield
} from 'lucide-react';
import { PterodactylConfig } from './pterodactyl-config';
import { PterodactylServers } from './pterodactyl-servers';

interface PterodactylStats {
  totalServers: number;
  activeServers: number;
  suspendedServers: number;
  totalMemory: number;
  usedMemory: number;
  totalDisk: number;
  usedDisk: number;
}

interface PterodactylDashboardProps {
  config: { panelUrl: string; apiKey: string } | null;
  isConnected: boolean;
  onConfigChange: (config: { panelUrl: string; apiKey: string }) => void;
  onConnectionTest: () => void;
}

export function PterodactylDashboard({ 
  config, 
  isConnected, 
  onConfigChange, 
  onConnectionTest 
}: PterodactylDashboardProps) {
  const [stats, setStats] = useState<PterodactylStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!isConnected || !config) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/pterodactyl/stats?panelUrl=${encodeURIComponent(config.panelUrl)}&apiKey=${encodeURIComponent(config.apiKey)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Pterodactyl stats error:', error);
      toast({
        title: "Error Mengambil Statistik",
        description: error instanceof Error ? error.message : "Gagal terhubung ke Pterodactyl panel",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && config) {
      fetchStats();
    }
  }, [isConnected, config]);

  const formatMemory = (mb: number) => {
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(1)} GB`;
    }
    return `${mb} MB`;
  };

  const getUsagePercentage = (used: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <PterodactylConfig
        onConfigChange={onConfigChange}
        isConnected={isConnected}
        onConnectionTest={onConnectionTest}
      />

      {isConnected && (
        <>
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalServers}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="default">{stats.activeServers} active</Badge>
                    {stats.suspendedServers > 0 && (
                      <Badge variant="secondary">{stats.suspendedServers} suspended</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                  <MemoryStick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getUsagePercentage(stats.usedMemory, stats.totalMemory)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatMemory(stats.usedMemory)} / {formatMemory(stats.totalMemory)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getUsagePercentage(stats.usedDisk, stats.totalDisk)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatMemory(stats.usedDisk)} / {formatMemory(stats.totalDisk)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Online</div>
                  <p className="text-xs text-muted-foreground">
                    All systems operational
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Servers List */}
          <PterodactylServers
            config={config}
            isConnected={isConnected}
          />
        </>
      )}
    </div>
  );
}