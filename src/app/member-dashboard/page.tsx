'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Store, Package, Settings, LogOut, ArrowLeft, TrendingUp } from 'lucide-react'
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

export default function MemberDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    router.push('/login')
  }

  const handleBackToGateway = () => {
    router.push('/gateway')
  }

  const handleSettings = () => {
    // TODO: Navigate to settings page
    console.log('Navigate to settings')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-950 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-950 via-blue-950 to-indigo-950">
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToGateway}
                className="text-cyan-300 hover:text-white hover:bg-cyan-500/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <Logo size="sm" />
              <h1 className="text-xl font-bold text-white">Member Dashboard</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Selamat Datang, {user.name}! 👋
          </h2>
          <p className="text-cyan-300">
            Ini adalah dashboard personal Anda. Kelola akun dan lihat layanan yang tersedia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 backdrop-blur-2xl border-cyan-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-300">
                Total Pesanan
              </CardTitle>
              <Package className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">0</div>
              <p className="text-xs text-cyan-400">
                Belum ada pesanan
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-900/50 to-green-900/50 backdrop-blur-2xl border-emerald-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-300">
                Status Akun
              </CardTitle>
              <User className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">Aktif</div>
              <p className="text-xs text-emerald-400">
                Akun Anda dalam kondisi baik
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-2xl border-purple-500/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">
                Member Sejak
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {new Date(user.createdAt).toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div>
              <p className="text-xs text-purple-400">
                Bergabung sebagai {user.role.toLowerCase()}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 backdrop-blur-2xl border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-cyan-400" />
                Jelajahi Layanan
              </CardTitle>
              <CardDescription className="text-cyan-300">
                Lihat semua layanan dan produk yang tersedia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                Lihat Semua Layanan
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-2xl border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-400" />
                Pengaturan Akun
              </CardTitle>
              <CardDescription className="text-purple-300">
                Kelola profil dan pengaturan akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Edit Profil
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-2xl border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white">Aktivitas Terbaru</CardTitle>
            <CardDescription className="text-gray-400">
              Riwayat aktivitas akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">Belum Ada Aktivitas</h3>
              <p className="text-gray-500 mb-4">
                Anda belum memiliki aktivitas apa pun. Mulai dengan menjelajahi layanan kami!
              </p>
              <Button 
                onClick={() => router.push('/gateway')}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
              >
                Jelajahi Sekarang
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
