import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public and system paths
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    /\.(png|jpg|jpeg|svg|ico|webp|css|js|woff|woff2)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check auth cookie
  const token = request.cookies.get('klinik_access_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // demo_token = valid (bypass JWT decode)
  if (token === 'demo_token') return NextResponse.next();

  // Decode JWT exp (Edge Runtime safe — atob available in Edge)
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('expired', '1');
        const res = NextResponse.redirect(loginUrl);
        res.cookies.delete('klinik_access_token');
        return res;
      }
    }
  } catch {
    // Invalid token format — allow, API will reject
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
