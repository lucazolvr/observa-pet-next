'use server'

import { supaServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ArticleCategory } from '@/types'

export async function saveArticle(formData: FormData) {
  const supabase = await supaServer()

  const id        = formData.get('id') as string | null
  const title     = (formData.get('title') as string).trim()
  const category  = formData.get('category') as ArticleCategory
  const excerpt   = (formData.get('excerpt') as string | null)?.trim() || null
  const body      = (formData.get('body') as string).trim()
  const cover_url = (formData.get('cover_url') as string | null)?.trim() || null
  const author    = (formData.get('author') as string | null)?.trim() || null
  const read_minutes = Number(formData.get('read_minutes')) || null

  if (!title || !body || !category) throw new Error('Campos obrigatórios faltando')

  const payload = { title, category, excerpt, body, cover_url, author, read_minutes, published_at: new Date().toISOString() }

  if (id) {
    await supabase.from('articles').update(payload).eq('id', id)
  } else {
    await supabase.from('articles').insert(payload)
  }

  revalidatePath('/info')
  revalidatePath('/admin')
}

export async function deleteArticle(articleId: string) {
  const supabase = await supaServer()
  await supabase.from('articles').delete().eq('id', articleId)
  revalidatePath('/info')
  revalidatePath('/admin')
}
