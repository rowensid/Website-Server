'use client';

import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Server, 
  Users, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network,
  Activity,
  Clock,
  Globe,
  Zap,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useServerResources } from '@/hooks/use-server-resources';
import { PterodactylServer } from '@/lib/pterodactyl';

interface WebSocketServerCardProps {
  server: PterodactylServer;
  ip: string;
  port: number;
  owner: string;
}

const WebSocketServerCard: React.FC<WebSocketServerCardProps> = ({ server, ip, port, owner }) => {
  const { 
    data: resources, 
    isLoading, 
    error, 
    isConnected, 
    lastUpdate,
    reconnect 
  } = useServerResources({ 
    serverId: server.identifier,
    enabled: true 
  });

  // Memoize server status to prevent unnecessary re-renders
  const serverStatus = useMemo(() => {
    if (!resources) return 'unknown';
    switch (resources.state) {
      case 'running':
        return 'running';
      case 'stopped':
        return 'stopped';
      case 'starting':
        return 'starting';
      case 'stopping':
        return 'stopping';
      default:
        return resources.state;
    }
  }, [resources]);

  // Memoize resource calculations
  const resourceData = useMemo(() => {
    if (!resources) {
      return {
        cpuPercent: 0,
        memoryPercent: 0,
        memoryUsedMB: 0,
        memoryLimitMB: server.limits.memory,
        diskPercent: 0,
        networkRx: 0,
        networkTx: 0,
      };
    }

    const memoryLimitMB = server.limits.memory;
    const memoryUsedMB = Math.round(resources.memory.current / 1024 / 1024);
    const memoryPercent = memoryLimitMB > 0 ? (memoryUsedMB / memoryLimitMB) * 100 : 0;
    
    const diskLimitMB = server.limits.disk;
    const diskUsedMB = Math.round(resources.disk.current / 1024 / 1024);
    const diskPercent = diskLimitMB > 0 ? (diskUsedMB / diskLimitMB) * 100 : 0;

    return {
      cpuPercent: resources.cpu.current,
      memoryPercent,
      memoryUsedMB,
      memoryLimitMB,
      diskPercent,
      networkRx: resources.network.rx_bytes,
      networkTx: resources.network.tx_bytes,
    };
  }, [resources, server.limits]);

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'stopped':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'starting':
      case 'stopping':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-green-400" />;
      case 'stopped':
        return <Server className="h-4 w-4 text-red-400" />;
      case 'starting':
      case 'stopping':
        return <Zap className="h-4 w-4 text-yellow-400" />;
      default:
        return <Server className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold flex items-center">
            {getStatusIcon(serverStatus)}
            <span className="ml-2">{server.name}</span>
            {isLoading && (
              <RefreshCw className="h-3 w-3 ml-2 text-purple-400 animate-spin" />
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(serverStatus)}>
              {getStatusIcon(serverStatus)}
              <span className="ml-1">{serverStatus.toUpperCase()}</span>
            </Badge>
            <Badge variant="outline" className={`text-xs ${
              isConnected 
                ? 'text-green-400 border-green-400/30' 
                : 'text-red-400 border-red-400/30'
            }`}>
              {isConnected ? (
                <><Wifi className="h-3 w-3 mr-1" />LIVE</>
              ) : (
                <><WifiOff className="h-3 w-3 mr-1" />OFF</>
              )}
            </Badge>
          </div>
        </div>
        <p className="text-gray-400 text-sm">{server.description || `${server.name} server`}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-2 bg-purple-950/20 rounded-lg">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
            <span className="text-sm text-gray-300">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {!isConnected && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={reconnect}
              className="h-6 text-xs"
            >
              Reconnect
            </Button>
          )}
        </div>

        {/* Server Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-purple-400" />
            <span className="text-gray-300">{ip}:{port}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Server className="h-4 w-4 text-blue-400" />
            <span className="text-gray-300">{server.identifier}</span>
          </div>
        </div>

        {/* Resource Usage */}
        <div className="space-y-3">
          {/* CPU Usage */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-gray-300">CPU Usage</span>
              </div>
              <span className="text-sm font-medium text-white">
                {serverStatus === 'running' ? `${resourceData.cpuPercent}%` : '0%'}
              </span>
            </div>
            <Progress 
              value={serverStatus === 'running' ? resourceData.cpuPercent : 0} 
              className="h-2 bg-purple-950/50" 
            />
          </div>

          {/* Memory Usage */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center space-x-2">
                <MemoryStick className="h-4 w-4 text-pink-400" />
                <span className="text-sm text-gray-300">Memory Usage</span>
              </div>
              <span className="text-sm font-medium text-white">
                {serverStatus === 'running' 
                  ? `${resourceData.memoryUsedMB}MB/${resourceData.memoryLimitMB}MB`
                  : '0MB'
                }
              </span>
            </div>
            <Progress 
              value={serverStatus === 'running' ? resourceData.memoryPercent : 0} 
              className="h-2 bg-purple-950/50" 
            />
          </div>

          {/* Disk Usage */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Disk Usage</span>
              </div>
              <span className="text-sm font-medium text-white">
                {resourceData.diskPercent.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={resourceData.diskPercent} 
              className="h-2 bg-purple-950/50" 
            />
          </div>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 pt-2 border-t border-purple-500/10">
          <div className="flex items-center space-x-2">
            <Network className="h-3 w-3 text-purple-400" />
            <span>↓{formatBytes(resourceData.networkRx)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Network className="h-3 w-3 text-green-400" />
            <span>↑{formatBytes(resourceData.networkTx)}</span>
          </div>
        </div>

        {/* Status Info */}
        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-purple-500/10">
          <span>Owner: {owner}</span>
          {lastUpdate && (
            <span>Updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-2 bg-red-950/20 border border-red-500/20 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400 text-xs">
              <WifiOff className="h-3 w-3" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Data Source Info */}
        <div className="text-xs text-gray-500 pt-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              {isConnected ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400">WebSocket connected</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-red-400">WebSocket disconnected</span>
                </>
              )}
            </span>
            <span>Application API</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(WebSocketServerCard);