'use server'

import { supaServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/security'
import { revalidatePath } from 'next/cache'

export async function deletePost(postId: string) {
  const supabase = await supaServer()
  await requireAdmin(supabase)

  await supabase.from('post_photos').delete().eq('post_id', postId)
  await supabase.from('post_likes').delete().eq('post_id', postId)
  await supabase.from('post_saves').delete().eq('post_id', postId)
  await supabase.from('post_helps').delete().eq('post_id', postId)
  await supabase.from('comments').delete().eq('post_id', postId)
  await supabase.from('reports').delete().eq('post_id', postId)
  await supabase.from('posts').delete().eq('id', postId)
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function deletePostsBulk(postIds: string[]) {
  if (!postIds.length) return
  const supabase = await supaServer()
  await requireAdmin(supabase)

  await supabase.from('post_photos').delete().in('post_id', postIds)
  await supabase.from('post_likes').delete().in('post_id', postIds)
  await supabase.from('post_saves').delete().in('post_id', postIds)
  await supabase.from('post_helps').delete().in('post_id', postIds)
  await supabase.from('comments').delete().in('post_id', postIds)
  await supabase.from('reports').delete().in('post_id', postIds)
  await supabase.from('posts').delete().in('id', postIds)
  revalidatePath('/admin')
  revalidatePath('/')
}
