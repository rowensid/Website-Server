'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Monitor, Server, Code, Gamepad2, Users, Zap, Shield, Globe, ChevronRight, Menu, X, TrendingUp, Activity, Clock, Star } from 'lucide-react'
import Link from 'next/link'
import Logo from '@/components/logo'
import { ActiveServers } from '@/components/active-servers'

interface StatsData {
  totalUsers: number
  totalServices: number
  totalOrders: number
  totalRevenue: number
  recentUsers: number
  recentServices: number
  servicesByType: Array<{ type: string; _count: { type: number } }>
  uptime: string
  lastUpdated: string
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const services = [
    {
      icon: <Server className="w-8 h-8" />,
      title: "Game Hosting",
      description: "Server game hosting dengan performa tinggi dan latency rendah untuk pengalaman gaming terbaik",
      features: ["99.9% Uptime", "DDoS Protection", "Auto Backup", "24/7 Support"],
      gradient: "from-pink-500 to-purple-600"
    },
    {
      icon: <Monitor className="w-8 h-8" />,
      title: "RDP Premium",
      description: "Remote Desktop Protocol dengan spesifikasi tinggi untuk kebutuhan computing anda",
      features: ["High Performance", "Full Admin Access", "Unlimited Bandwidth", "Windows Server"],
      gradient: "from-purple-600 to-blue-600"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Development Services",
      description: "Jasa development khusus untuk FiveM dan Roblox dengan tim profesional",
      features: ["Custom Scripts", "UI/UX Design", "Database Setup", "Optimization"],
      gradient: "from-blue-600 to-pink-500"
    }
  ]

