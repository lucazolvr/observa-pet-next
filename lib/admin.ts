import { supaServer } from './supabase/server'
import type { Ong, Report, Article, AdminUserRow, FeedPost } from '@/types'

export async function fetchPendingOngs(): Promise<Ong[]> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('ongs')
    .select('id, name, city, mission, cnpj, whatsapp, avatar_url, cover_url, status, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  return (data ?? []) as unknown as Ong[]
}

export async function fetchAllOngs(): Promise<Ong[]> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('ongs')
    .select('id, owner_id, name, city, mission, cnpj, whatsapp, avatar_url, cover_url, status, verified, rejection_reason, created_at')
    .order('created_at', { ascending: false })
  return (data ?? []) as unknown as Ong[]
}

export async function fetchPendingReports(): Promise<Report[]> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('reports')
    .select(`
      id, reporter_id, post_id, reason, status, admin_note, created_at,
      reporter:profiles!reporter_id(id, name),
      post:posts(
        id, type, caption, neighborhood, created_at,
        photos:post_photos(url, position),
        pet:pets(name, species),
        author:profiles!author_id(id, name)
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  return (data ?? []) as unknown as Report[]
}

export async function fetchAllReports(): Promise<Report[]> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('reports')
    .select(`
      id, reporter_id, post_id, reason, status, admin_note, created_at,
      reporter:profiles!reporter_id(id, name),
      post:posts(
        id, type, caption, neighborhood, created_at,
        photos:post_photos(url, position),
        pet:pets(name, species),
        author:profiles!author_id(id, name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)
  return (data ?? []) as unknown as Report[]
}

export async function fetchAdminPosts(page = 0): Promise<FeedPost[]> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      pet:pets(id, name, species, status, neighborhood),
      photos:post_photos(url, position),
      author:profiles(id, name, avatar_url, verified),
      likes_count:post_likes(count),
      helps_count:post_helps(count),
      saves_count:post_saves(count),
      comments_count:comments(count)
    `)
    .order('created_at', { ascending: false })
    .range(page * 30, page * 30 + 29)
  return (data ?? []) as unknown as FeedPost[]
}

export async function fetchAdminStats() {
  const supabase = await supaServer()
  const [
    { count: pets },
    { count: posts },
    { count: users },
    { count: ongsPending },
    { count: reportsPending },
    { count: ongTotal },
    { count: banned },
  ] = await Promise.all([
    supabase.from('pets').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('ongs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('ongs').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('banned', true),
  ])
  return {
    pets: pets ?? 0, posts: posts ?? 0, users: users ?? 0,
    ongsPending: ongsPending ?? 0, reports: reportsPending ?? 0,
    ongTotal: ongTotal ?? 0, banned: banned ?? 0,
  }
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('profiles')
    .select('id, name, role, city, created_at, verified, banned, ban_reason, suspended_until')
    .order('created_at', { ascending: false })
    .limit(200)
  return (data ?? []) as unknown as AdminUserRow[]
}

export async function fetchAdminUserEmail(userId: string): Promise<string | null> {
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.admin.getUserById(userId)
  return user?.email ?? null
}

export async function fetchAdminArticles(): Promise<Article[]> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('articles')
    .select('id, category, title, excerpt, body, cover_url, author, read_minutes, published_at')
    .order('published_at', { ascending: false, nullsFirst: true })
  return (data ?? []) as unknown as Article[]
}
