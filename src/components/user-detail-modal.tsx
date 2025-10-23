'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  Server, 
  ShoppingBag, 
  DollarSign,
  Shield,
  Activity,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  Globe,
  Zap,
  TrendingUp,
  Package,
  CreditCard,
  UserCheck,
  MapPin,
  Phone,
  Briefcase,
  Star,
  Award,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Cpu,
  Database,
  Settings,
  LogOut,
  RefreshCw
} from 'lucide-react'

interface UserDetailModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string | null
  onEdit: (user: any) => void
  onToggleStatus: (user: any) => void
}

interface UserDetails {
  id: string
  name: string | null
  email: string
  role: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  avatar: string | null
  orders: any[]
  services: any[]
  pteroServers: any[]
  _count: {
    orders: number
    services: number
    pteroServers: number
  }
}

export default function UserDetailModal({ 
  isOpen, 
  onClose, 
  userId, 
  onEdit, 
  onToggleStatus 
}: UserDetailModalProps) {
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails()
    }
  }, [isOpen, userId])

  const fetchUserDetails = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${userId}`)
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        console.error('Failed to fetch user details')
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: boolean) => {
    return status 
      ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
      : 'text-red-400 bg-red-400/10 border-red-400/20'
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'text-violet-400 bg-violet-400/10 border-violet-400/20'
      case 'USER':
      default:
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-950 border-4 border-slate-700 text-white max-w-2xl w-[90vw] max-h-[80vh] rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-white animate-spin" />
              </div>
            </div>
            <p className="text-slate-300 mt-6 text-lg font-medium">Loading user data...</p>
            <p className="text-slate-500 text-sm mt-2">Please wait a moment</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-slate-950 border-4 border-slate-700 text-white max-w-2xl w-[90vw] max-h-[80vh] rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
              <User className="h-8 w-8 text-red-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-red-400 mb-3 text-center">User Not Found</DialogTitle>
            <DialogDescription className="text-slate-400 text-center max-w-md">
              The requested user could not be found or may have been deleted.
            </DialogDescription>
            <Button onClick={onClose} className="mt-6 bg-violet-600 hover:bg-violet-700">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-950 border-4 border-slate-700 text-white max-w-none w-[98vw] h-[95vh] max-h-[95vh] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border-b border-slate-800">
          <div className="px-6 py-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-xl object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'} border-2 border-slate-950`}></div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.name || 'Unknown User'}</h2>
                  <p className="text-slate-400 text-sm">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className={`${getRoleColor(user.role)} text-xs px-2 py-1 border-0`}>
                      {user.role}
                    </Badge>
                    <Badge className={`${getStatusColor(user.isActive)} text-xs px-2 py-1 border-0`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  onClick={() => onEdit(user)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={user.isActive ? "destructive" : "default"}
                  className={user.isActive ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}
                  onClick={() => onToggleStatus(user)}
                >
                  {user.isActive ? (
                    <>
                      <Ban className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-800">
          <div className="flex space-x-1 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'orders', label: 'Orders', icon: ShoppingBag },
              { id: 'services', label: 'Services', icon: Server },
              { id: 'activity', label: 'Activity', icon: Activity }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-violet-400 border-violet-400'
                    : 'text-slate-400 border-transparent hover:text-slate-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1 h-[calc(95vh-200px)]">
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Total Orders</p>
                          <p className="text-2xl font-bold text-white mt-1">{user._count.orders}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-violet-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Active Services</p>
                          <p className="text-2xl font-bold text-white mt-1">{user._count.services}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Server className="h-5 w-5 text-emerald-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Ptero Servers</p>
                          <p className="text-2xl font-bold text-white mt-1">{user._count.pteroServers}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Account Status</p>
                          <p className="text-lg font-bold text-white mt-1">
                            {user.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* User Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-white flex items-center">
                        <User className="h-5 w-5 mr-2 text-violet-400" />
                        User Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-800">
                        <span className="text-slate-400 text-sm">User ID</span>
                        <span className="text-white font-mono text-sm">{user.id}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-800">
                        <span className="text-slate-400 text-sm">Full Name</span>
                        <span className="text-white text-sm">{user.name || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-800">
                        <span className="text-slate-400 text-sm">Email</span>
                        <span className="text-white text-sm">{user.email}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-400 text-sm">Role</span>
                        <Badge className={`${getRoleColor(user.role)} text-xs px-2 py-1 border-0`}>
                          {user.role}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-white flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-violet-400" />
                        Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-800">
                        <span className="text-slate-400 text-sm">Member Since</span>
                        <span className="text-white text-sm">{formatDate(user.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-400 text-sm">Last Login</span>
                        <span className="text-white text-sm">{formatDate(user.lastLoginAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Orders</h3>
                {user.orders && user.orders.length > 0 ? (
                  <div className="space-y-3">
                    {user.orders.map((order: any) => (
                      <Card key={order.id} className="bg-slate-900 border-slate-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                <Package className="h-5 w-5 text-violet-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium">Order #{order.id}</p>
                                <p className="text-slate-400 text-sm">{formatDate(order.createdAt)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-medium">{formatCurrency(order.amount)}</p>
                              <Badge className={`text-xs px-2 py-1 border-0 ${
                                order.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                                order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No orders found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Active Services</h3>
                {user.services && user.services.length > 0 ? (
                  <div className="space-y-3">
                    {user.services.map((service: any) => (
                      <Card key={service.id} className="bg-slate-900 border-slate-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <Server className="h-5 w-5 text-emerald-400" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{service.name || 'Service'}</p>
                                <p className="text-slate-400 text-sm">{service.type} • {formatDate(service.createdAt)}</p>
                              </div>
                            </div>
                            <Badge className={`text-xs px-2 py-1 border-0 ${
                              service.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {service.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Server className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No services found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Activity tracking coming soon</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}