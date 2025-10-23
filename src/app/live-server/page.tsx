'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Users, 
  Server, 
  Zap, 
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Filter,
  Download,
  Settings,
  Maximize2,
  Grid3X3,
  List,
  Play,
  Pause,
  Square,
  Terminal,
  Monitor,
  Wifi,
  Database,
  MemoryStick,
  Power,
  PowerOff,
  RotateCcw,
  TriangleAlert
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import AestheticHeader from '@/components/aesthetic-header'

interface ServerData {
  id: string
  name: string
  status: 'online' | 'offline' | 'starting' | 'stopping'
  cpu: number
  memory: {
    used: number
    total: number
  }
  storage: {
    used: number
    total: number
  }
  players: {
    current: number
    max: number
  }
  network: {
    upload: number
    download: number
  }
  uptime: string
  location: string
  game: string
  ip: string
  lastUpdate: string
}

export default function LiveServerPage() {
  const [servers, setServers] = useState<ServerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [refreshInterval, setRefreshInterval] = useState(3000)
  const [serverActions, setServerActions] = useState<{[key: string]: {loading: boolean, error: string | null}}>({})

  // Function to handle server power actions
  const handleServerAction = async (serverId: string, action: 'start' | 'stop' | 'restart' | 'kill') => {
    try {
      setServerActions(prev => ({
        ...prev,
        [serverId]: { loading: true, error: null }
      }))

      console.log(`🎮 Sending ${action} command to server ${serverId}`)

      const response = await fetch(`/api/pterodactyl/servers/${serverId}/power`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ signal: action })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Failed to ${action} server`)
      }

      console.log(`✅ Successfully sent ${action} command to server ${serverId}`)
      
      // Refresh server data after action
      setTimeout(() => {
        fetchServerData()
      }, 2000)

    } catch (error: any) {
      console.error(`❌ Failed to ${action} server ${serverId}:`, error)
      setServerActions(prev => ({
        ...prev,
        [serverId]: { loading: false, error: error.message }
      }))
    } finally {
      setServerActions(prev => ({
        ...prev,
        [serverId]: { ...prev[serverId], loading: false }
      }))
    }
  }

  // Function to open console
  const openConsole = async (serverId: string) => {
    try {
      const response = await fetch(`/api/pterodactyl/servers/${serverId}/console`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to get console details')
      }

      // Open console in new window with WebSocket details
      const consoleWindow = window.open('', '_blank', 'width=800,height=600')
      if (consoleWindow) {
        consoleWindow.document.write(`
          <html>
            <head><title>Server Console - ${serverId}</title></head>
            <body style="background: #000; color: #fff; font-family: monospace; padding: 20px;">
              <h2>Server Console - ${serverId}</h2>
              <p>WebSocket URL: ${result.websocket.url}</p>
              <p>Token: ${result.websocket.token}</p>
              <p>Use these details to connect to the server console via WebSocket.</p>
              <button onclick="window.close()" style="background: #333; color: #fff; border: none; padding: 10px; cursor: pointer;">Close</button>
            </body>
          </html>
        `)
      }

    } catch (error: any) {
      console.error('❌ Failed to open console:', error)
      alert(`Failed to open console: ${error.message}`)
    }
  }

  // Fungsi untuk mendeteksi jenis masalah koneksi
  function detectConnectionIssue(error: any): { type: string; message: string; solution: string } {
    const errorMessage = error?.message?.toLowerCase() || '';
    const errorStatus = error?.status;
    
    // Cek Cloudflare
    if (errorMessage.includes('cloudflare') || errorMessage.includes('cf-ray') || errorMessage.includes('524')) {
      return {
        type: 'CLOUDFLARE_ERROR',
        message: 'Cloudflare memblokir koneksi ke Pterodactyl Panel',
        solution: 'Periksa pengaturan Cloudflare dan nonaktifkan mode "I\'m Under Attack" atau tambahkan IP server ke whitelist'
      };
    }
    
    // Cek CORS
    if (errorMessage.includes('cors') || errorMessage.includes('cross-origin')) {
      return {
        type: 'CORS_ERROR',
        message: 'CORS policy menghalangi akses API',
        solution: 'Tambahkan origin domain ke pengaturan CORS Pterodactyl Panel'
      };
    }
    
    // Cek timeout
    if (errorMessage.includes('timeout') || errorMessage.includes('network error')) {
      return {
        type: 'TIMEOUT_ERROR',
        message: 'Koneksi timeout - server terlalu lambat merespons',
        solution: 'Periksa koneksi internet dan status server Pterodactyl'
      };
    }
    
    // Cek API Key
    if (errorStatus === 401 || errorMessage.includes('unauthorized') || errorMessage.includes('invalid api key')) {
      return {
        type: 'API_KEY_ERROR',
        message: 'API Key tidak valid atau kadaluarsa',
        solution: 'Perbarui API Key di Pterodactyl Panel dan .env.local'
      };
    }
    
    // Cek SSL
    if (errorMessage.includes('ssl') || errorMessage.includes('certificate')) {
      return {
        type: 'SSL_ERROR',
        message: 'Masalah sertifikat SSL',
        solution: 'Periksa konfigurasi SSL certificate di server Pterodactyl'
      };
    }
    
    // Default error
    return {
      type: 'UNKNOWN_ERROR',
      message: 'Koneksi ke Pterodactyl Panel gagal',
      solution: 'Periksa URL API, koneksi internet, dan status server Pterodactyl'
    };
  }

  // Fungsi untuk fetch dengan error handling yang jelas
  async function fetchWithDetailedError(url: string, options: RequestInit): Promise<any> {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error: any) {
      const issue = detectConnectionIssue(error);
      console.error('Connection issue detected:', issue);
      throw new Error(`${issue.message} (${issue.type}): ${issue.solution}`);
    }
  }

  const fetchServerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchWithDetailedError('/api/servers/live', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });
      
      // Handle both array and object response formats
      if (Array.isArray(response)) {
        setServers(response);
      } else if (response.success && response.servers) {
        setServers(response.servers);
      } else if (response.servers) {
        setServers(response.servers);
      } else {
        console.log('Unexpected response format:', response);
        setServers([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch server data:', error);
      setError(error.message);
      setServers([]);
    } finally {
      setLoading(false);
    }
  }

  const refreshServers = async () => {
    setLoading(true)
    await fetchServerData()
  }

  useEffect(() => {
    fetchServerData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchServerData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'offline': return 'bg-red-500'
      case 'starting': return 'bg-yellow-500'
      case 'stopping': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': 
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"><CheckCircle className="w-3 h-3 mr-1" /> Online</Badge>
      case 'offline': 
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"><AlertCircle className="w-3 h-3 mr-1" /> Offline</Badge>
      case 'starting': 
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Starting</Badge>
      case 'stopping': 
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30"><RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Stopping</Badge>
      default: 
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const filteredServers = servers.filter(server => {
    if (selectedFilter === 'all') return true
    return server.status === selectedFilter
  })

  const ServerCard = ({ server }: { server: ServerData }) => (
    <Card className="relative overflow-hidden bg-black/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 group">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-600/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Status indicator line */}
      <div className={`absolute top-0 left-0 w-full h-1 ${getStatusColor(server.status)}`} />
      
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-white">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20">
                <Server className="h-4 w-4 text-pink-400" />
              </div>
              {server.name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2 text-purple-300/70">
              <span className="text-xs">{server.game}</span>
              <span className="text-xs">•</span>
              <span className="text-xs">{server.location}</span>
              <span className="text-xs">•</span>
              <span className="font-mono text-xs">{server.ip}</span>
            </CardDescription>
          </div>
          {getStatusBadge(server.status)}
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-4">
        {/* Storage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20">
              <HardDrive className="h-3 w-3 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-purple-300">Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{formatBytes(server.storage.used * 1024 * 1024)}</span>
            <span className="text-xs text-purple-400/70">/ {formatBytes(server.storage.total * 1024 * 1024)}</span>
            <Progress 
              value={(server.storage.used / server.storage.total) * 100} 
              className="w-20 h-2 bg-purple-950/50"
            />
          </div>
        </div>

        {/* CPU */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-pink-500/20">
              <Cpu className="h-3 w-3 text-pink-400" />
            </div>
            <span className="text-sm font-medium text-purple-300">CPU</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{server.cpu}%</span>
            <Progress 
              value={server.cpu} 
              className={`w-20 h-2 ${
                server.cpu > 80 ? 'bg-red-950/50' : 
                server.cpu > 60 ? 'bg-yellow-950/50' : 
                'bg-green-950/50'
              }`}
            />
            {server.cpu > 60 ? (
              <TrendingUp className="h-3 w-3 text-red-400" />
            ) : (
              <TrendingDown className="h-3 w-3 text-green-400" />
            )}
          </div>
        </div>

        {/* Memory */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20">
              <MemoryStick className="h-3 w-3 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-purple-300">Memory</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">
              {formatBytes(server.memory.used * 1024 * 1024)}
            </span>
            <span className="text-xs text-purple-400/70">/ {formatBytes(server.memory.total * 1024 * 1024)}</span>
            <Progress 
              value={(server.memory.used / server.memory.total) * 100} 
              className="w-20 h-2 bg-purple-950/50"
            />
          </div>
        </div>

        {/* Network */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20">
              <Wifi className="h-3 w-3 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-purple-300">Network</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-400" />
              <span className="text-green-400">{formatBytes(server.network.upload * 1024)}/s</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-blue-400" />
              <span className="text-blue-400">{formatBytes(server.network.download * 1024)}/s</span>
            </div>
          </div>
        </div>

        {/* Uptime */}
        <div className="flex items-center justify-between pt-3 border-t border-purple-500/20">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20">
              <Clock className="h-3 w-3 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-purple-300">Uptime</span>
          </div>
          <span className="text-sm font-bold text-white">{formatUptime(parseInt(server.uptime))}</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-3">
          {/* Power Control Buttons */}
          <div className="flex gap-2">
            {server.status === 'offline' ? (
              <Button 
                size="sm" 
                onClick={() => handleServerAction(server.id, 'start')}
                disabled={serverActions[server.id]?.loading}
                className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 hover:border-green-400/50"
              >
                {serverActions[server.id]?.loading ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Play className="h-3 w-3 mr-1" />
                )}
                Start
              </Button>
            ) : server.status === 'online' ? (
              <>
                <Button 
                  size="sm" 
                  onClick={() => handleServerAction(server.id, 'restart')}
                  disabled={serverActions[server.id]?.loading}
                  className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 hover:border-yellow-400/50"
                >
                  {serverActions[server.id]?.loading ? (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <RotateCcw className="h-3 w-3 mr-1" />
                  )}
                  Restart
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleServerAction(server.id, 'stop')}
                  disabled={serverActions[server.id]?.loading}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:border-red-400/50"
                >
                  {serverActions[server.id]?.loading ? (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <PowerOff className="h-3 w-3 mr-1" />
                  )}
                  Stop
                </Button>
              </>
            ) : (
              <Button 
                size="sm" 
                onClick={() => handleServerAction(server.id, 'kill')}
                disabled={serverActions[server.id]?.loading}
                className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/30 hover:border-red-500/50"
              >
                {serverActions[server.id]?.loading ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <TriangleAlert className="h-3 w-3 mr-1" />
                )}
                Force Stop
              </Button>
            )}
          </div>

          {/* Error Display */}
          {serverActions[server.id]?.error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
              {serverActions[server.id].error}
            </div>
          )}

          {/* Console and Settings */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => openConsole(server.id)}
              className="flex-1 bg-gradient-to-r from-pink-500/20 to-purple-600/20 hover:from-pink-500/30 hover:to-purple-600/30 text-purple-200 border border-purple-500/30 hover:border-purple-400/50"
            >
              <Terminal className="h-3 w-3 mr-1" />
              Console
            </Button>
            <Button 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-pink-500/20 to-purple-600/20 hover:from-pink-500/30 hover:to-purple-600/30 text-purple-200 border border-purple-500/30 hover:border-purple-400/50"
            >
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/50 to-black">
      <AestheticHeader currentPage="live-server" />
      
      <main className="pt-20 container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="relative overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
          <div className="relative text-center py-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Live Server Monitoring
            </h1>
            <p className="text-purple-300 text-lg">
              Real-time monitoring of all game servers and their performance metrics
            </p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-40 bg-black/40 border-purple-500/30 text-purple-200 focus:border-purple-400/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/95 border-purple-500/30">
                <SelectItem value="all">All Servers</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="starting">Starting</SelectItem>
                <SelectItem value="stopping">Stopping</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`border-purple-500/30 text-purple-200 hover:bg-purple-500/10 ${
                autoRefresh ? 'bg-purple-500/20 border-purple-400/60' : ''
              }`}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={refreshServers}
              disabled={loading}
              className="border-purple-500/30 text-purple-200 hover:bg-purple-500/10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-1 p-1 bg-black/40 rounded-lg border border-purple-500/20">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={`h-8 w-8 p-0 ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                    : 'text-purple-300 hover:text-white hover:bg-purple-500/10'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={`h-8 w-8 p-0 ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                    : 'text-purple-300 hover:text-white hover:bg-purple-500/10'
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-black/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-purple-300">Total Servers</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20">
                <Server className="h-4 w-4 text-pink-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {servers.length}
              </div>
              <p className="text-xs text-purple-400/70 mt-2">
                {servers.filter(s => s.status === 'online').length} online
              </p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden bg-black/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-purple-300">Total Players</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {servers.reduce((acc, s) => acc + s.players.current, 0)}
              </div>
              <p className="text-xs text-purple-400/70 mt-2">
                Across all servers
              </p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden bg-black/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-purple-300">Avg CPU Usage</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20">
                <Cpu className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {servers.length > 0 ? Math.round(servers.reduce((acc, s) => acc + s.cpu, 0) / servers.length) : 0}%
              </div>
              <p className="text-xs text-purple-400/70 mt-2">
                System-wide average
              </p>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden bg-black/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-purple-300">Network Traffic</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20">
                <Activity className="h-4 w-4 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                {formatBytes(servers.reduce((acc, s) => acc + s.network.upload + s.network.download, 0) * 1024)}/s
              </div>
              <p className="text-xs text-purple-400/70 mt-2">
                Total bandwidth
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-700">Koneksi Error</AlertTitle>
            <AlertDescription className="text-red-600">
              <div className="space-y-2">
                <p>{error}</p>
                <div className="text-sm space-y-1">
                  <p className="font-semibold">Solusi yang disarankan:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Periksa koneksi internet dan server Pterodactyl</li>
                    <li>Verifikasi API Key dan URL di konfigurasi</li>
                    <li>Nonaktifkan "I'm Under Attack" mode di Cloudflare</li>
                    <li>Tambahkan IP server ke whitelist Cloudflare</li>
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Servers Grid/List */}
        {loading && !error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
              <p className="text-purple-300">Menghubungkan ke Pterodactyl Panel...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="bg-black/40 border border-red-500/20 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <AlertCircle className="h-16 w-16 text-red-400/50 mb-4" />
              <h3 className="text-xl font-semibold text-red-200 mb-2">Koneksi Gagal</h3>
              <p className="text-red-300/70 text-center max-w-md">
                Tidak dapat terhubung ke Pterodactyl Panel. Periksa konfigurasi dan koneksi server.
              </p>
              <Button 
                onClick={refreshServers} 
                className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Coba Lagi
              </Button>
            </CardContent>
          </Card>
        ) : filteredServers.length === 0 ? (
          <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <Server className="h-16 w-16 text-purple-400/50 mb-4" />
              <h3 className="text-xl font-semibold text-purple-200 mb-2">No servers found</h3>
              <p className="text-purple-300/70 text-center max-w-md">
                {selectedFilter === 'all' 
                  ? 'No servers are currently configured.' 
                  : `No servers with status "${selectedFilter}" found.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }>
            {filteredServers.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}