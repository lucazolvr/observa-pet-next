import { supaServer } from './supabase/server'
import type { Notification } from '@/types'

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('notifications')
    .select('id, user_id, type, text, read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  return (data ?? []) as unknown as Notification[]
}

export async function countUnread(userId: string): Promise<number> {
  const supabase = await supaServer()
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)
  return count ?? 0
}
