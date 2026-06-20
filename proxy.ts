import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isAuthRoute    = pathname.startsWith('/login')
    || pathname.startsWith('/auth')
    || pathname.startsWith('/verificar-email')
    || pathname.startsWith('/esqueci-senha')
    || pathname.startsWith('/redefinir-senha')
  const isPrivateRoute = pathname.startsWith('/adicionar')
    || pathname.startsWith('/notificacoes')
  const isAdminRoute   = pathname.startsWith('/admin')

  // Rotas que exigem login obrigatório
  if (isPrivateRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redireciona para feed se já logado e tentando acessar login
  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Verifica ban/suspend e protege /admin
  if (user && (isAdminRoute || isPrivateRoute)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, banned, suspended_until')
      .eq('id', user.id)
      .single()

    // Banido → desloga e manda pro login
    if (profile?.banned) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'banned')
      return NextResponse.redirect(url)
    }

    // Suspenso → bloqueia rotas privadas
    if (profile?.suspended_until && new Date(profile.suspended_until) > new Date()) {
      if (isPrivateRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }

    // Admin
    if (isAdminRoute && profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  } else if (!user && isAdminRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
