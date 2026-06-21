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
    const { data: ownerEmail } = await supabase.rpc('get_user_email', { user_id: ong.owner_id })
    if (ownerEmail) await sendOngRejectedEmail(ownerEmail as string, ong.name, safeReason)
  }

  revalidatePath('/admin')
}
