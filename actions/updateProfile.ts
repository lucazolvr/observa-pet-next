'use server'

import { supaServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const name = (formData.get('name') as string | null)?.trim()
  const bio  = (formData.get('bio')  as string | null)?.trim() || null
  const file = formData.get('avatar') as File | null

  if (!name) throw new Error('Nome é obrigatório')

  let avatar_url: string | undefined

  if (file && file.size > 0) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}.${ext}`
    await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    avatar_url = `${urlData.publicUrl}?t=${Date.now()}`
  }

  await supabase
    .from('profiles')
    .update({ name, bio, ...(avatar_url ? { avatar_url } : {}) })
    .eq('id', user.id)

  revalidatePath('/perfil')
}
