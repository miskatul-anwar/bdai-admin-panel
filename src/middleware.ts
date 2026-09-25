import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasToken =
    request.cookies.has('bdai_access_token') ||
    request.cookies.has('access_token') ||
    request.cookies.has('bdai_user_session');

  // Root route "/"
  if (pathname === '/') {
    if (hasToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protected "/dashboard" routes
  if (pathname.startsWith('/dashboard')) {
    if (!hasToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Login route "/login"
  if (pathname === '/login') {
    if (hasToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login'],
};
