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

  const { pathname } = request.nextUrl

  const isAuthRoute    = pathname.startsWith('/login')
    || pathname.startsWith('/auth')
    || pathname.startsWith('/verificar-email')
    || pathname.startsWith('/esqueci-senha')
    || pathname.startsWith('/redefinir-senha')
  const isPrivateRoute = pathname.startsWith('/adicionar')
    || pathname.startsWith('/notificacoes')
  const isAdminRoute   = pathname.startsWith('/admin')

  // Rotas públicas (feed, ongs, info, pet/*) — sem chamada de rede ao Supabase
  if (!isAuthRoute && !isPrivateRoute && !isAdminRoute) {
    return response
  }

  // getSession() lê o cookie sem network round-trip — rápido e suficiente para routing
  const { data: { session } } = await supabase.auth.getSession()
  const hasSession = !!session?.user

  // Redireciona login se já autenticado
  if (isAuthRoute && hasSession && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Rotas privadas sem sessão → login
  if (isPrivateRoute && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Admin / rotas privadas autenticadas → verifica ban, suspend e role no DB
  if (hasSession && (isAdminRoute || isPrivateRoute)) {
    // getUser() verifica o JWT com o servidor Supabase (necessário para segurança aqui)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, banned, suspended_until')
      .eq('id', user.id)
      .single()

    if (profile?.banned) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'banned')
      return NextResponse.redirect(url)
    }

    if (profile?.suspended_until && new Date(profile.suspended_until) > new Date()) {
      if (isPrivateRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }

    if (isAdminRoute && profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  } else if (!hasSession && isAdminRoute) {
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
