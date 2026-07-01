import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check for Supabase auth cookie
  const authCookie = request.cookies.get('sb-access-token') || 
                     request.cookies.getAll().find(c => c.name.includes('auth-token'))

  // Protect admin routes (except login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin' && !authCookie) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
