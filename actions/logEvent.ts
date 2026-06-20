'use server'

import { supaServer } from '@/lib/supabase/server'

export type EventType = 'share' | 'help' | 'message'

export async function logEvent(
  type: EventType,
  postId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return // eventos anônimos não são registrados

  await supabase.from('events').insert({
    user_id:    user.id,
    post_id:    postId,
    event_type: type,
    metadata:   metadata ?? null,
  })
}
