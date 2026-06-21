'use server'

import { supaServer } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/security'
import { revalidatePath } from 'next/cache'

export async function deleteOwnPost(postId: string): Promise<{ error?: string }> {
  const supabase = await supaServer()
  const user = await requireAuth(supabase).catch(() => null)
  if (!user) return { error: 'Não autenticado' }

  const { data: post } = await supabase
    .from('posts')
    .select('id, author_id')
    .eq('id', postId)
    .single()

  if (!post) return { error: 'Post não encontrado' }
  if (post.author_id !== user.id) return { error: 'Sem permissão' }

  await supabase.from('post_photos').delete().eq('post_id', postId)
  await supabase.from('post_likes').delete().eq('post_id', postId)
  await supabase.from('post_saves').delete().eq('post_id', postId)
  await supabase.from('post_helps').delete().eq('post_id', postId)
  await supabase.from('comments').delete().eq('post_id', postId)
  await supabase.from('reports').delete().eq('post_id', postId)
  await supabase.from('posts').delete().eq('id', postId)

  revalidatePath('/')
  revalidatePath('/perfil')
  return {}
}
