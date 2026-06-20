'use server'

import { supaServer } from '@/lib/supabase/server'

export async function uploadArticleCover(formData: FormData): Promise<string> {
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('Arquivo inválido')

  const ext = file.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() ?? 'jpg')
  const path = `${user.id}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('article-covers')
    .upload(path, file, { upsert: false, contentType: file.type })

  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase.storage
    .from('article-covers')
    .getPublicUrl(path)

  return publicUrl
}
