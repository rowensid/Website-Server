"use client";

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setError('Not authenticated')
      }
    } catch (error) {
      setError('Error checking auth')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'rowensid2802@gmail.com',
          password: 'Aberzz2802'
        }),
      })

      if (response.ok) {
        await new Promise(resolve => setTimeout(resolve, 100))
        window.location.reload()
      } else {
        const data = await response.json()
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('Network error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Test</h1>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Auth Status</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">Authenticated</Badge>
                </div>
                <div>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Name:</strong> {user.name || 'Not set'}</p>
                  <p><strong>ID:</strong> {user.id}</p>
                </div>
                <div className="pt-4">
                  <Button onClick={() => window.location.href = '/gateway'}>
                    Go to Gateway
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-red-500">Not Authenticated</Badge>
                </div>
                {error && <p className="text-red-400">{error}</p>}
                <Button onClick={handleLogin}>
                  Login as Admin
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}