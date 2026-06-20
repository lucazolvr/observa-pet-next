'use server'

import { supaServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/security'
import { revalidatePath } from 'next/cache'
import { sendOngRejectedEmail } from '@/lib/email'

export async function rejectOng(ongId: string, reason: string) {
  const supabase = await supaServer()
  await requireAdmin(supabase)

  const safeReason = reason.trim().slice(0, 500) || 'Motivo não informado'

  await supabase
    .from('ongs')
    .update({ status: 'rejected', rejection_reason: safeReason })
    .eq('id', ongId)

  const { data: ong } = await supabase
    .from('ongs').select('owner_id, name').eq('id', ongId).single()

  if (ong?.owner_id) {
    await supabase.from('notifications').insert({
      user_id: ong.owner_id, type: 'system',
      text: `Sua ONG "${ong.name}" não foi aprovada. Motivo: ${safeReason}`,
    })
    const { data: { user } } = await supabase.auth.admin.getUserById(ong.owner_id)
    if (user?.email) await sendOngRejectedEmail(user.email, ong.name, safeReason)
  }

  revalidatePath('/admin')
}
