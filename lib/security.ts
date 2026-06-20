import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Auth guards ─────────────────────────────────────────────────────────────

export async function requireAuth(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  return user
}

export async function requireAdmin(supabase: SupabaseClient) {
  const user = await requireAuth(supabase)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') throw new Error('Acesso negado')
  return user
}

// ─── Rate limiting (via Postgres — atômico, sem Redis externo) ───────────────

export async function rateLimit(
  supabase: SupabaseClient,
  key: string,
  max: number,
  windowSecs: number,
) {
  const { data: allowed, error } = await supabase.rpc('check_rate_limit', {
    p_key:         key,
    p_max:         max,
    p_window_secs: windowSecs,
  })
  if (error) return // falha silenciosa: nunca bloqueia por erro de infra
  if (allowed === false) throw new Error('Muitas requisições. Tente novamente em breve.')
}

// ─── Input helpers ───────────────────────────────────────────────────────────

/** Escapa caracteres especiais do LIKE do Postgres */
export function escapeSearch(term: string): string {
  return term.replace(/[%_\\]/g, '\\$&')
}

const ALLOWED_IMG_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif'])

/** Retorna extensão segura da lista de permitidas, fallback 'jpg' */
export function safeExt(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return ALLOWED_IMG_EXTS.has(ext) ? ext : 'jpg'
}

/** Tenta parsear JSON; retorna fallback em caso de erro */
export function safeJsonArray(raw: string | null): string[] {
  try {
    const parsed = JSON.parse(raw ?? '[]')
    if (Array.isArray(parsed) && parsed.every(x => typeof x === 'string')) return parsed
  } catch { /* noop */ }
  return []
}
