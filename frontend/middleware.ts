import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Paths that don't require authentication
  const authPaths = ['/login', '/register'];

  // Static assets and internal next paths should be ignored
  if (
    pathname.includes('/_next') || 
    pathname.includes('/api/auth') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  // If no token and not on an auth path, redirect to login
  if (!token && !authPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If token exists and on an auth path, redirect to home
  if (token && authPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
