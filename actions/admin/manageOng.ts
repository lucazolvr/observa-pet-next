'use server'

import { supaServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/security'
import { revalidatePath } from 'next/cache'

export async function deleteOng(ongId: string) {
  const supabase = await supaServer()
  await requireAdmin(supabase)

  const { data: ong } = await supabase
    .from('ongs').select('owner_id, name').eq('id', ongId).single()
  if (ong?.owner_id) {
    await supabase.from('notifications').insert({
      user_id: ong.owner_id, type: 'system',
      text: `A ONG "${ong.name}" foi removida do ObservaPet por um administrador.`,
    })
  }
  await supabase.from('ongs').delete().eq('id', ongId)
  revalidatePath('/admin')
  revalidatePath('/ongs')
}

export async function toggleVerifyOng(ongId: string, verified: boolean) {
  const supabase = await supaServer()
  await requireAdmin(supabase)

  await supabase.from('ongs').update({ verified: !!verified }).eq('id', ongId)
  revalidatePath('/admin')
  revalidatePath('/ongs')
}
