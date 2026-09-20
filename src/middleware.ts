import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/import-data',
  '/ai-assistant',
  '/billing',
];

const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  const { supabaseResponse, supabase } = await updateSession(request);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (isProtected && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  if (isAuthRoute && user) {
    const redirect = request.nextUrl.searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirect, request.url));
  }
  
  return supabaseResponse;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/import-data/:path*',
    '/ai-assistant/:path*',
    '/billing/:path*',
    '/login',
    '/signup',
  ],
};