"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  Server, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  UserPlus,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  Building,
  Monitor,
  ArrowLeft,
  Home,
  User,
  ChevronDown,
  Settings,
  LogOut,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar
} from 'recharts';

export default function OwnerPanel() {
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setProfileDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        console.log('Owner Panel - User data:', data.user);
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-400 mb-4">No data available</p>
            <Button onClick={fetchDashboardStats} className="bg-violet-600 hover:bg-violet-700">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { overview, serviceDistribution, monthlyRevenue, activities } = dashboardStats;

  // Prepare data for charts
  const revenueData = monthlyRevenue.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('id-ID', { month: 'short' }),
    revenue: item.revenue,
    orders: item.orders,
    customers: Math.floor(item.orders * 0.4) // Estimate customers
  }));

  const serviceData = serviceDistribution.map((service: any) => ({
    name: service.type.replace('_', ' '),
    value: service.count,
    color: 
      service.type === 'GAME_HOSTING' ? '#8b5cf6' :
      service.type === 'RDP' ? '#3b82f6' :
      service.type === 'FIVEM_DEVELOPMENT' ? '#06b6d4' :
      '#10b981'
  }));

  const customerGrowth = monthlyRevenue.map((item: any, index: number) => ({
    month: new Date(item.month + '-01').toLocaleDateString('id-ID', { month: 'short' }),
    totalCustomers: Math.floor(item.orders * 0.4 * (index + 1)),
    newCustomers: Math.floor(item.orders * 0.4),
    churnRate: Math.random() * 3 // Mock churn rate
  }));

  const topServices = serviceDistribution
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5)
    .map((service: any) => ({
      name: service.type.replace('_', ' '),
      revenue: service.count * 150000, // Estimate revenue
      customers: service.count,
      growth: Math.floor(Math.random() * 20) // Mock growth
    }));

  const totalRevenue = overview.totalRevenue;
  const totalOrders = monthlyRevenue.reduce((sum: number, item: any) => sum + item.orders, 0);
  const totalCustomers = overview.totalUsers;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/90 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo + Profile */}
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-violet-600/20 hover:border hover:border-violet-500/50 transition-all duration-200"
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    {currentUser?.avatar ? (
                      <img src={currentUser.avatar} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="hidden md:block text-sm">
                    {currentUser?.name || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {profileDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-lg border border-gray-600 rounded-lg shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm font-medium text-white">{currentUser?.name || 'User'}</p>
                      <p className="text-xs text-gray-400">{currentUser?.email || 'user@example.com'}</p>
                      <Badge className={`mt-1 ${currentUser?.role === 'ADMIN' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                        {currentUser?.role === 'ADMIN' ? 'Administrator' : 'Member'}
                      </Badge>
                    </div>
                    <div className="py-2">
                      <Link href="/owner-panel/settings">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full justify-start text-gray-300 hover:text-white hover:bg-violet-600/20 hover:border-l-2 hover:border-l-violet-500 transition-all duration-200"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start text-gray-300 hover:text-red-400 hover:bg-red-600/20 hover:border-l-2 hover:border-l-red-500 transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Logo dan Nama */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-white">Dashboard Pemilik</h1>
                  <p className="text-xs text-gray-400">Analitik & Laporan Bisnis</p>
                </div>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/pterodactyl'}
                className="text-gray-300 border-gray-600 hover:bg-purple-600/20 hover:border-purple-500 hover:text-purple-400 transition-all duration-200"
              >
                <Server className="h-4 w-4 mr-2" />
                Pterodactyl
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/manage-server'}
                className="text-gray-300 border-gray-600 hover:bg-emerald-600/20 hover:border-emerald-500 hover:text-emerald-400 transition-all duration-200"
              >
                <Server className="h-4 w-4 mr-2" />
                Server
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchDashboardStats}
                className="text-gray-300 border-gray-600 hover:bg-cyan-600/20 hover:border-cyan-500 hover:text-cyan-400 transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>

              {/* Back to Gateway Button */}
              <Link 
                href="/gateway"
                className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-600/50 hover:border-gray-500 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 text-gray-300" />
                <span className="text-gray-300 font-medium text-sm">Gateway</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Period Selector */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Ringkasan Bisnis</h2>
            <p className="text-gray-400 text-sm">Pantau kinerja bisnis Anda dalam periode tertentu</p>
          </div>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="1month">Bulan Lalu</option>
            <option value="3months">3 Bulan Terakhir</option>
            <option value="6months">6 Bulan Terakhir</option>
            <option value="1year">Tahun Lalu</option>
          </select>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <div className="flex items-center text-xs text-white/80 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>Dari {totalOrders} transaksi</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(totalCustomers)}</div>
              <div className="flex items-center text-xs text-white/80 mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>+12% dari bulan lalu</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Server Aktif</CardTitle>
              <Server className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(overview.totalServers || 0)}</div>
              <div className="flex items-center text-xs text-white/80 mt-1">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                <span>99.9% uptime</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4%</div>
              <div className="flex items-center text-xs text-white/80 mt-1">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                <span>-0.8% dari bulan lalu</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LineChart className="h-5 w-5 text-violet-500" />
                Tren Pendapatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Pendapatan"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Pesanan"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Service Distribution */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-500" />
                Distribusi Layanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Customer Growth & Top Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Customer Growth */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-green-500" />
                Pertumbuhan Pelanggan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="totalCustomers" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981"
                    name="Total Pelanggan"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="newCustomers" 
                    stackId="2"
                    stroke="#3b82f6" 
                    fill="#3b82f6"
                    name="Pelanggan Baru"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Services */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-500" />
                Layanan Terpopuler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topServices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#f59e0b" name="Pendapatan" />
                  <Bar dataKey="customers" fill="#8b5cf6" name="Pelanggan" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              Aktivitas Terkini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities?.slice(0, 5).map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'order' ? 'bg-green-500' :
                      activity.type === 'server' ? 'bg-blue-500' :
                      'bg-purple-500'
                    }`} />
                    <div>
                      <p className="text-white text-sm font-medium">{activity.description}</p>
                      <p className="text-gray-400 text-xs">{formatDate(activity.createdAt)}</p>
                    </div>
                  </div>
                  <Badge className={
                    activity.status === 'completed' ? 'bg-green-600' :
                    activity.status === 'pending' ? 'bg-yellow-600' :
                    'bg-red-600'
                  }>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}