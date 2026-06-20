import { supaServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { PetWithPosts, Comment } from '@/types'

export async function fetchPet(id: string): Promise<{ pet: PetWithPosts; latestPost: PetWithPosts['posts'][0] | null }> {
  const supabase = await supaServer()

  const { data: pet, error } = await supabase
    .from('pets')
    .select(`
      *,
      creator:profiles!created_by(id, name, role, avatar_url, verified),
      ong:ongs(id, name, avatar_url, verified),
      posts(
        id, type, caption, location_text, neighborhood, created_at,
        photos:post_photos(url, position),
        likes_count:post_likes(count),
        helps_count:post_helps(count),
        comments_count:comments(count)
      )
    `)
    .eq('id', id)
    .order('created_at', { referencedTable: 'posts', ascending: false })
    .single()

  if (error || !pet) notFound()

  const latestPost = (pet as unknown as PetWithPosts).posts?.[0] ?? null
  return { pet: pet as unknown as PetWithPosts, latestPost }
}

export async function fetchComments(postId: string): Promise<Comment[]> {
  const supabase = await supaServer()

  const { data } = await supabase
    .from('comments')
    .select('id, text, created_at, author:profiles(name, avatar_url)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
    .limit(20)

  return (data ?? []) as unknown as Comment[]
}
