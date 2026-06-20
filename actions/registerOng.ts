'use server'

import { supaServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function registerOng(formData: FormData): Promise<never> {
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name    = (formData.get('name')    as string).trim()
  const cnpj    = (formData.get('cnpj')    as string).trim()
  const city    = (formData.get('city')    as string).trim()
  const whatsapp = (formData.get('whatsapp') as string).trim()
  const mission  = (formData.get('mission')  as string).trim()

  if (!name || !cnpj || !city || !whatsapp || !mission) {
    throw new Error('Preencha todos os campos obrigatórios')
  }

  const { data: ong, error } = await supabase
    .from('ongs')
    .insert({ owner_id: user.id, name, cnpj, city, whatsapp, mission, status: 'pending' })
    .select('id')
    .single()

  if (error || !ong) throw new Error('Erro ao cadastrar ONG')

  // Atualiza role do usuário para 'ong'
  await supabase.from('profiles').update({ role: 'ong' }).eq('id', user.id)

  redirect('/cadastro-ong/aguardando')
}
