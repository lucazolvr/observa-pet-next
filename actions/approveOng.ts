'use server'

import { supaServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/security'
import { revalidatePath } from 'next/cache'
import { sendOngApprovedEmail } from '@/lib/email'

export async function approveOng(ongId: string) {
  const supabase = await supaServer()
  await requireAdmin(supabase)
  await supabase
    .from('ongs')
    .update({ status: 'approved', rejection_reason: null })
    .eq('id', ongId)

  const { data: ong } = await supabase
    .from('ongs')
    .select('owner_id, name')
    .eq('id', ongId)
    .single()

  if (ong?.owner_id) {
    const [{ data: profile }] = await Promise.all([
      supabase.from('profiles').select('id').eq('id', ong.owner_id).single(),
      supabase.from('notifications').insert({
        user_id: ong.owner_id,
        type: 'system',
        text: `🎉 Sua ONG "${ong.name}" foi aprovada e já está visível no ObservaPet!`,
      }),
    ])

    // Busca email do usuário via auth admin
    const { data: { user } } = await supabase.auth.admin.getUserById(ong.owner_id)
    if (user?.email) {
      await sendOngApprovedEmail(user.email, ong.name)
    }
  }

  revalidatePath('/admin')
  revalidatePath('/ongs')
}
