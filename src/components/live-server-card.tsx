'use client'

import React, { memo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  RefreshCw
} from 'lucide-react'

interface LiveServerData {
  id: string
  name: string
  status: 'running' | 'stopped' | 'starting' | 'stopping' | 'maintenance'
  cpu: number
  memory: number
  memoryUsed?: number
  memoryLimit?: number
  players: number
  maxPlayers: number
  uptime: string
  ip: string
  port: number
  version: string
  owner: string
  network?: {
    rx: number
    tx: number
  }
  disk?: number
  isRealData?: boolean
  lastUpdate?: string
  responseTime?: number
}

interface LiveServerCardProps {
  server: LiveServerData
}

// Memoized sub-components to prevent unnecessary re-renders
const ServerStatus = memo<{ status: string; isRealData?: boolean }>(({ status, isRealData }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'stopped':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'starting':
      case 'stopping':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'maintenance':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-green-400" />
      case 'stopped':
        return <Server className="h-4 w-4 text-red-400" />
      case 'starting':
      case 'stopping':
        return <Zap className="h-4 w-4 text-yellow-400" />
      case 'maintenance':
        return <Clock className="h-4 w-4 text-blue-400" />
      default:
        return <Server className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge className={getStatusColor(status)}>
        {getStatusIcon(status)}
        <span className="ml-1">{status.toUpperCase()}</span>
      </Badge>
      {isRealData && (
        <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs">
          LIVE
        </Badge>
      )}
    </div>
  )
})

ServerStatus.displayName = 'ServerStatus'

const ResourceUsage = memo<{ 
  cpu: number; 
  memory: number; 
  memoryUsed?: number; 
  memoryLimit?: number; 
  players: number; 
  maxPlayers: number; 
  status: string 
}>(({ cpu, memory, memoryUsed, memoryLimit, players, maxPlayers, status }) => {
  // Only animate progress bars when server is running
  const isRunning = status === 'running'
  
  return (
    <div className="space-y-3">
      {/* CPU Usage */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-300">CPU Usage</span>
          </div>
          <span className="text-sm font-medium text-white transition-all duration-300">
            {isRunning ? `${cpu}%` : '0%'}
          </span>
        </div>
        <Progress 
          value={isRunning ? cpu : 0} 
          className="h-2 bg-purple-950/50 transition-all duration-300" 
        />
      </div>

      {/* Memory Usage */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center space-x-2">
            <MemoryStick className="h-4 w-4 text-pink-400" />
            <span className="text-sm text-gray-300">Memory Usage</span>
          </div>
          <span className="text-sm font-medium text-white transition-all duration-300">
            {isRunning ? (
              memoryUsed && memoryLimit 
                ? `${Math.round(memoryUsed)}MB/${memoryLimit}MB`
                : `${memory}%`
            ) : (
              '0MB'
            )}
          </span>
        </div>
        <Progress 
          value={isRunning ? memory : 0} 
          className="h-2 bg-purple-950/50 transition-all duration-300" 
        />
      </div>

      {/* Player Count */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-300">Player Count</span>
          </div>
          <span className="text-sm font-medium text-white transition-all duration-300">
            {isRunning ? `${players}/${maxPlayers}` : '0/0'}
          </span>
        </div>
        <Progress 
          value={isRunning ? (players / maxPlayers) * 100 : 0} 
          className="h-2 bg-purple-950/50 transition-all duration-300" 
        />
      </div>
    </div>
  )
})

ResourceUsage.displayName = 'ResourceUsage'

const ServerInfo = memo<{ 
  ip: string; 
  port: number; 
  players: number; 
  maxPlayers: number; 
  uptime: string; 
  version: string; 
  status: string 
}>(({ ip, port, players, maxPlayers, uptime, version, status }) => {
  const displayPlayers = status === 'running' ? players : 0
  
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="flex items-center space-x-2">
        <Globe className="h-4 w-4 text-purple-400" />
        <span className="text-gray-300">{ip}:{port}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Users className="h-4 w-4 text-pink-400" />
        <span className="text-gray-300 transition-all duration-300">
          {displayPlayers}/{maxPlayers} Players
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <Clock className="h-4 w-4 text-yellow-400" />
        <span className="text-gray-300">{uptime}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Server className="h-4 w-4 text-blue-400" />
        <span className="text-gray-300">{version}</span>
      </div>
    </div>
  )
})

ServerInfo.displayName = 'ServerInfo'

// Main component with optimized updates
const LiveServerCard = memo<LiveServerCardProps>(({ server }) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [prevData, setPrevData] = useState(server)

  // Detect data changes to show subtle update animation
  useEffect(() => {
    if (prevData.cpu !== server.cpu || prevData.memory !== server.memory || prevData.players !== server.players) {
      setIsUpdating(true)
      const timer = setTimeout(() => setIsUpdating(false), 300)
      return () => clearTimeout(timer)
    }
    setPrevData(server)
  }, [server, prevData])

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-5 w-5 text-green-400" />
      case 'stopped':
        return <Server className="h-5 w-5 text-red-400" />
      case 'starting':
      case 'stopping':
        return <Zap className="h-5 w-5 text-yellow-400" />
      case 'maintenance':
        return <Clock className="h-5 w-5 text-blue-400" />
      default:
        return <Server className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <Card className={`bg-black/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 ${
      isUpdating ? 'ring-2 ring-purple-500/30 ring-offset-2 ring-offset-black/50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg font-semibold flex items-center">
            {getStatusIcon(server.status)}
            <span className="ml-2">{server.name}</span>
            {isUpdating && (
              <RefreshCw className="h-3 w-3 ml-2 text-purple-400 animate-spin" />
            )}
          </CardTitle>
          <ServerStatus status={server.status} isRealData={server.isRealData} />
        </div>
        <p className="text-gray-400 text-sm">{server.description || `${server.name} server`}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Server Info - Static */}
        <ServerInfo 
          ip={server.ip}
          port={server.port}
          players={server.players}
          maxPlayers={server.maxPlayers}
          uptime={server.uptime}
          version={server.version}
          status={server.status}
        />

        {/* Resource Usage - Updates smoothly */}
        <ResourceUsage 
          cpu={server.cpu}
          memory={server.memory}
          memoryUsed={server.memoryUsed}
          memoryLimit={server.memoryLimit}
          players={server.players}
          maxPlayers={server.maxPlayers}
          status={server.status}
        />

        {/* Additional Info */}
        {(server.network || server.disk !== undefined) && (
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 pt-2 border-t border-purple-500/10">
            {server.network && (
              <div className="flex items-center space-x-2">
                <Network className="h-3 w-3 text-purple-400" />
                <span className="transition-all duration-300">
                  ↓{formatBytes(server.network.rx)} ↑{formatBytes(server.network.tx)}
                </span>
              </div>
            )}
            {server.disk !== undefined && (
              <div className="flex items-center space-x-2">
                <HardDrive className="h-3 w-3 text-purple-400" />
                <span className="transition-all duration-300">Disk: {server.disk}%</span>
              </div>
            )}
            {server.responseTime && (
              <div className="flex items-center space-x-2">
                <Activity className="h-3 w-3 text-green-400" />
                <span className="transition-all duration-300">{server.responseTime}ms</span>
              </div>
            )}
          </div>
        )}

        {/* Owner and Last Update */}
        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-purple-500/10">
          <span>Owner: {server.owner}</span>
          {server.lastUpdate && (
            <span>Updated: {new Date(server.lastUpdate).toLocaleTimeString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

LiveServerCard.displayName = 'LiveServerCard'

export default LiveServerCard