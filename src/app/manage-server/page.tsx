'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import AestheticHeader from '@/components/aesthetic-header'
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
  RefreshCw,
  Edit,
  Ban,
  MoreHorizontal,
  ServerIcon,
  Monitor,
  Play,
  Pause,
  Square
} from 'lucide-react'
import Link from 'next/link'
import { ErrorAlert } from '@/components/ui/error-alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import UserDetailModal from '@/components/user-detail-modal'
import EditUserModal from '@/components/edit-user-modal'
import { DataSourceInfo } from '@/components/ui/data-source-info'

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

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
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load server data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  const retryFetch = () => {
    setError(null)
    setLoading(true)
    fetchInitialData()
  }

  // User action handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setDetailModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditModalOpen(true)
  }

  const handleToggleUserStatus = async (user: any) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...user,
          isActive: !user.isActive
        }),
      })

      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u.id === user.id 
            ? { ...u, status: user.isActive ? 'inactive' : 'active' }
            : u
        ))
        
        if (detailModalOpen) {
          setDetailModalOpen(false)
        }
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const handleSaveUser = (updatedUser: any) => {
    setUsers(prev => prev.map(u => 
      u.id === updatedUser.id 
        ? { 
            ...u, 
            username: updatedUser.name || updatedUser.email.split('@')[0],
            email: updatedUser.email,
            role: updatedUser.role.toLowerCase(),
            status: updatedUser.isActive ? 'active' : 'inactive'
          }
        : u
    ))
    
    if (selectedUser && selectedUser.id === updatedUser.id) {
      setSelectedUser({
        ...selectedUser,
        ...updatedUser,
        username: updatedUser.name || updatedUser.email.split('@')[0],
        role: updatedUser.role.toLowerCase(),
        status: updatedUser.isActive ? 'active' : 'inactive'
      })
    }
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
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/50 to-black">
      <AestheticHeader currentPage="overview" />
      
      {/* Main Content */}
      <div className="pt-20 container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Custom Tab Navigation */}
          <div className="flex flex-wrap gap-2 p-1 bg-black/40 border border-purple-500/20 rounded-xl backdrop-blur-sm">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'pterodactyl', label: 'Pterodactyl', icon: Globe }
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/25' 
                      : 'text-purple-300 hover:text-white hover:bg-purple-500/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </Button>
              )
            })}
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Page Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
              <div className="relative text-center py-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  Server Management Center
                </h1>
                <p className="text-purple-300 text-lg">
                  Monitor and manage your game servers with ease
                </p>
              </div>
            </div>

            {/* Server Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden bg-black/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-purple-300">CPU Usage</CardTitle>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20">
                    <Cpu className="h-4 w-4 text-pink-400" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {serverStats.cpu}%
                  </div>
                  <Progress value={serverStats.cpu} className="mt-3 h-2 bg-purple-950/50" />
                  <p className="text-xs text-purple-400/70 mt-2">Processor utilization</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-black/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-purple-300">Memory</CardTitle>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20">
                    <MemoryStick className="h-4 w-4 text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {serverStats.memory}%
                  </div>
                  <Progress value={serverStats.memory} className="mt-3 h-2 bg-purple-950/50" />
                  <p className="text-xs text-purple-400/70 mt-2">RAM usage</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-black/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-purple-300">Disk Space</CardTitle>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20">
                    <HardDrive className="h-4 w-4 text-pink-400" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {serverStats.disk}%
                  </div>
                  <Progress value={serverStats.disk} className="mt-3 h-2 bg-purple-950/50" />
                  <p className="text-xs text-purple-400/70 mt-2">Storage utilization</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-black/40 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40 transition-all duration-300 group">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-purple-300">Network</CardTitle>
                  <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/20">
                    <Network className="h-4 w-4 text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {serverStats.network} Mbps
                  </div>
                  <div className="flex items-center mt-3">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    <p className="text-xs text-purple-400/70">Active connection</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-pink-400" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-purple-300/70">
                    Common server management tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0">
                    <Play className="h-4 w-4 mr-2" />
                    Start All Servers
                  </Button>
                  <Button variant="outline" className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart Services
                  </Button>
                  <Button variant="outline" className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-purple-400" />
                    System Status
                  </CardTitle>
                  <CardDescription className="text-purple-300/70">
                    Overall system health
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300">System Health</span>
                    <span className="text-green-400 font-bold">{serverStats.systemHealth}%</span>
                  </div>
                  <Progress value={serverStats.systemHealth} className="h-2 bg-purple-950/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300">Uptime</span>
                    <span className="text-purple-200 font-mono">{serverStats.uptime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300">Status</span>
                    <Badge className={`${getStatusColor(serverStats.status)} border`}>
                      {serverStats.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-white text-xl">User Management</CardTitle>
                    <CardDescription className="text-purple-300/70 mt-1">
                      Manage all registered users and their permissions
                    </CardDescription>
                  </div>
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-purple-500/20 bg-black/20">
                        <div className="col-span-4">
                          <span className="text-purple-300 text-sm font-medium">User</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-purple-300 text-sm font-medium">Balance</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-purple-300 text-sm font-medium">Servers</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-purple-300 text-sm font-medium">Status</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-purple-300 text-sm font-medium">Actions</span>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {users.map((user) => (
                          <div key={user.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-purple-500/10 hover:bg-black/20 transition-all duration-200 items-center">
                            {/* User Info */}
                            <div className="col-span-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                  <span className="text-white font-bold text-sm">
                                    {user.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-white font-medium truncate">{user.username}</p>
                                  <p className="text-purple-300/70 text-sm truncate">{user.email}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Balance */}
                            <div className="col-span-2">
                              <p className="text-white font-mono text-sm">{formatCurrency(user.balance)}</p>
                            </div>
                            
                            {/* Servers */}
                            <div className="col-span-2">
                              <p className="text-white text-sm">{user.servers} servers</p>
                            </div>
                            
                            {/* Status */}
                            <div className="col-span-2">
                              <Badge className={`${getStatusColor(user.status)} text-xs px-2 py-1 border`}>
                                {user.status.toUpperCase()}
                              </Badge>
                            </div>
                            
                            {/* Actions */}
                            <div className="col-span-2">
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all duration-200 h-8 w-8 p-0"
                                  onClick={() => handleViewUser(user)}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all duration-200 h-8 w-8 p-0"
                                  onClick={() => handleEditUser(user)}
                                  title="Edit User"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant={user.status === 'active' ? "destructive" : "default"}
                                  className={`${user.status === 'active' 
                                    ? "bg-red-500 hover:bg-red-600 text-white" 
                                    : "bg-green-500 hover:bg-green-600 text-white"
                                  } transition-all duration-200 h-8 w-8 p-0`}
                                  onClick={() => handleToggleUserStatus(user)}
                                  title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                                >
                                  {user.status === 'active' ? (
                                    <Ban className="h-4 w-4" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-4 p-4">
                      {users.map((user) => (
                        <div key={user.id} className="bg-black/20 border border-purple-500/10 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.username}</p>
                                <p className="text-purple-300/70 text-sm">{user.email}</p>
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(user.status)} text-xs px-2 py-1 border`}>
                              {user.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-purple-300/70 text-xs">Balance</p>
                              <p className="text-white font-mono text-sm">{formatCurrency(user.balance)}</p>
                            </div>
                            <div>
                              <p className="text-purple-300/70 text-xs">Servers</p>
                              <p className="text-white text-sm">{user.servers}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 flex-1"
                              onClick={() => handleViewUser(user)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 flex-1"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl">Payment History</CardTitle>
                <CardDescription className="text-purple-300/70">
                  Track all transactions and payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="h-12 w-12 text-purple-400/50 mx-auto mb-4" />
                      <p className="text-purple-300">No payments found</p>
                    </div>
                  ) : (
                    payments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 bg-black/20 border border-purple-500/10 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${
                            payment.type === 'deposit' ? 'bg-green-500/20' : 
                            payment.type === 'withdraw' ? 'bg-red-500/20' : 'bg-blue-500/20'
                          }`}>
                            <DollarSign className={`h-4 w-4 ${
                              payment.type === 'deposit' ? 'text-green-400' : 
                              payment.type === 'withdraw' ? 'text-red-400' : 'text-blue-400'
                            }`} />
                          </div>
                          <div>
                            <p className="text-white font-medium">{payment.description}</p>
                            <p className="text-purple-300/70 text-sm">{payment.username} • {payment.createdAt}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            payment.type === 'deposit' ? 'text-green-400' : 
                            payment.type === 'withdraw' ? 'text-red-400' : 'text-blue-400'
                          }`}>
                            {payment.type === 'deposit' ? '+' : '-'}{formatCurrency(payment.amount)}
                          </p>
                          <Badge className={`${getStatusColor(payment.status)} text-xs mt-1`}>
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pterodactyl Tab */}
          <TabsContent value="pterodactyl" className="space-y-6">
            <Card className="bg-black/40 border border-purple-500/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-xl">Pterodactyl Integration</CardTitle>
                <CardDescription className="text-purple-300/70">
                  Manage your Pterodactyl servers and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-black/20 border border-purple-500/10 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-medium">Total Servers</h3>
                      <Server className="h-5 w-5 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                      {serverStats.totalPteroServers}
                    </p>
                    <p className="text-purple-300/70 text-sm mt-1">
                      {serverStats.activePteroServers} active
                    </p>
                  </div>
                  
                  <div className="p-6 bg-black/20 border border-purple-500/10 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-medium">API Status</h3>
                      <Globe className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400">Connected</span>
                    </div>
                    <p className="text-purple-300/70 text-sm mt-1">
                      Last sync: Just now
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    asChild
                  >
                    <Link href="https://panel.androwproject.cloud" target="_blank">
                      <Terminal className="h-4 w-4 mr-2" />
                      Open Pterodactyl Panel
                    </Link>
                  </Button>
                  <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Servers
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {selectedUser && (
        <>
          <UserDetailModal
            user={selectedUser}
            isOpen={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            onToggleStatus={handleToggleUserStatus}
          />
          <EditUserModal
            user={selectedUser}
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSave={handleSaveUser}
          />
        </>
      )}
    </div>
  )
}