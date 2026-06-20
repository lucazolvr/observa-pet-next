'use server'

import { supaServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function rejectOng(ongId: string, reason: string) {
  const supabase = await supaServer()
  await supabase
    .from('ongs')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', ongId)

  const { data: ong } = await supabase
    .from('ongs')
    .select('owner_id, name')
    .eq('id', ongId)
    .single()

  if (ong?.owner_id) {
    await supabase.from('notifications').insert({
      user_id: ong.owner_id,
      type: 'system',
      text: `Sua ONG "${ong.name}" não foi aprovada. Motivo: ${reason}`,
    })
  }

  revalidatePath('/admin')
}
