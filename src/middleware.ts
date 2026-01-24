import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const COOKIE_NAME = 'session';

const PUBLIC_PATHS = ['/login', '/api/auth/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let session: { role?: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      session = payload as { role?: string };
    } catch {
      // Invalid token - treat as unauthenticated
    }
  }

  // Authenticated user visiting login or root → redirect to home
  if (session && (pathname === '/login' || pathname === '/')) {
    const redirectPath = session.role === 'MASTER' ? '/accounts' : '/ads';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Unauthenticated user visiting root → redirect to login
  if (!session && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Unauthenticated user visiting protected routes → redirect to login
  if (!session && !PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
