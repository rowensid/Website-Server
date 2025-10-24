'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Crown, Eye, EyeOff } from 'lucide-react'
import Logo from '@/components/logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorType, setErrorType] = useState<'error' | 'warning' | 'info'>('error')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setErrorType('error')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      const data = await response.json()

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user_data', JSON.stringify(data.user))
        
        // Show success message briefly before redirect
        setError('Login berhasil! Mengalihkan...')
        setErrorType('info')
        
        // Small delay to show success message
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Redirect to gateway page
        router.push('/gateway')
      } else {
        setError(data.error || 'Login gagal')
        // Set error type based on message
        if (data.error?.includes('belum terdaftar')) {
          setErrorType('info')
        } else if (data.error?.includes('dinonaktifkan')) {
          setErrorType('warning')
        } else {
          setErrorType('error')
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.name === 'AbortError') {
        setError('Timeout. Silakan coba lagi.')
      } else {
        setError('Terjadi kesalahan jaringan. Silakan coba lagi.')
      }
      setErrorType('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-black/40 backdrop-blur-2xl border-white/10 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-violet-400" />
              <CardTitle className="text-2xl font-bold text-white">Owner Panel</CardTitle>
            </div>
            <CardDescription className="text-purple-300">
              Masuk untuk mengakses pusat kontrol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="bg-black/20 border-white/10 text-white placeholder-gray-400 focus:border-violet-500/50"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password Anda"
                    className="bg-black/20 border-white/10 text-white placeholder-gray-400 focus:border-violet-500/50 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <div className={`
                  p-3 border rounded-lg
                  ${errorType === 'error' ? 'bg-red-500/10 border-red-500/30' : ''}
                  ${errorType === 'warning' ? 'bg-amber-500/10 border-amber-500/30' : ''}
                  ${errorType === 'info' ? 'bg-blue-500/10 border-blue-500/30' : ''}
                `}>
                  <p className={`
                    text-sm
                    ${errorType === 'error' ? 'text-red-400' : ''}
                    ${errorType === 'warning' ? 'text-amber-400' : ''}
                    ${errorType === 'info' ? 'text-blue-400' : ''}
                  `}>{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                disabled={loading}
              >
                {loading ? 'Masuk...' : 'Masuk'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
              <p className="text-violet-300 text-sm font-medium mb-2">Akun Demo:</p>
              <div className="space-y-1 text-xs text-violet-400">
                <p>Owner: owner@example.com / owner123</p>
                <p>Admin: admin@example.com / admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}