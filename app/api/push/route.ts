import { NextRequest, NextResponse } from 'next/server'
import { supaServer } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    action: 'subscribe' | 'unsubscribe'
    subscription?: { endpoint: string; keys: { p256dh: string; auth: string } }
  }

  if (body.action === 'subscribe' && body.subscription) {
    await supabase.from('push_subscriptions').upsert({
      user_id: user.id,
      endpoint: body.subscription.endpoint,
      p256dh: body.subscription.keys.p256dh,
      auth: body.subscription.keys.auth,
    }, { onConflict: 'endpoint' })
    return NextResponse.json({ ok: true })
  }

  if (body.action === 'unsubscribe' && body.subscription) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', body.subscription.endpoint)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
