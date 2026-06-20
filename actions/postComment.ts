'use server'

import { revalidatePath } from 'next/cache'
import { supaServer } from '@/lib/supabase/server'

export async function postComment(postId: string, petId: string, text: string) {
  if (!text.trim() || text.length > 500) throw new Error('Comentário inválido')

  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: user.id, text: text.trim() })

  if (error) throw new Error('Erro ao salvar comentário')

  revalidatePath(`/pet/${petId}`)
}
