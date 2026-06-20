'use server'

import { revalidatePath } from 'next/cache'
import { supaServer } from '@/lib/supabase/server'
import { requireAuth, rateLimit } from '@/lib/security'
import { commentSchema } from '@/lib/schemas'

export async function postComment(postId: string, petId: string, text: string) {
  const supabase = await supaServer()
  const user = await requireAuth(supabase)

  // 10 comentários por minuto por usuário
  await rateLimit(supabase, `comment:${user.id}`, 10, 60)

  const { text: safeText } = commentSchema.parse({ text })

  const { error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: user.id, text: safeText })

  if (error) throw new Error('Erro ao salvar comentário')

  revalidatePath(`/pet/${petId}`)
}
