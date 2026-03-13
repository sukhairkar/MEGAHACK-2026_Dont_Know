import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Public paths that don't require auth
  const isAuthPath = pathname.startsWith('/citizen/login') || 
                     pathname.startsWith('/citizen/register') || 
                     pathname.startsWith('/police/login') || 
                     pathname.startsWith('/police/register') ||
                     pathname === '/';

  if (!token) {
    // Redirect to respective login if accessing protected routes
    if (pathname.startsWith('/citizen/') && !isAuthPath) {
      return NextResponse.redirect(new URL('/citizen/login', request.url));
    }
    if (pathname.startsWith('/police/') && !isAuthPath) {
      return NextResponse.redirect(new URL('/police/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    // 2. Verify JWT
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    const userType = payload.userType as string;

    // 3. Route Protection Logic
    
    // Redirect citizens trying to access police routes
    if (pathname.startsWith('/police/') && userType !== 'officer') {
        if (isAuthPath) return NextResponse.next();
        return NextResponse.redirect(new URL('/citizen/dashboard', request.url));
    }

    // Redirect officers trying to access citizen routes
    if (pathname.startsWith('/citizen/') && userType !== 'citizen') {
        if (isAuthPath) return NextResponse.next();
        return NextResponse.redirect(new URL('/police/dashboard', request.url));
    }

    // If logged in and trying to access login/register, redirect to dashboard
    if (isAuthPath && pathname !== '/') {
        const dashboard = userType === 'officer' ? '/police/dashboard' : '/citizen/dashboard';
        return NextResponse.redirect(new URL(dashboard, request.url));
    }

    // Home page redirection based on role
    if (pathname === '/') {
        const dashboard = userType === 'officer' ? '/police/dashboard' : '/citizen/dashboard';
        return NextResponse.redirect(new URL(dashboard, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token, clear it and redirect to home
    console.error('Middleware JWT Error:', error);
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

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
