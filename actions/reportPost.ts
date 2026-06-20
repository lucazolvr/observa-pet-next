'use server'

import { supaServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reportPost(postId: string, reason: string) {
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  await supabase.from('reports').insert({
    reporter_id: user.id,
    post_id: postId,
    reason,
    status: 'pending',
  })

  revalidatePath('/')
}
