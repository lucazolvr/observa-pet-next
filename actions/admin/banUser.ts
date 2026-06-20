'use server'

import { supaServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/security'
import { banSchema, suspendSchema, emailSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'

export async function banUser(userId: string, reason: string) {
  const supabase = await supaServer()
  await requireAdmin(supabase)
  const { reason: safeReason } = banSchema.parse({ reason })

  await supabase.from('profiles')
    .update({ banned: true, ban_reason: safeReason, suspended_until: null })
    .eq('id', userId)
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'system',
    text: `Sua conta foi banida. Motivo: ${safeReason}`,
  })
  revalidatePath('/admin')
}

export async function suspendUser(userId: string, hours: number, reason: string) {
  const supabase = await supaServer()
  await requireAdmin(supabase)
  const { hours: safeHours, reason: safeReason } = suspendSchema.parse({ hours, reason })

  const until = new Date(Date.now() + safeHours * 3_600_000).toISOString()
  await supabase.from('profiles')
    .update({ suspended_until: until, ban_reason: safeReason, banned: false })
    .eq('id', userId)
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'system',
    text: `Sua conta foi suspensa por ${safeHours}h. Motivo: ${safeReason}`,
  })
  revalidatePath('/admin')
}

export async function recoverUser(userId: string) {
  const supabase = await supaServer()
  await requireAdmin(supabase)

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
  await requireAdmin(supabase)
  const { email } = emailSchema.parse({ email: newEmail })

  await supabase.auth.admin.updateUserById(userId, { email })
  revalidatePath('/admin')
}
