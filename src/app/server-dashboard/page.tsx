'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { 
  Server, 
  Users, 
  CreditCard, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Settings,
  Power,
  PowerOff,
  RefreshCw,
  Search,
  Filter,
  Download,
  Upload,
  Shield,
  Ban,
  UserCheck,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
  Zap,
  Database,
  Globe,
  Cpu,
  HardDrive
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Service {
  id: string
  name: string
  type: string
  status: 'active' | 'inactive' | 'maintenance'
  uptime: number
  cpu: number
  memory: number
  storage: number
  users: number
  lastCheck: string
  description: string
  ip: string
  port: number
  price: number
  userId: string
  user: {
    name: string
    email: string
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  avatar?: string
  services: number
  totalSpent: number
}

interface Payment {
  id: string
  userId: string
  amount: number
  status: string
  paymentMethod: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  service?: {
    name: string
    type: string
  }
}

interface ServerStats {
  totalServices: number
  activeServices: number
  totalUsers: number
  totalRevenue: number
  pendingPayments: number
  systemUptime: number
}

export default function ManagementServer() {
  const [activeTab, setActiveTab] = useState('overview')
  const [services, setServices] = useState<Service[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<ServerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUserData()
    fetchServices()
    fetchUsers()
    fetchPayments()
    fetchStats()
    
    const interval = setInterval(() => {
      fetchServices()
      fetchStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        console.log('Management Server - User data:', userData.user)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/management/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/management/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/management/payments')
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/management/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleServiceAction = async (serviceId: string, action: string) => {
    try {
      const response = await fetch(`/api/management/services/${serviceId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        fetchServices()
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to perform service action:', error)
    }
  }

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const response = await fetch(`/api/management/users/${userId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        fetchUsers()
        fetchStats()
      }
    } catch (error) {
      console.error('Failed to perform user action:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'ACTIVE':
      case 'COMPLETED':
        return 'bg-emerald-500'
      case 'inactive':
      case 'INACTIVE':
      case 'CANCELLED':
        return 'bg-red-500'
      case 'maintenance':
      case 'PENDING':
        return 'bg-amber-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'ACTIVE':
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case 'inactive':
      case 'INACTIVE':
      case 'CANCELLED':
        return <PowerOff className="h-4 w-4 text-red-500" />
      case 'maintenance':
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPayments = payments.filter(payment =>
    payment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-8"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg">
                <Server className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Management Server</h1>
                <p className="text-sm text-gray-400">
                  Kelola user, payment, dan server
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/gateway"
                className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-200 text-gray-300 hover:text-white"
              >
                <Globe className="h-4 w-4" />
                <span className="font-medium text-sm">Gateway</span>
              </Link>
              
              <Link 
                href="/owner-panel"
                className="flex items-center gap-2 px-3 py-2 bg-violet-600/20 border border-violet-600/50 rounded-lg hover:bg-violet-600/30 hover:border-violet-500 transition-all duration-200 text-violet-400 hover:text-violet-300"
              >
                <Shield className="h-4 w-4" />
                <span className="font-medium text-sm">Owner Panel</span>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-800">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar || undefined} alt={user?.name || "User"} />
                      <AvatarFallback className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user?.name && (
                        <p className="font-medium text-white">{user.name}</p>
                      )}
                      {user?.email && (
                        <p className="w-[200px] truncate text-sm text-gray-400">
                          {user.email}
                        </p>
                      )}
                      <Badge variant="secondary" className="w-fit bg-violet-600 text-white">
                        {user?.role || 'USER'}
                      </Badge>
                    </div>
                  </div>
                  <Separator className="bg-gray-700" />
                  <DropdownMenuItem asChild>
                    <a href="/owner-panel" className="cursor-pointer text-gray-300 hover:text-white">
                      Owner Panel
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/member-dashboard" className="cursor-pointer text-gray-300 hover:text-white">
                      Member Dashboard
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="bg-gray-900 border-gray-800 hover:border-violet-600/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total Server</CardTitle>
                <Server className="h-4 w-4 text-violet-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalServices}</div>
                <p className="text-xs text-gray-400">
                  {stats.activeServices} aktif
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 hover:border-emerald-600/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Total User</CardTitle>
                <Users className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                <p className="text-xs text-gray-400">
                  Terdaftar
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 hover:border-amber-600/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <p className="text-xs text-gray-400">
                  Total pendapatan
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 hover:border-blue-600/50 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">Payment Pending</CardTitle>
                <CreditCard className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.pendingPayments}</div>
                <p className="text-xs text-gray-400">
                  Menunggu konfirmasi
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari user, server, atau payment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full bg-gray-900 border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="servers" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <Server className="w-4 h-4 mr-2" />
              Manage Server
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Manage User
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Payment
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Services */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Server className="h-5 w-5 text-violet-500" />
                    Server Terbaru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredServices.slice(0, 5).map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`h-2 w-2 rounded-full ${getStatusColor(service.status)}`} />
                          <div>
                            <p className="text-sm font-medium text-white">{service.name}</p>
                            <p className="text-xs text-gray-400">{service.user.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">{formatCurrency(service.price)}</p>
                          <p className="text-xs text-gray-400">{service.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Users */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-500" />
                    User Terbaru
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={user.isActive ? 'bg-emerald-600' : 'bg-red-600'}>
                            {user.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                          <p className="text-xs text-gray-400 mt-1">{user.services} server</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Manage Server Tab */}
          <TabsContent value="servers" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Manage Server</CardTitle>
                    <CardDescription className="text-gray-400">
                      Kelola semua server dan layanan
                    </CardDescription>
                  </div>
                  <Button className="bg-violet-600 hover:bg-violet-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Server
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredServices.length === 0 ? (
                  <div className="text-center py-12">
                    <Server className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Tidak ada server</h3>
                    <p className="text-gray-400 mb-4">
                      Belum ada server yang terdaftar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredServices.map((service) => (
                      <div key={service.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`h-3 w-3 rounded-full ${getStatusColor(service.status)}`} />
                            <div>
                              <h3 className="font-semibold text-white">{service.name}</h3>
                              <p className="text-sm text-gray-400">{service.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(service.status)}
                            <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                              {service.status}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-900 border-gray-700">
                                <DropdownMenuItem onClick={() => handleServiceAction(service.id, 'restart')} className="text-gray-300 hover:text-white">
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Restart
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleServiceAction(service.id, 'stop')} className="text-gray-300 hover:text-white">
                                  <PowerOff className="h-4 w-4 mr-2" />
                                  Stop
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleServiceAction(service.id, 'start')} className="text-gray-300 hover:text-white">
                                  <Power className="h-4 w-4 mr-2" />
                                  Start
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-700" />
                                <DropdownMenuItem className="text-red-400 hover:text-red-300">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-400">Pemilik</p>
                            <p className="font-medium text-white">{service.user.name}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Tipe</p>
                            <p className="font-medium text-white">{service.type}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Alamat</p>
                            <p className="font-medium text-white">{service.ip}:{service.port}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Harga</p>
                            <p className="font-medium text-white">{formatCurrency(service.price)}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">CPU Usage</span>
                            <span className="text-white">{service.cpu}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-violet-600 to-purple-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${service.cpu}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Memory Usage</span>
                            <span className="text-white">{service.memory}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-emerald-600 to-green-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${service.memory}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Storage Usage</span>
                            <span className="text-white">{service.storage}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${service.storage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Manage User</CardTitle>
                    <CardDescription className="text-gray-400">
                      Kelola semua user terdaftar
                    </CardDescription>
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Tidak ada user</h3>
                    <p className="text-gray-400 mb-4">
                      Belum ada user yang terdaftar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-white">{user.name}</h3>
                              <p className="text-sm text-gray-400">{user.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={user.role === 'ADMIN' ? 'bg-violet-600' : 'bg-blue-600'}>
                                  {user.role}
                                </Badge>
                                <Badge className={user.isActive ? 'bg-emerald-600' : 'bg-red-600'}>
                                  {user.isActive ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Total Server</p>
                            <p className="text-lg font-semibold text-white">{user.services}</p>
                            <p className="text-sm text-gray-400">Total Spent</p>
                            <p className="text-lg font-semibold text-white">{formatCurrency(user.totalSpent)}</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-900 border-gray-700">
                                <DropdownMenuItem className="text-gray-300 hover:text-white">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Lihat Detail
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-gray-300 hover:text-white">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-gray-700" />
                                {user.isActive ? (
                                  <DropdownMenuItem onClick={() => handleUserAction(user.id, 'deactivate')} className="text-amber-400 hover:text-amber-300">
                                    <Ban className="h-4 w-4 mr-2" />
                                    Nonaktifkan
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleUserAction(user.id, 'activate')} className="text-emerald-400 hover:text-emerald-300">
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Aktifkan
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-red-400 hover:text-red-300">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Terdaftar</p>
                            <p className="text-white">{formatDate(user.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Last Login</p>
                            <p className="text-white">{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">User ID</p>
                            <p className="text-white font-mono text-xs">{user.id}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Manage Payment</CardTitle>
                    <CardDescription className="text-gray-400">
                      Kelola semua transaksi pembayaran
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button className="bg-amber-600 hover:bg-amber-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Payment
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Tidak ada payment</h3>
                    <p className="text-gray-400 mb-4">
                      Belum ada transaksi pembayaran
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPayments.map((payment) => (
                      <div key={payment.id} className="border border-gray-700 rounded-lg p-4 bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${
                              payment.status === 'COMPLETED' ? 'bg-emerald-600/20' : 
                              payment.status === 'PENDING' ? 'bg-amber-600/20' : 'bg-red-600/20'
                            }`}>
                              {getStatusIcon(payment.status)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">
                                {payment.service ? payment.service.name : 'Payment'}
                              </h3>
                              <p className="text-sm text-gray-400">{payment.user.name} • {payment.user.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={
                                  payment.status === 'COMPLETED' ? 'bg-emerald-600' : 
                                  payment.status === 'PENDING' ? 'bg-amber-600' : 'bg-red-600'
                                }>
                                  {payment.status}
                                </Badge>
                                <Badge variant="outline" className="border-gray-600 text-gray-300">
                                  {payment.paymentMethod}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-2xl font-bold text-white">{formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-gray-400">{formatDate(payment.createdAt)}</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-900 border-gray-700">
                                <DropdownMenuItem className="text-gray-300 hover:text-white">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Lihat Detail
                                </DropdownMenuItem>
                                {payment.status === 'PENDING' && (
                                  <>
                                    <DropdownMenuItem className="text-emerald-400 hover:text-emerald-300">
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Konfirmasi
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-400 hover:text-red-300">
                                      <X className="h-4 w-4 mr-2" />
                                      Tolak
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator className="bg-gray-700" />
                                <DropdownMenuItem className="text-gray-300 hover:text-white">
                                  <Download className="h-4 w-4 mr-2" />
                                  Download Invoice
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}