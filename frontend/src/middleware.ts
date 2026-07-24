import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // We only want to protect /admin routes
  if (pathname.startsWith('/admin')) {
    // Exclude the login and forgot-password pages from protection
    if (pathname === '/admin/login' || pathname === '/admin/forgot-password') {
      return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;

    // If no token exists, redirect to login page
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
