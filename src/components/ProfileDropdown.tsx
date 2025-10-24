'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Settings, 
  History, 
  LogOut, 
  ChevronUp, 
  Shield, 
  Calendar,
  Monitor,
  MapPin,
  Clock,
  X
} from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

interface LoginHistory {
  id: string
  loginTime: string
  ip: string
  userAgent: string
  location?: string
  device?: string
  browser?: string
  isActive?: boolean
}

interface ProfileDropdownProps {
  user: UserData
  onLogout: () => void
  onSettings: () => void
}

export default function ProfileDropdown({ user, onLogout, onSettings }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const fetchLoginHistory = async () => {
    setLoadingHistory(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch('/api/auth/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setLoginHistory(data.history)
      } else {
        // Fallback to mock data if API fails
        const mockHistory: LoginHistory[] = [
          {
            id: '1',
            loginTime: new Date().toISOString(),
            ip: '192.168.1.100',
            userAgent: navigator.userAgent,
            location: 'Jakarta, Indonesia',
            device: 'Desktop',
            browser: 'Chrome'
          },
          {
            id: '2',
            loginTime: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            ip: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            location: 'Surabaya, Indonesia',
            device: 'Desktop',
            browser: 'Firefox'
          },
          {
            id: '3',
            loginTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            ip: '192.168.1.102',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
            location: 'Bandung, Indonesia',
            device: 'Mobile',
            browser: 'Safari'
          }
        ]
        setLoginHistory(mockHistory)
      }
    } catch (error) {
      console.error('Failed to fetch login history:', error)
      // Fallback to mock data
      const mockHistory: LoginHistory[] = [
        {
          id: '1',
          loginTime: new Date().toISOString(),
          ip: '192.168.1.100',
          userAgent: navigator.userAgent,
          location: 'Jakarta, Indonesia',
          device: 'Desktop',
          browser: 'Chrome'
        }
      ]
      setLoginHistory(mockHistory)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleShowHistory = () => {
    setShowHistory(true)
    fetchLoginHistory()
    setIsOpen(false)
  }

  const getDeviceIcon = (device?: string) => {
    switch (device?.toLowerCase()) {
      case 'mobile':
        return '📱'
      case 'tablet':
        return '📱'
      case 'desktop':
      default:
        return '💻'
    }
  }

  const getBrowserIcon = (browser?: string) => {
    switch (browser?.toLowerCase()) {
      case 'chrome':
        return '🌐'
      case 'firefox':
        return '🦊'
      case 'safari':
        return '🧭'
      case 'edge':
        return '📘'
      default:
        return '🌍'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleDropdown}
          className="flex items-center gap-2 hover:bg-white/10 transition-all duration-200"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <ChevronUp className="w-4 h-4 text-cyan-300 transition-transform duration-200" />
        </Button>

        {isOpen && (
          <div className="absolute right-0 bottom-full mb-2 w-80 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-lg shadow-2xl shadow-black/50 z-50">
            {/* User Info */}
            <div className="p-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{user.name}</h3>
                  <p className="text-sm text-cyan-300">{user.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">{user.role}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettings}
                className="w-full justify-start gap-3 text-cyan-300 hover:text-white hover:bg-cyan-500/20 transition-all duration-200"
              >
                <Settings className="w-4 h-4" />
                Pengaturan Akun
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShowHistory}
                className="w-full justify-start gap-3 text-cyan-300 hover:text-white hover:bg-cyan-500/20 transition-all duration-200"
              >
                <History className="w-4 h-4" />
                Histori Login
              </Button>
              
              <hr className="my-2 border-cyan-500/20" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-200"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Login History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900/95 backdrop-blur-2xl border-cyan-500/30 shadow-2xl shadow-black/50 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <CardHeader className="border-b border-cyan-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  <CardTitle className="text-xl font-bold text-white">Histori Login</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription className="text-cyan-300">
                Riwayat login dan aktivitas akun Anda
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                </div>
              ) : loginHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Belum Ada Histori</h3>
                  <p className="text-gray-500">
                    Belum ada aktivitas login yang tercatat
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {loginHistory.map((history) => (
                    <div
                      key={history.id}
                      className="bg-gray-800/50 border border-cyan-500/20 rounded-lg p-4 hover:bg-gray-800/70 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm font-medium text-white">
                            {formatDate(history.loginTime)}
                          </span>
                        </div>
                        {history.isActive && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            Sesi Aktif
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">IP:</span>
                          <span className="text-cyan-300 font-mono">{history.ip}</span>
                        </div>
                        
                        {history.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">Lokasi:</span>
                            <span className="text-cyan-300">{history.location}</span>
                          </div>
                        )}
                        
                        {history.device && (
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">Perangkat:</span>
                            <span className="text-cyan-300">
                              {getDeviceIcon(history.device)} {history.device}
                            </span>
                          </div>
                        )}
                        
                        {history.browser && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300">Browser:</span>
                            <span className="text-cyan-300">
                              {getBrowserIcon(history.browser)} {history.browser}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-cyan-400 mt-0.5" />
                  <div className="text-sm text-cyan-300">
                    <p className="font-medium mb-1">Keamanan Akun</p>
                    <p className="text-xs">
                      Histori login membantu Anda memantau aktivitas akun. Jika Anda melihat aktivitas yang mencurigakan, 
                      segera ubah password dan hubungi support.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}