'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  User, 
  Store, 
  Package, 
  Settings, 
  LogOut, 
  ArrowLeft, 
  TrendingUp,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Activity,
  Server,
  Gamepad2
} from 'lucide-react'
import Logo from '@/components/logo'
import ProfileDropdown from '@/components/ProfileDropdown'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

interface DashboardStats {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  totalSpent: number
  activeServices: number
  completionRate: number
}

interface Order {
  id: string
  title: string
  type: string
  amount: number
  status: string
  paymentMethod: string
  createdAt: string
  serviceStatus?: string
}

interface StoreItem {
  id: string
  title: string
  description: string
  price: number
  category: string
  imageUrl?: string
  featured: boolean
}

export default function MemberDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [storeItems, setStoreItems] = useState<StoreItem[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingStore, setLoadingStore] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')
    
    if (!token || !userData) {
      router.push('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (error) {
      console.error('Failed to parse user data:', error)
      router.push('/login')
      return
    }

    setLoading(false)
  }, [router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      fetchStoreItems()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentOrders(data.recentOrders)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchStoreItems = async () => {
    try {
      const response = await fetch('/api/store?limit=6&featured=true')
      if (response.ok) {
        const data = await response.json()
        setStoreItems(data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch store items:', error)
    } finally {
      setLoadingStore(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    router.push('/login')
  }

  const handleBackToGateway = () => {
    router.push('/gateway')
  }

  const handleSettings = () => {
    console.log('Navigate to settings')
  }

  const handlePurchaseItem = (item: StoreItem) => {
    router.push(`/member-dashboard/order?serviceId=${item.id}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'PENDING': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'CANCELLED': return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'CANCELLED': return <AlertCircle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MOD': return <Gamepad2 className="w-5 h-5" />
      case 'GAME': return <Gamepad2 className="w-5 h-5" />
      case 'HOSTING': return <Server className="w-5 h-5" />
      case 'SERVER': return <Server className="w-5 h-5" />
      default: return <Package className="w-5 h-5" />
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
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/50 to-slate-950">
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToGateway}
                className="text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <Logo size="sm" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Member Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ProfileDropdown 
                user={user} 
                onLogout={handleLogout}
                onSettings={handleSettings}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-3">
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Welcome back,
                </span>
                <br />
                <span className="text-white">{user.name}! 👋</span>
              </h2>
              <p className="text-slate-400 text-lg">
                Manage your account and explore our premium services
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm font-medium">Account Active</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-violet-600/20 to-purple-600/20 backdrop-blur-xl border-violet-500/20 hover:border-violet-400/40 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-violet-300">
                Total Orders
              </CardTitle>
              <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-violet-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-white mb-1">
                {loadingStats ? (
                  <div className="w-12 h-8 bg-violet-500/20 rounded animate-pulse" />
                ) : (
                  stats?.totalOrders || 0
                )}
              </div>
              <p className="text-xs text-violet-400/80">
                {loadingStats ? 'Loading...' : `${stats?.pendingOrders || 0} pending`}
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-600/20 to-green-600/20 backdrop-blur-xl border-emerald-500/20 hover:border-emerald-400/40 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-emerald-300">
                Total Spent
              </CardTitle>
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-white mb-1">
                {loadingStats ? (
                  <div className="w-16 h-8 bg-emerald-500/20 rounded animate-pulse" />
                ) : (
                  formatCurrency(stats?.totalSpent || 0)
                )}
              </div>
              <p className="text-xs text-emerald-400/80">
                {loadingStats ? 'Loading...' : `${stats?.completedOrders || 0} completed`}
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-600/20 to-orange-600/20 backdrop-blur-xl border-amber-500/20 hover:border-amber-400/40 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-amber-300">
                Active Services
              </CardTitle>
              <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Server className="h-4 w-4 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-white mb-1">
                {loadingStats ? (
                  <div className="w-8 h-8 bg-amber-500/20 rounded animate-pulse" />
                ) : (
                  stats?.activeServices || 0
                )}
              </div>
              <p className="text-xs text-amber-400/80">
                {loadingStats ? 'Loading...' : 'Currently running'}
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-rose-600/20 to-pink-600/20 backdrop-blur-xl border-rose-500/20 hover:border-rose-400/40 transition-all duration-300 hover:shadow-2xl hover:shadow-rose-500/10">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-rose-300">
                Success Rate
              </CardTitle>
              <div className="w-8 h-8 bg-rose-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-rose-400" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-white mb-1">
                {loadingStats ? (
                  <div className="w-12 h-8 bg-rose-500/20 rounded animate-pulse" />
                ) : (
                  `${stats?.completionRate || 0}%`
                )}
              </div>
              <p className="text-xs text-rose-400/80">
                {loadingStats ? 'Loading...' : 'Completion rate'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-1 rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-400 rounded-lg transition-all duration-200"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="store" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-400 rounded-lg transition-all duration-200"
            >
              Store
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-slate-400 rounded-lg transition-all duration-200"
            >
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-violet-400" />
                      </div>
                      Recent Orders
                    </CardTitle>
                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                      Last 5 orders
                    </Badge>
                  </div>
                  <CardDescription className="text-slate-400">
                    Your most recent purchase history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80 pr-4">
                    {loadingStats ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
                          <p className="text-slate-400 text-sm">Loading orders...</p>
                        </div>
                      </div>
                    ) : recentOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Package className="w-8 h-8 text-slate-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-300 mb-2">No orders yet</h3>
                        <p className="text-slate-500 mb-6">
                          Start by exploring our store and making your first purchase!
                        </p>
                        <Button 
                          onClick={() => router.push('/gateway')}
                          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                        >
                          <Store className="w-4 h-4 mr-2" />
                          Browse Store
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentOrders.map((order, index) => (
                          <div 
                            key={order.id} 
                            className="group relative p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-violet-500/30 hover:bg-slate-800/70 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white mb-1 truncate">{order.title}</p>
                                <p className="text-sm text-slate-400 mb-2">{formatDate(order.createdAt)}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                                    {order.type}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-lg font-bold text-violet-400">
                                  {formatCurrency(order.amount)}
                                </span>
                                <Badge className={`${getStatusColor(order.status)} text-xs`}>
                                  {getStatusIcon(order.status)}
                                  <span className="ml-1">{order.status}</span>
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Frequently used actions and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => router.push('/gateway')}
                    className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25"
                  >
                    <Store className="w-5 h-5 mr-3" />
                    Browse Store
                  </Button>
                  
                  <Button 
                    onClick={() => router.push('/member-dashboard?tab=orders')}
                    variant="outline"
                    className="w-full h-12 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-500 font-medium transition-all duration-200"
                  >
                    <Package className="w-5 h-5 mr-3" />
                    View All Orders
                  </Button>
                  
                  <Button 
                    onClick={handleSettings}
                    variant="outline"
                    className="w-full h-12 border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-500 font-medium transition-all duration-200"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Account Settings
                  </Button>

                  <div className="pt-4 border-t border-slate-700/50">
                    <div className="p-4 bg-gradient-to-r from-violet-600/10 to-purple-600/10 rounded-lg border border-violet-500/20">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-violet-400" />
                        </div>
                        <h4 className="font-semibold text-white">Pro Tip</h4>
                      </div>
                      <p className="text-sm text-slate-300">
                        Check out our featured items in the Store tab for exclusive deals!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Store Tab */}
          <TabsContent value="store" className="space-y-8">
            <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                      Featured Items
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-2">
                      Premium products and services handpicked for you
                    </CardDescription>
                  </div>
                  <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-none">
                    Popular
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {loadingStore ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
                      <p className="text-slate-400 text-sm">Loading store items...</p>
                    </div>
                  </div>
                ) : storeItems.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Store className="w-10 h-10 text-slate-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-300 mb-3">No items available</h3>
                    <p className="text-slate-500">
                      Check back later for new products and services.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {storeItems.map((item) => (
                      <Card 
                        key={item.id} 
                        className="group relative bg-slate-800/50 border-slate-700/50 hover:border-violet-500/50 hover:bg-slate-800/70 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 overflow-hidden"
                      >
                        {item.featured && (
                          <div className="absolute top-3 right-3 z-10">
                            <Badge className="bg-gradient-to-r from-amber-600 to-orange-600 text-white border-none text-xs">
                              Featured
                            </Badge>
                          </div>
                        )}
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              {getCategoryIcon(item.category)}
                            </div>
                            <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-semibold text-white line-clamp-2 mb-2 group-hover:text-violet-300 transition-colors">
                            {item.title}
                          </CardTitle>
                          <CardDescription className="text-slate-400 line-clamp-3 text-sm">
                            {item.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-slate-500 mb-1">Price</p>
                              <p className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handlePurchaseItem(item)}
                            className="w-full h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Purchase Now
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-8">
            <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  Order History
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Complete history of all your orders and purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-300 mb-3">Feature Coming Soon</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Detailed order history and management will be available in the next update.
                  </p>
                  <Button 
                    onClick={() => router.push('/gateway')}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  >
                    <Store className="w-4 h-4 mr-2" />
                    Back to Store
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}