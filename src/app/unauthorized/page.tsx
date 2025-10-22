"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-width-md">
        <Card className="bg-gray-800/90 backdrop-blur-lg border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle className="text-white text-xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-400">
              You don't have permission to access this page. Please contact your administrator if you think this is a mistake.
            </p>
            
            <div className="space-y-2">
              <Button
                onClick={() => router.back()}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              
              <Link href="/member-dashboard" className="block">
                <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                  <Home className="mr-2 h-4 w-4" />
                  Member Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}