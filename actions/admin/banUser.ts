'use server'
import { supaServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function banUser(userId: string, reason: string) {
  const supabase = await supaServer()
  await supabase.from('profiles')
    .update({ banned: true, ban_reason: reason, suspended_until: null })
    .eq('id', userId)
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'system',
    text: `Sua conta foi banida. Motivo: ${reason}`,
  })
  revalidatePath('/admin')
}

export async function suspendUser(userId: string, hours: number, reason: string) {
  const supabase = await supaServer()
  const until = new Date(Date.now() + hours * 3_600_000).toISOString()
  await supabase.from('profiles')
    .update({ suspended_until: until, ban_reason: reason, banned: false })
    .eq('id', userId)
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'system',
    text: `Sua conta foi suspensa por ${hours}h. Motivo: ${reason}`,
  })
  revalidatePath('/admin')
}

export async function recoverUser(userId: string) {
  const supabase = await supaServer()
  await supabase.from('profiles')
    .update({ banned: false, ban_reason: null, suspended_until: null })
    .eq('id', userId)
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'system',
    text: 'Sua conta foi reativada. Bem-vindo de volta ao ObservaPet!',
  })
  revalidatePath('/admin')
}

export async function changeUserEmail(userId: string, newEmail: string) {
  const supabase = await supaServer()
  await supabase.auth.admin.updateUserById(userId, { email: newEmail })
  revalidatePath('/admin')
}
