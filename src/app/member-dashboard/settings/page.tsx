'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, User, Mail, Save, Camera, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface UserData {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  createdAt: string
}

export default function MemberSettingsPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    avatar: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUserData(userData.user)
        setFormData({
          name: userData.user.name || '',
          avatar: userData.user.avatar || ''
        })
        setAvatarPreview(userData.user.avatar || '')
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      name: e.target.value
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file terlalu besar. Maksimal 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarPreview(result)
        setFormData(prev => ({
          ...prev,
          avatar: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Nama tidak boleh kosong')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Profil berhasil diperbarui')
        await fetchUser()
      } else {
        toast.error(data.message || 'Gagal memperbarui profil')
      }
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('Terjadi kesalahan saat memperbarui profil')
    } finally {
      setIsLoading(false)
    }
  }

  const removeAvatar = () => {
    setAvatarPreview('')
    setFormData(prev => ({
      ...prev,
      avatar: ''
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat data pengguna...</p>
        </div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Akses Ditolak</h2>
          <p className="text-gray-600">Silakan login untuk mengakses halaman ini</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/member-dashboard">
            <Button variant="ghost" className="text-gray-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Pengaturan Pengguna</h1>
          <p className="text-gray-400 mt-2">Kelola informasi profil Anda</p>
        </div>

        <div className="grid gap-6">
          {/* Avatar Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Camera className="h-5 w-5" />
                Foto Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview} alt={userData.name} />
                    <AvatarFallback className="text-lg bg-cyan-500 text-white">
                      {userData.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <Label
                      htmlFor="avatar-upload"
                      className="flex items-center justify-center w-8 h-8 bg-cyan-500 text-white rounded-full cursor-pointer hover:bg-cyan-600 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-2">
                    Upload foto profil Anda. Format yang didukung: JPG, PNG, GIF. Maksimal 5MB.
                  </p>
                  {avatarPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeAvatar}
                      className="text-red-400 hover:text-red-300 border-red-500/50"
                    >
                      Hapus Foto
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5" />
                Informasi Pribadi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-300">Nama Lengkap</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        disabled
                        className="w-full bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
                      />
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    </div>
                    <p className="text-xs text-gray-500">Email tidak dapat diubah</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Peran</Label>
                    <Input
                      value={userData.role === 'ADMIN' ? 'Administrator' : userData.role === 'OWNER' ? 'Pemilik' : 'Anggota'}
                      disabled
                      className="bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Bergabung Sejak</Label>
                    <Input
                      value={new Date(userData.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                      disabled
                      className="bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}