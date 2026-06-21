'use server'

import { supaServer } from '@/lib/supabase/server'
import { requireAuth, rateLimit } from '@/lib/security'
import { reportSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'

export async function reportPost(postId: string, reason: string) {
  const supabase = await supaServer()
  const user = await requireAuth(supabase)

  // 5 denúncias por hora por usuário
  await rateLimit(supabase, `report:${user.id}`, 10, 3600)

  const { reason: safeReason } = reportSchema.parse({ reason })

  await supabase.from('reports').insert({
    reporter_id: user.id,
    post_id:     postId,
    reason:      safeReason,
    status:      'pending',
  })
  // Não revalida '/' — evita desmontar o modal de confirmação antes de setSent(true)
}
