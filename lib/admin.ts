import { supaServer } from './supabase/server'
import type { Ong, Report, Article } from '@/types'

export async function fetchPendingOngs(): Promise<Ong[]> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('ongs')
    .select('id, name, city, mission, cnpj, whatsapp, avatar_url, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  return (data ?? []) as unknown as Ong[]
}

export async function fetchPendingReports(): Promise<Report[]> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('reports')
    .select(`
      id, reporter_id, post_id, reason, status, admin_note, created_at,
      post:posts(id, type, caption, photos:post_photos(url, position), pet:pets(name, species), author:profiles(name))
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  return (data ?? []) as unknown as Report[]
}

export async function fetchAdminStats() {
  const supabase = await supaServer()
  const [
    { count: pets },
    { count: posts },
    { count: users },
    { count: ongsPending },
    { count: reports },
  ] = await Promise.all([
    supabase.from('pets').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('ongs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])
  return { pets: pets ?? 0, posts: posts ?? 0, users: users ?? 0, ongsPending: ongsPending ?? 0, reports: reports ?? 0 }
}

export async function fetchAdminArticles(): Promise<Article[]> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('articles')
    .select('id, category, title, excerpt, body, cover_url, author, read_minutes, published_at')
    .order('published_at', { ascending: false })
  return (data ?? []) as unknown as Article[]
}
