'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Server, 
  Users, 
  CreditCard, 
  Activity, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Network,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Settings,
  Eye,
  UserPlus,
  DollarSign,
  BarChart3,
  Wifi,
  Database,
  Terminal,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { ErrorAlert } from '@/components/ui/error-alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import LiveServerCard from '@/components/live-server-card'

// Types
interface ServerStats {
  cpu: number
  memory: number
  disk: number
  network: number
  uptime: string
  status: 'online' | 'offline' | 'maintenance'
  totalUsers: number
  activeUsers: number
  totalServices: number
  activeServices: number
  totalOrders: number
  completedOrders: number
  totalRevenue: number
  totalPteroServers: number
  activePteroServers: number
  systemHealth: number
}

interface User {
  id: string
  username: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'suspended'
  registeredAt: string
  lastLogin: string
  balance: number
  servers: number
}

interface Payment {
  id: string
  userId: string
  username: string
  amount: number
  type: 'deposit' | 'withdraw' | 'purchase'
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  description: string
}

interface LiveServerData {
  id: string
  name: string
  status: 'running' | 'stopped' | 'starting' | 'stopping'
  cpu: number
  memory: number
  players: number
  maxPlayers: number
  uptime: string
  ip: string
  port: number
  version: string
}

export default function ManageServerPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [serverStats, setServerStats] = useState<ServerStats>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    uptime: '0d 0h 0m',
    status: 'online',
    totalUsers: 0,
    activeUsers: 0,
    totalServices: 0,
    activeServices: 0,
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalPteroServers: 0,
    activePteroServers: 0,
    systemHealth: 0
  })
  const [users, setUsers] = useState<User[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [liveServers, setLiveServers] = useState<LiveServerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from API
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch server stats
        const statsResponse = await fetch('/api/server/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setServerStats(statsData)
        }

        // Fetch users
        const usersResponse = await fetch('/api/admin/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(usersData)
        }

        // Fetch payments
        const paymentsResponse = await fetch('/api/admin/payments')
        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json()
          setPayments(paymentsData)
        }

        // Fetch live servers
        const liveResponse = await fetch('/api/servers/live')
        if (liveResponse.ok) {
          const liveData = await liveResponse.json()
          setLiveServers(liveData)
        } else {
          const errorText = await liveResponse.text()
          console.error('Live servers API error:', errorText)
          setError('Failed to load live servers data')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load server data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    // Separate interval for live servers only (every 3 seconds for smoother updates)
    const fetchLiveServersOnly = async () => {
      try {
        const liveResponse = await fetch('/api/servers/live')
        if (liveResponse.ok) {
          const liveData = await liveResponse.json()
          setLiveServers(prevData => {
            // Smart comparison - only update if essential data changed
            if (prevData.length !== liveData.length) {
              return liveData
            }
            
            // Check each server for significant changes
            const hasChanges = liveData.some((newServer, index) => {
              const prevServer = prevData[index]
              if (!prevServer) return true
              
              // Only update if status, CPU, memory, or players changed significantly
              const statusChanged = prevServer.status !== newServer.status
              const cpuChanged = Math.abs(prevServer.cpu - newServer.cpu) > 5
              const memoryChanged = Math.abs(prevServer.memory - newServer.memory) > 5
              const playersChanged = Math.abs(prevServer.players - newServer.players) > 2
              
              return statusChanged || cpuChanged || memoryChanged || playersChanged
            })
            
            return hasChanges ? liveData : prevData
          })
        }
      } catch (error) {
        console.error('Error fetching live servers:', error)
      }
    }

    fetchInitialData()
    const interval = setInterval(fetchLiveServersOnly, 3000) // Update live servers every 3 seconds for smoother experience
    return () => clearInterval(interval)
  }, [])

  const retryFetch = () => {
    setError(null)
    setLoading(true)
    // Trigger the fetch again
    const fetchData = async () => {
      try {
        // Fetch live servers
        const liveResponse = await fetch('/api/servers/live')
        if (liveResponse.ok) {
          const liveData = await liveResponse.json()
          setLiveServers(liveData)
          setError(null)
        } else {
          const errorText = await liveResponse.text()
          console.error('Live servers API error:', errorText)
          setError('Failed to load live servers data')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load server data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'running':
      case 'active':
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'offline':
      case 'stopped':
      case 'inactive':
      case 'failed':
        return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'maintenance':
      case 'pending':
      case 'starting':
      case 'stopping':
      case 'suspended':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
        <div className="relative border-b border-purple-500/20 backdrop-blur-sm bg-black/40">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-purple-500/25">
                  <Server className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Server Management Center
                  </h1>
                  <p className="text-gray-400 mt-1">Kelola server, pengguna, dan pembayaran dengan mudah</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400/50 transition-all duration-300"
                  asChild
                >
                  <Link href="/owner-panel">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Owner Panel
                  </Link>
                </Button>
                <Button 
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25 transition-all duration-300"
                  asChild
                >
                  <Link href="https://panel.androwproject.cloud" target="_blank">
                    <Terminal className="h-4 w-4 mr-2" />
                    Pterodactyl Panel
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-black/40 border border-purple-500/20 backdrop-blur-sm p-1 rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 hover:text-white transition-all duration-300 rounded-lg"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="live-server" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 hover:text-white transition-all duration-300 rounded-lg"
            >
              <Activity className="h-4 w-4 mr-2" />
              Live Server
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 hover:text-white transition-all duration-300 rounded-lg"
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="payments" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 hover:text-white transition-all duration-300 rounded-lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger 
              value="pterodactyl" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-gray-400 hover:text-white transition-all duration-300 rounded-lg"
            >
              <Globe className="h-4 w-4 mr-2" />
              Pterodactyl
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Server Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">CPU Usage</CardTitle>
                  <Cpu className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{serverStats.cpu}%</div>
                  <Progress value={serverStats.cpu} className="mt-2 h-2 bg-purple-950/50" />
                  <p className="text-xs text-gray-500 mt-2">Processor utilization</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Memory</CardTitle>
                  <MemoryStick className="h-4 w-4 text-pink-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{serverStats.memory}%</div>
                  <Progress value={serverStats.memory} className="mt-2 h-2 bg-purple-950/50" />
                  <p className="text-xs text-gray-500 mt-2">RAM usage</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Disk Space</CardTitle>
                  <HardDrive className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{serverStats.disk}%</div>
                  <Progress value={serverStats.disk} className="mt-2 h-2 bg-purple-950/50" />
                  <p className="text-xs text-gray-500 mt-2">Storage utilization</p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Network</CardTitle>
                  <Network className="h-4 w-4 text-pink-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{serverStats.network} Mbps</div>
                  <div className="flex items-center mt-2">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <p className="text-xs text-gray-500">Active connection</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Common server management tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10 justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Server Configuration
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10 justify-start"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Security Settings
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10 justify-start"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Database Management
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                    System Status
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Current system health and performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Server Status</span>
                    <Badge className={getStatusColor(serverStats.status)}>
                      {serverStats.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">System Health</span>
                    <span className="text-green-400 font-mono">{serverStats.systemHealth}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Uptime</span>
                    <span className="text-white font-mono">{serverStats.uptime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Active Users</span>
                    <span className="text-white font-mono">{serverStats.activeUsers}/{serverStats.totalUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Active Services</span>
                    <span className="text-white font-mono">{serverStats.activeServices}/{serverStats.totalServices}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Pterodactyl Servers</span>
                    <span className="text-white font-mono">{serverStats.activePteroServers}/{serverStats.totalPteroServers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Total Revenue</span>
                    <span className="text-green-400 font-mono">
                      {formatCurrency(serverStats.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Completed Orders</span>
                    <span className="text-white font-mono">{serverStats.completedOrders}/{serverStats.totalOrders}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Live Server Tab */}
          <TabsContent value="live-server" className="space-y-6">
            {loading && activeTab === 'live-server' ? (
              <LoadingSpinner message="Loading live servers..." />
            ) : error && activeTab === 'live-server' ? (
              <ErrorAlert 
                title="Failed to Load Live Servers"
                message={error}
                onRetry={retryFetch}
              />
            ) : liveServers.length === 0 ? (
              <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Server className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Live Servers</h3>
                  <p className="text-gray-400 text-center max-w-md">
                    No live servers are currently available. This could be due to API configuration issues or no servers being set up.
                  </p>
                  <Button 
                    onClick={retryFetch}
                    variant="outline" 
                    className="mt-4 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {liveServers.map((server) => (
                  <LiveServerCard key={server.id} server={server} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">User Management</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage all registered users and their permissions
                    </CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-purple-500/10 hover:border-purple-400/30 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-white font-mono">{formatCurrency(user.balance)}</p>
                          <p className="text-gray-400 text-sm">{user.servers} servers</p>
                        </div>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status.toUpperCase()}
                        </Badge>
                        <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Payment Management</CardTitle>
                    <CardDescription className="text-gray-400">
                      Track and manage all payment transactions
                    </CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                    <DollarSign className="h-4 w-4 mr-2" />
                    New Transaction
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-purple-500/10 hover:border-purple-400/30 transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          payment.type === 'deposit' ? 'bg-green-500/20' : 
                          payment.type === 'withdraw' ? 'bg-red-500/20' : 'bg-blue-500/20'
                        }`}>
                          {payment.type === 'deposit' ? (
                            <TrendingUp className="h-5 w-5 text-green-400" />
                          ) : payment.type === 'withdraw' ? (
                            <ArrowUpRight className="h-5 w-5 text-red-400" />
                          ) : (
                            <CreditCard className="h-5 w-5 text-blue-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{payment.username}</p>
                          <p className="text-gray-400 text-sm">{payment.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`font-bold ${
                            payment.type === 'deposit' ? 'text-green-400' : 
                            payment.type === 'withdraw' ? 'text-red-400' : 'text-blue-400'
                          }`}>
                            {payment.type === 'deposit' ? '+' : payment.type === 'withdraw' ? '-' : ''}
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-gray-400 text-sm">{payment.createdAt}</p>
                        </div>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pterodactyl Tab */}
          <TabsContent value="pterodactyl" className="space-y-6">
            <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Pterodactyl Panel</CardTitle>
                <CardDescription className="text-gray-400">
                  Direct access to your game server management panel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <Globe className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Pterodactyl Panel Integration
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Access your game server management panel directly. Create, configure, and manage your game servers with ease.
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/25"
                    asChild
                  >
                    <Link href="https://panel.androwproject.cloud" target="_blank">
                      <Terminal className="h-4 w-4 mr-2" />
                      Open Pterodactyl Panel
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}