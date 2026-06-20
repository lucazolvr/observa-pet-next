'use server'

import { supaServer } from '@/lib/supabase/server'
import { requireAuth, rateLimit } from '@/lib/security'
import { ongSchema } from '@/lib/schemas'
import { redirect } from 'next/navigation'

export async function registerOng(formData: FormData): Promise<never> {
  const supabase = await supaServer()
  const user = await requireAuth(supabase).catch(() => null)
  if (!user) redirect('/login')

  // 3 cadastros de ONG por hora por IP/usuário
  await rateLimit(supabase, `register_ong:${user.id}`, 3, 3600)

  const parsed = ongSchema.parse({
    name:     formData.get('name')     ?? '',
    cnpj:     (formData.get('cnpj') as string ?? '').replace(/\D/g, ''),
    city:     formData.get('city')     ?? '',
    whatsapp: (formData.get('whatsapp') as string ?? '').replace(/\D/g, ''),
    mission:  formData.get('mission')  ?? '',
  })

  const { data: ong, error } = await supabase
    .from('ongs')
    .insert({ owner_id: user.id, ...parsed, status: 'pending' })
    .select('id')
    .single()

  if (error || !ong) throw new Error('Erro ao cadastrar ONG')

  await supabase.from('profiles').update({ role: 'ong' }).eq('id', user.id)

  redirect('/cadastro-ong/aguardando')
}
