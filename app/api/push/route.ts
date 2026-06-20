import { NextRequest, NextResponse } from 'next/server'
import { supaServer } from '@/lib/supabase/server'
import { requireAuth, rateLimit } from '@/lib/security'
import { pushSubscribeSchema } from '@/lib/schemas'

export async function POST(req: NextRequest) {
  const supabase = await supaServer()

  const user = await requireAuth(supabase).catch(() => null)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 10 req/min por usuário
  await rateLimit(supabase, `push:${user.id}`, 10, 60).catch(() => {})

  const raw = await req.json().catch(() => null)
  const parsed = pushSubscribeSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const { action, subscription } = parsed.data

  if (action === 'subscribe' && subscription) {
    await supabase.from('push_subscriptions').upsert({
      user_id:  user.id,
      endpoint: subscription.endpoint,
      p256dh:   subscription.keys.p256dh,
      auth:     subscription.keys.auth,
    }, { onConflict: 'endpoint' })
    return NextResponse.json({ ok: true })
  }

  if (action === 'unsubscribe' && subscription) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', subscription.endpoint)
      .eq('user_id', user.id) // garante que só remove a própria subscrição
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
}
