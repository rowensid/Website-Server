'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, User, Users, Server, ShoppingBag, Database, LogOut, ChevronRight } from 'lucide-react'
import Logo from '@/components/logo'

export default function GatewayPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      console.log('Gateway - Checking auth...')
      const response = await fetch('/api/auth/me')
      console.log('Gateway - Auth response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Gateway - User data:', data.user) // Debug log
        setUser(data.user)
      } else {
        console.log('Gateway - Auth failed, redirecting to login')
        router.push('/login')
      }
    } catch (error) {
      console.error('Gateway - Auth error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-300">Welcome back,</div>
                <div className="font-semibold">{user.name}</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Choose Your Dashboard
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-4">
            Select the dashboard you want to access based on your needs
          </p>
          <div className="flex justify-center">
            <Badge className={(user.role === 'ADMIN' || user.role === 'OWNER') ? 'bg-purple-500' : 'bg-blue-500'} variant="secondary">
              {(user.role === 'ADMIN' || user.role === 'OWNER') ? '👑 Administrator Access' : '👤 Member Access'}
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Member Dashboard */}
          <Card className="bg-gray-900/50 border-white/10 backdrop-blur-lg hover:border-pink-500/50 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                  Member
                </Badge>
              </div>
              <CardTitle className="text-2xl text-white">Member Dashboard</CardTitle>
              <CardDescription className="text-gray-300">
                Manage your personal services, orders, and account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-300">
                  <Server className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="text-sm">View your active services</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <ShoppingBag className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="text-sm">Track your orders</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <Users className="w-4 h-4 mr-3 text-blue-500" />
                  <span className="text-sm">Account settings</span>
                </div>
              </div>
              <Link href="/member-dashboard">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  Open Member Dashboard
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Owner Dashboard - Only for Admins */}
          {(user.role === 'ADMIN' || user.role === 'OWNER') && (
            <Card className="bg-gray-900/50 border-white/10 backdrop-blur-lg hover:border-purple-500/50 transition-all duration-300 group relative">
              <div className="absolute -top-2 -right-2">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse">
                  <Crown className="w-3 h-3 mr-1" />
                  ADMIN ACCESS
                </Badge>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Crown className="w-6 h-6" />
                  </div>
                  <Badge variant="outline" className="border-purple-500 text-purple-400">
                    Owner
                  </Badge>
                </div>
                <CardTitle className="text-2xl text-white">Owner Panel</CardTitle>
                <CardDescription className="text-gray-300">
                  Full system control - manage users, services, and all operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-300">
                    <Users className="w-4 h-4 mr-3 text-purple-500" />
                    <span className="text-sm">Manage all users</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Server className="w-4 h-4 mr-3 text-purple-500" />
                    <span className="text-sm">Control all services</span>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Database className="w-4 h-4 mr-3 text-purple-500" />
                    <span className="text-sm">Database management</span>
                  </div>
                </div>
                <Link href="/owner-panel">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    Open Owner Panel
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="bg-gray-900/50 border-white/10 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-xl text-white">Account Info</CardTitle>
              <CardDescription className="text-gray-300">
                Your account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Your Role</span>
                  <Badge className={(user.role === 'ADMIN' || user.role === 'OWNER') ? 'bg-purple-500' : 'bg-blue-500'}>
                    {user.role === 'ADMIN' || user.role === 'OWNER' ? 'Administrator' : 'Member'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Account Status</span>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Email</span>
                  <span className="text-sm text-gray-300 truncate max-w-[150px]">{user.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Help Section */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-4">
            Need help choosing the right dashboard?
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}