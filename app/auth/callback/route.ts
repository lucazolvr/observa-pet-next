import { NextResponse } from 'next/server'
import { supaServer } from '@/lib/supabase/server'

const SAFE_PREFIXES = ['/', '/pet/', '/ong/', '/perfil']

function safePath(raw: string | null): string {
  if (!raw) return '/'
  // Deve ser path relativo iniciando com /
  if (!raw.startsWith('/') || raw.startsWith('//')) return '/'
  // Rejeita protocol-relative e data URIs
  if (/^\/[a-zA-Z][\w+\-.]*:/.test(raw)) return '/'
  const base = raw.split('?')[0]
  if (SAFE_PREFIXES.some(p => base === p || base.startsWith(p))) return raw
  return '/'
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safePath(searchParams.get('next'))

  if (code) {
    const supabase = await supaServer()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
