'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  User, 
  Settings, 
  LogOut, 
  Server, 
  Activity, 
  Users, 
  Home,
  ChevronDown,
  Bell,
  Search,
  Menu,
  X,
  Zap,
  CreditCard,
  Globe,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

interface AestheticHeaderProps {
  currentPage?: string
}

export default function AestheticHeader({ currentPage = 'overview' }: AestheticHeaderProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)

  const menuItems = [
    { 
      id: 'overview', 
      label: 'Dashboard', 
      icon: BarChart3, 
      href: '/manage-server',
      description: 'Main dashboard overview'
    },
    { 
      id: 'live-server', 
      label: 'Pterodactyl Servers', 
      icon: Activity, 
      href: '/live-server',
      description: 'Pterodactyl server monitoring'
    },
    { 
      id: 'manage-users', 
      label: 'Manage Users', 
      icon: Users, 
      href: '/manage-server?tab=users',
      description: 'User management'
    },
    { 
      id: 'payments', 
      label: 'Payments', 
      icon: CreditCard, 
      href: '/manage-server?tab=payments',
      description: 'Payment history'
    }
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    console.log('Logging out...')
    router.push('/')
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-black/80 backdrop-blur-xl border-b border-purple-500/20' 
        : 'bg-gradient-to-r from-black via-purple-950/90 to-black backdrop-blur-lg border-b border-purple-500/10'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {/* A&S Logo */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative h-10 w-10 rounded-lg overflow-hidden shadow-lg shadow-purple-500/25">
                  <img 
                    src="https://z-cdn-media.chatglm.cn/files/d66918b7-d857-404c-b906-106aeb7314bc_pasted_image_1761064872435.png?auth_key=1792601023-dd799744fc324e6cba1e7bfd4baf99d2-0-3bda3d0790fb9ac3bc437e366085ffc7" 
                    alt="A&S Studio Project Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Studio
                </h1>
                <p className="text-xs text-purple-300/70">Server Management</p>
              </div>
            </div>

            {/* Desktop Navigation Dropdown */}
            <nav className="hidden lg:flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-9 px-4 text-purple-200 hover:text-white hover:bg-purple-500/10 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
                  >
                    <Menu className="h-4 w-4 mr-2" />
                    Menu
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-black/95 border border-purple-500/30 backdrop-blur-xl">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    const isActive = currentPage === item.id
                    
                    return (
                      <DropdownMenuItem 
                        key={item.id}
                        onClick={() => handleNavigation(item.href)}
                        className={`flex items-center space-x-3 px-3 py-2 cursor-pointer transition-colors ${
                          isActive 
                            ? 'bg-purple-500/20 text-purple-300' 
                            : 'text-gray-300 hover:text-white hover:bg-purple-500/10'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                        {isActive && (
                          <div className="h-2 w-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600"></div>
                        )}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-48 h-9 bg-black/40 border border-purple-500/30 text-purple-100 placeholder-purple-400/50 focus:border-purple-400/60 focus:ring-purple-500/20"
                />
              </div>
            </div>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative h-9 w-9 p-0 text-purple-200 hover:text-white hover:bg-purple-500/10 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
                >
                  <Bell className="h-4 w-4" />
                  {notifications > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 p-0 text-xs flex items-center justify-center border-2 border-black"
                    >
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-black/95 border border-purple-500/30 backdrop-blur-xl">
                <DropdownMenuLabel className="text-purple-200">Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-purple-500/20" />
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-500/10">
                  <div className="flex flex-col space-y-1 w-full">
                    <p className="text-sm font-medium text-purple-200">Server status updated</p>
                    <p className="text-xs text-gray-400">Server GTA-RP is now online</p>
                    <p className="text-xs text-purple-400/60 mt-1">2 minutes ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-500/10">
                  <div className="flex flex-col space-y-1 w-full">
                    <p className="text-sm font-medium text-purple-200">New user registered</p>
                    <p className="text-xs text-gray-400">John Doe joined the platform</p>
                    <p className="text-xs text-purple-400/60 mt-1">1 hour ago</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-purple-500/10">
                  <div className="flex flex-col space-y-1 w-full">
                    <p className="text-sm font-medium text-purple-200">System maintenance</p>
                    <p className="text-xs text-gray-400">Scheduled for tonight 2AM</p>
                    <p className="text-xs text-purple-400/60 mt-1">3 hours ago</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-9 flex items-center space-x-2 pl-2 text-purple-200 hover:text-white hover:bg-purple-500/10 border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="Admin User" />
                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold">
                      AU
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-purple-200">Admin User</span>
                    <span className="text-xs text-purple-400/70">Administrator</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-purple-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-black/95 border border-purple-500/30 backdrop-blur-xl">
                <DropdownMenuLabel className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-purple-200">Admin User</p>
                  <p className="text-xs text-purple-400/70">
                    rowen sid2802@gmail.com
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-purple-500/20" />
                <DropdownMenuItem 
                  onClick={() => handleNavigation('/profile')}
                  className="text-gray-300 hover:text-white hover:bg-purple-500/10"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleNavigation('/settings')}
                  className="text-gray-300 hover:text-white hover:bg-purple-500/10"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-purple-500/20" />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-9 w-9 p-0 text-purple-200 hover:text-white hover:bg-purple-500/10 border border-purple-500/20"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-purple-500/20 bg-black/95 backdrop-blur-xl">
          <div className="container px-4 py-4">
            <div className="flex flex-col space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    onClick={() => handleNavigation(item.href)}
                    className={`justify-start h-12 px-4 ${
                      isActive 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                        : 'text-gray-300 hover:text-white hover:bg-purple-500/10'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-gray-500">{item.description}</span>
                    </div>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}