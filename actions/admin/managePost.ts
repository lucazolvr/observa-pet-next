'use server'
import { supaServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deletePost(postId: string) {
  const supabase = await supaServer()
  // Fotos serão removidas via FK cascade no storage se configurado,
  // mas também removemos da tabela post_photos
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
