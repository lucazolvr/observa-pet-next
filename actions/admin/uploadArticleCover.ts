'use server'

import { supaServer } from '@/lib/supabase/server'
import { requireAdmin, safeExt } from '@/lib/security'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export async function uploadArticleCover(formData: FormData): Promise<string> {
  const supabase = await supaServer()
  await requireAdmin(supabase)

  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('Arquivo inválido')
  if (file.size > MAX_SIZE) throw new Error('Arquivo muito grande (máx 5 MB)')

  const ext  = safeExt(file.name)
  const path = `covers/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('article-covers')
    .upload(path, file, { upsert: false, contentType: file.type })

  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase.storage
    .from('article-covers')
    .getPublicUrl(path)

  return publicUrl
}
