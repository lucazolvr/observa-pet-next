'use server'

import { supaServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/security'
import { articleSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'

export async function saveArticle(formData: FormData) {
  const supabase = await supaServer()
  await requireAdmin(supabase)

  const raw = {
    title:        formData.get('title'),
    category:     formData.get('category'),
    excerpt:      formData.get('excerpt') || '',
    body:         formData.get('body'),
    cover_url:    formData.get('cover_url') || '',
    author:       formData.get('author') || '',
    read_minutes: formData.get('read_minutes') || null,
    published_at: formData.get('published_at') || null,
  }

  const result = articleSchema.safeParse(raw)
  if (!result.success) {
    const msg = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
    throw new Error(`Dados inválidos: ${msg}`)
  }
  const parsed = result.data
  const id = (formData.get('id') as string | null) || null

  if (id) {
    await supabase.from('articles').update(parsed).eq('id', id)
  } else {
    await supabase.from('articles').insert(parsed)
  }

  revalidatePath('/info')
  revalidatePath('/admin')
}

export async function deleteArticle(articleId: string) {
  const supabase = await supaServer()
  await requireAdmin(supabase)

  await supabase.from('articles').delete().eq('id', articleId)
  revalidatePath('/info')
  revalidatePath('/admin')
}

export async function deleteArticlesBulk(articleIds: string[]) {
  if (!articleIds.length) return
  const supabase = await supaServer()
  await requireAdmin(supabase)

  await supabase.from('articles').delete().in('id', articleIds)
  revalidatePath('/info')
  revalidatePath('/admin')
}
