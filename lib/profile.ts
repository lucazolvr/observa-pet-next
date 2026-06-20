import { supaServer } from './supabase/server'
import { notFound } from 'next/navigation'
import type { Profile, UserPostItem } from '@/types'

export async function fetchProfile(userId: string): Promise<Profile> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('profiles')
    .select('id, name, role, avatar_url, city, bio, verified, created_at')
    .eq('id', userId)
    .single()
  if (!data) notFound()
  return data as unknown as Profile
}

export async function fetchUserPosts(userId: string): Promise<UserPostItem[]> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('posts')
    .select(`
      id, type, neighborhood, created_at,
      photos:post_photos(id, url, position),
      pet:pets(id, name, status, species)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(30)
  return (data ?? []) as unknown as UserPostItem[]
}
