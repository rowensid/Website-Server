import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Protected routes
const protectedRoutes = [
  '/member-dashboard',
  '/owner-panel'
];

// Public routes that don't need authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/stats',
  '/api/store',
  '/api/health'
];

// Routes that require authentication but are gateways
const gatewayRoutes = [
  '/gateway'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get token from cookies for all protected and gateway routes
  const token = request.cookies.get('auth-token')?.value;

  // Handle gateway routes - need authentication but redirect to login if not authenticated
  if (gatewayRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // Fetch user from database
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });

      if (!user || !user.isActive) {
        // User not found or inactive, redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Add user info to headers for downstream use
      const response = NextResponse.next();
      response.headers.set('x-user-id', user.id);
      response.headers.set('x-user-role', user.role);
      response.headers.set('x-user-name', user.name);

      return response;

    } catch (error) {
      console.error('Middleware gateway auth error:', error);
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check if route is protected
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      // Redirect to login if no token
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // Fetch user from database
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });

      if (!user || !user.isActive) {
        // User not found or inactive, redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check role-based access
      if (pathname.startsWith('/owner-panel') && user.role !== 'OWNER' && user.role !== 'ADMIN') {
        // Only owner and admin can access owner panel
        const errorUrl = new URL('/unauthorized', request.url);
        return NextResponse.redirect(errorUrl);
      }

      // Add user info to headers for downstream use
      const response = NextResponse.next();
      response.headers.set('x-user-id', user.id);
      response.headers.set('x-user-role', user.role);
      response.headers.set('x-user-name', user.name);

      return response;

    } catch (error) {
      console.error('Middleware protected auth error:', error);
      // Invalid token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};