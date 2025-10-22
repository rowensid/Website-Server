"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, LogIn, User, Lock, Sparkles, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const redirect = searchParams.get('redirect') || '/gateway';
        router.push(redirect);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`
            }}
          >
            <Sparkles className="w-2 h-2 text-purple-300 opacity-50" />
          </div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 animate-gradient-x"></div>
              <User className="w-10 h-10 text-white relative z-10" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-violet-200 to-purple-200 bg-clip-text text-transparent">
              A & S Studio
            </h1>
            <p className="text-purple-200 text-lg">Welcome back to your creative space</p>
          </div>

          {/* Login Form */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-center flex items-center justify-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg">
                  <LogIn className="w-5 h-5 text-white" />
                </div>
                Sign In to Continue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert className="bg-red-500/20 backdrop-blur border-red-500/50 text-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-purple-200 font-medium">Email Address</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300 group-focus-within:text-violet-400 transition-colors" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-12 bg-white/10 border-white/20 text-white placeholder-purple-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 backdrop-blur-sm h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-purple-200 font-medium">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-300 group-focus-within:text-violet-400 transition-colors" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder-purple-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 backdrop-blur-sm h-12 rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-violet-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-200 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin relative z-10" />
                      <span className="relative z-10">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5 relative z-10" />
                      <span className="relative z-10">Sign In</span>
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-purple-200 text-sm">
                  Don't have an account?{' '}
                  <Link 
                    href="/register" 
                    className="text-violet-300 hover:text-violet-200 font-medium transition-colors underline underline-offset-4"
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Accounts Info */}
          <Card className="mt-6 bg-white/5 backdrop-blur-lg border-white/10 shadow-xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-violet-400" />
                <h3 className="text-white font-medium">Demo Accounts</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-violet-500/10 rounded-lg border border-violet-500/20">
                  <Zap className="w-4 h-4 text-violet-400 mt-0.5" />
                  <div>
                    <div className="text-violet-300 font-medium text-sm">Admin Access</div>
                    <div className="text-purple-200 text-xs mt-1">admin@example.com / admin123</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                  <User className="w-4 h-4 text-indigo-400 mt-0.5" />
                  <div>
                    <div className="text-indigo-300 font-medium text-sm">Member Access</div>
                    <div className="text-purple-200 text-xs mt-1">user@example.com / user123</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-purple-300/60 text-xs">
              © 2024 A & S Studio. Crafted with creativity and passion.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }
        
        @keyframes gradient-x {
          0%, 100% { transform: translateX(0%); }
          50% { transform: translateX(100%); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}