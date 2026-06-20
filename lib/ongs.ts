import { supaServer } from './supabase/server'
import type { Ong } from '@/types'

const ONG_FIELDS = 'id, name, city, mission, avatar_url, cover_url, verified, goal_cents, raised_cents, whatsapp, created_at'

export async function fetchOngs(): Promise<Ong[]> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('ongs')
    .select(ONG_FIELDS)
    .eq('status', 'approved')
    .order('verified', { ascending: false })
    .order('raised_cents', { ascending: false })
  return (data ?? []) as unknown as Ong[]
}

export async function fetchOng(id: string): Promise<Ong | null> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('ongs')
    .select(ONG_FIELDS)
    .eq('id', id)
    .single()
  return data as unknown as Ong | null
}
