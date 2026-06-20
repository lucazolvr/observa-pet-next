'use server'

import { supaServer } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/security'

export type EventType = 'share' | 'help' | 'message'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ALLOWED_TYPES: Set<string> = new Set(['share', 'help', 'message'])
const ALLOWED_META_KEYS: Set<string> = new Set(['method'])

export async function logEvent(
  type: EventType,
  postId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (!ALLOWED_TYPES.has(type)) return
  if (!UUID_RE.test(postId)) return

  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Rate limit generoso para não perder eventos legítimos (scroll rápido)
  let ok = true
  try {
    const { data } = await supabase.rpc('check_rate_limit', {
      p_key:         `event:${user.id}`,
      p_max:         60,
      p_window_secs: 60,
    })
    if (data === false) ok = false
  } catch { /* falha silenciosa */ }
  if (!ok) return

  // Só permite chaves de metadata conhecidas para evitar payload arbitrário
  const safeMeta: Record<string, string> | null = metadata
    ? Object.fromEntries(
        Object.entries(metadata)
          .filter(([k]) => ALLOWED_META_KEYS.has(k))
          .map(([k, v]) => [k, String(v).slice(0, 50)])
      )
    : null

  await supabase.from('events').insert({
    user_id:    user.id,
    post_id:    postId,
    event_type: type,
    metadata:   safeMeta,
  })
}
