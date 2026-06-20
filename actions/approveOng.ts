'use server'

import { supaServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveOng(ongId: string) {
  const supabase = await supaServer()
  await supabase
    .from('ongs')
    .update({ status: 'approved', rejection_reason: null })
    .eq('id', ongId)

  // Notifica o dono
  const { data: ong } = await supabase
    .from('ongs')
    .select('owner_id, name')
    .eq('id', ongId)
    .single()

  if (ong?.owner_id) {
    await supabase.from('notifications').insert({
      user_id: ong.owner_id,
      type: 'system',
      text: `🎉 Sua ONG "${ong.name}" foi aprovada e já está visível no ObservaPet!`,
    })
  }

  revalidatePath('/admin')
  revalidatePath('/ongs')
}
