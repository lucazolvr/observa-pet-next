'use server'

import { supaServer } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/security'
import { petSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'
import type { Profile, FeedPost } from '@/types'

const MAX_PHOTO_SIZE = 5 * 1024 * 1024
const MAX_PHOTOS = 6

export async function fetchOfficialProfile(): Promise<Profile | null> {
  const supabase = await supaServer()
  const { data } = await supabase
    .from('profiles')
    .select('id, name, role, avatar_url, city, bio, verified, is_official, banned, ban_reason, suspended_until, created_at')
    .eq('is_official', true)
    .single()
  return (data ?? null) as unknown as Profile | null
}

export async function fetchOfficialPosts(): Promise<FeedPost[]> {
  const supabase = await supaServer()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_official', true)
    .single()
  if (!profile) return []

  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      pet:pets(id, name, species, status, neighborhood),
      photos:post_photos(url, position),
      author:profiles!author_id(id, name, avatar_url, verified, is_official),
      likes_count:post_likes(count),
      helps_count:post_helps(count),
      saves_count:post_saves(count),
      comments_count:comments(count)
    `)
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50)
  return (data ?? []) as unknown as FeedPost[]
}

export async function updateOfficialProfile(formData: FormData): Promise<{ error?: string }> {
  const supabase = await supaServer()
  await requireAdmin(supabase)

  const name    = (formData.get('name') as string | null)?.trim()
  const bio     = (formData.get('bio')  as string | null)?.trim() ?? null
  const avatarUrl = (formData.get('avatar_url') as string | null)?.trim() || null

  if (!name || name.length < 2) return { error: 'Nome deve ter ao menos 2 caracteres.' }

  const { error } = await supabase
    .from('profiles')
    .update({ name, bio, ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}) })
    .eq('is_official', true)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/perfil')
  return {}
}

export async function setOfficialProfile(userId: string): Promise<{ error?: string }> {
  const supabase = await supaServer()
  await requireAdmin(supabase)

  await supabase.from('profiles').update({ is_official: false }).eq('is_official', true)
  const { error } = await supabase.from('profiles').update({ is_official: true }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  return {}
}

export type CreateOfficialPostResult = { error: string } | { petId: string }

export async function createOfficialPost(formData: FormData): Promise<CreateOfficialPostResult> {
  const supabase = await supaServer()
  await requireAdmin(supabase)

  const result = petSchema.safeParse({
    species:       formData.get('species') ?? '',
    type:          formData.get('tipo')    ?? '',
    name:          formData.get('name')    ?? '',
    breed:         formData.get('breed')   ?? '',
    age_text:      formData.get('age_text') ?? '',
    gender:        formData.get('gender')   ?? '',
    status:        formData.get('status')   ?? '',
    overview:      formData.get('overview') ?? '',
    personality:   formData.get('personality') ?? '',
    neighborhood:  formData.get('neighborhood') ?? '',
    caption:       formData.get('caption')  ?? '',
    location_text: formData.get('location_text') ?? '',
  })
  if (!result.success) {
    return { error: `Campo inválido: ${result.error.issues[0].path.join('.')} — ${result.error.issues[0].message}` }
  }
  const p = result.data

  const lat = formData.get('lat') ? parseFloat(formData.get('lat') as string) : null
  const lng = formData.get('lng') ? parseFloat(formData.get('lng') as string) : null

  const { data: petId, error: fnError } = await supabase.rpc('create_official_pet_post', {
    p_species:       p.species,
    p_type:          p.type,
    p_name:          p.name,
    p_breed:         p.breed,
    p_age_text:      p.age_text,
    p_gender:        p.gender,
    p_status:        p.status,
    p_overview:      p.overview,
    p_personality:   p.personality,
    p_neighborhood:  p.neighborhood,
    p_caption:       p.caption,
    p_location_text: p.location_text,
    p_traits:        [],
    p_lat:           isFinite(lat ?? NaN) ? lat : null,
    p_lng:           isFinite(lng ?? NaN) ? lng : null,
  })

  if (fnError || !petId) return { error: fnError?.message ?? 'Erro ao criar post oficial.' }

  // Fotos: upload com as credenciais do admin, vinculadas ao pet oficial
  const { data: adminUser } = await supabase.auth.getUser()
  const uid = adminUser.user?.id ?? 'official'

  const { data: post } = await supabase
    .from('posts')
    .select('id')
    .eq('pet_id', petId)
    .single()

  if (post) {
    const photos = (formData.getAll('photos') as File[]).slice(0, MAX_PHOTOS)
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i]
      if (!file || file.size === 0 || file.size > MAX_PHOTO_SIZE) continue
      const ext  = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'jpg'
      const path = `${uid}/${petId}/${i}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('pets')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (uploadError) continue
      const { data: { publicUrl } } = supabase.storage.from('pets').getPublicUrl(path)
      await supabase.from('post_photos').insert({ post_id: post.id, url: publicUrl, position: i })
    }
  }

  revalidatePath('/')
  return { petId: petId as string }
}