  const testimonials = [
    {
      name: "Rowens ID",
      role: "Developer",
      content: "Tim development sangat profesional. Custom script yang kami pesan sesuai ekspektasi dan berkualitas tinggi. Highly recommended!",
      rating: 5
    },
    {
      name: "Amerta Roleplay",
      role: "Game Server",
      content: "Layanan hosting terbaik yang pernah kami gunakan. Server selalu stabil dan support sangat responsif untuk komunitas gaming kami!",
      rating: 5
    },
    {
      name: "Mylo",
      role: "Customer Dev",
      content: "RDP premium dengan performa luar biasa. Server development kami jadi lancar tanpa lag sama sekali. Best service ever!",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/90 backdrop-blur-lg border-b border-white/10' : ''}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#services" className="hover:text-pink-400 transition-colors">Layanan</Link>
              <Link href="#stats" className="hover:text-pink-400 transition-colors">Statistik</Link>
              <Link href="#testimonials" className="hover:text-pink-400 transition-colors">Testimoni</Link>
              <Link href="/login">
                <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                  Daftar
                </Button>
              </Link>
            </div>

            <button 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-white/10">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link href="#services" className="block hover:text-pink-400 transition-colors">Layanan</Link>
              <Link href="#stats" className="block hover:text-pink-400 transition-colors">Statistik</Link>
              <Link href="#testimonials" className="block hover:text-pink-400 transition-colors">Testimoni</Link>
              <Link href="/login" className="block">
                <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white w-full">
                  Login
                </Button>
              </Link>
              <Link href="/register" className="block">
                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 w-full">
                  Daftar
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 via-purple-900/20 to-blue-900/20" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <Badge className="mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none">
            <Zap className="w-4 h-4 mr-2" />
            Creative Studio & Premium Hosting Services
          </Badge>
          
          <div className="mb-8">
            <Logo size="xl" className="justify-center mb-6" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
              Creative Studio
            </span>
            <br />
            <span className="text-white">& Development Solutions</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Solusi kreatif untuk kebutuhan digital anda. Game hosting premium, RDP berkualitas, dan jasa development profesional dengan sentuhan artistik yang unik.
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-gray-900/50 border-white/10 backdrop-blur-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-8 h-8 bg-gray-700 rounded-full mx-auto mb-2 animate-pulse" />
                    <div className="w-12 h-4 bg-gray-700 rounded mx-auto mb-1 animate-pulse" />
                    <div className="w-16 h-3 bg-gray-700 rounded mx-auto animate-pulse" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card className="bg-gray-900/50 border-white/10 backdrop-blur-lg">
                  <CardContent className="p-6 text-center">
                    <Users className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</div>
                    <div className="text-sm text-gray-400">Klien Aktif</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/50 border-white/10 backdrop-blur-lg">
                  <CardContent className="p-6 text-center">
                    <Server className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stats?.totalServices || 0}</div>
                    <div className="text-sm text-gray-400">Server Aktif</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/50 border-white/10 backdrop-blur-lg">
                  <CardContent className="p-6 text-center">
                    <Activity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stats?.uptime || '99.9%'}</div>
                    <div className="text-sm text-gray-400">Uptime</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/50 border-white/10 backdrop-blur-lg">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">
                      {stats?.recentUsers || 0}+
                    </div>
                    <div className="text-sm text-gray-400">Klien Baru</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Detailed Stats Section */}
      <section id="stats" className="py-20 px-4 bg-gradient-to-b from-black to-gray-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Statistik Real-Time
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Pantau performa layanan kami secara real-time
            </p>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-gray-900/50 border-white/10 backdrop-blur-lg">
                  <CardContent className="p-6">
                    <div className="w-full h-20 bg-gray-700 rounded animate-pulse mb-4" />
                    <div className="w-3/4 h-4 bg-gray-700 rounded animate-pulse mb-2" />
                    <div className="w-1/2 h-3 bg-gray-700 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-white/10 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center">
                    <Users className="w-5 h-5 mr-2 text-pink-500" />
                    Total Klien
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{stats?.totalUsers || 0}</div>
                  <div className="text-sm text-green-400 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{stats?.recentUsers || 0} minggu ini
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-white/10 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center">
                    <Server className="w-5 h-5 mr-2 text-purple-500" />
                    Server Aktif
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{stats?.totalServices || 0}</div>
                  <div className="text-sm text-green-400 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{stats?.recentServices || 0} minggu ini
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-white/10 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-500" />
                    Total Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{stats?.totalOrders || 0}</div>
                  <div className="text-sm text-gray-400">Selesai diproses</div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-white/10 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">
                    Rp {((stats?.totalRevenue || 0) / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-sm text-gray-400">Terakumulasi</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Active Servers Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900/50 to-black">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
                Server Aktif Real-Time
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Pantau status server game kami secara real-time
            </p>
          </div>
          
          <ActiveServers />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Layanan Kami
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Solusi komprehensif untuk kebutuhan gaming dan development anda
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="bg-gray-900/50 border-white/10 backdrop-blur-lg hover:border-pink-500/50 transition-all duration-300 group">
                <CardHeader>
                  <div className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    {service.icon}
                  </div>
                  <CardTitle className="text-2xl text-white">{service.title}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-300">
                        <ChevronRight className="w-4 h-4 mr-2 text-pink-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className={`w-full mt-6 bg-gradient-to-r ${service.gradient} hover:opacity-90 transition-opacity`}>
                    Pesan Sekarang
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-gradient-to-b from-black to-gray-900/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Apa Kata Klien
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Testimoni dari klien yang puas dengan layanan kami
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gray-900/50 border-white/10 backdrop-blur-lg hover:border-pink-500/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo size="md" className="mb-4" />
              <p className="text-gray-400">
                Creative studio dengan solusi premium untuk game hosting, development services, dan kebutuhan digital anda.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Layanan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-pink-400">Game Hosting</Link></li>
                <li><Link href="#" className="hover:text-pink-400">RDP Premium</Link></li>
                <li><Link href="#" className="hover:text-pink-400">FiveM Development</Link></li>
                <li><Link href="#" className="hover:text-pink-400">Roblox Development</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-pink-400">Tentang Kami</Link></li>
                <li><Link href="#" className="hover:text-pink-400">Kontak</Link></li>
                <li><Link href="#" className="hover:text-pink-400">Blog</Link></li>
                <li><Link href="#" className="hover:text-pink-400">Karir</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-pink-400">Help Center</Link></li>
                <li><Link href="#" className="hover:text-pink-400">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-pink-400">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-pink-400">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 A&S Studio Project. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}