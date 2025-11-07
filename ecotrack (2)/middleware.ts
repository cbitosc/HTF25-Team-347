import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth', '/signup', '/api']
  const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

  // If not authenticated and trying to access protected route, redirect to auth
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/auth', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated and trying to access auth page, redirect to dashboard
  if (session && req.nextUrl.pathname === '/auth') {
    // Get user role from database
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const roleRedirects: Record<string, string> = {
      citizen: '/dashboard',
      collector: '/collector',
      ngo: '/ngo',
      admin: '/admin',
    }

    const redirectPath = userData?.role ? roleRedirects[userData.role] : '/dashboard'
    return NextResponse.redirect(new URL(redirectPath, req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
