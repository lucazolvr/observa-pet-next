'use server'

import { redirect } from 'next/navigation'
import { supaServer } from '@/lib/supabase/server'
import { requireAuth, safeExt, safeJsonArray, rateLimit } from '@/lib/security'
import { petSchema } from '@/lib/schemas'

const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_PHOTOS = 6

export type CreatePetResult = { error: string } | null

export async function createPet(formData: FormData): Promise<CreatePetResult> {
  const supabase = await supaServer()
  const user = await requireAuth(supabase).catch(() => null)
  if (!user) redirect('/login')

  try {
    await rateLimit(supabase, `create_pet:${user.id}`, 20, 3600)
  } catch {
    return { error: 'Muitas requisições. Tente novamente em breve.' }
  }

  const result = petSchema.safeParse({
    species:           formData.get('species') ?? '',
    type:              formData.get('tipo')    ?? '',
    name:              formData.get('name')    ?? '',
    breed:             formData.get('breed')   ?? '',
    age_text:          formData.get('age_text') ?? '',
    gender:            formData.get('gender')   ?? '',
    status:            formData.get('status')   ?? '',
    overview:          formData.get('overview') ?? '',
    personality:       formData.get('personality') ?? '',
    neighborhood:      formData.get('neighborhood') ?? '',
    caption:           formData.get('caption')  ?? '',
    location_text:     formData.get('location_text') ?? '',
    porte:             formData.get('porte') ?? '',
    condicao_corporal: formData.get('condicao_corporal') ?? null,
    feridas:           formData.get('feridas') ?? false,
    feridas_desc:      formData.get('feridas_desc') ?? '',
  })
  if (!result.success) {
    const first = result.error.issues[0]
    return { error: `Campo inválido: ${first.path.join('.')} — ${first.message}` }
  }
  const parsed = result.data

  const traits = safeJsonArray(formData.get('traits') as string | null)
    .filter(t => typeof t === 'string' && t.length <= 50)
    .slice(0, 10)

  const lat = formData.get('lat') ? parseFloat(formData.get('lat') as string) : null
  const lng = formData.get('lng') ? parseFloat(formData.get('lng') as string) : null

  const { data: pet, error: petError } = await supabase
    .from('pets')
    .insert({
      created_by:        user.id,
      species:           parsed.species,
      name:              parsed.name,
      breed:             parsed.breed,
      age_text:          parsed.age_text,
      gender:            parsed.gender,
      status:            parsed.status,
      overview:          parsed.overview,
      personality:       parsed.personality,
      neighborhood:      parsed.neighborhood,
      traits,
      porte:             parsed.porte ?? null,
      condicao_corporal: parsed.condicao_corporal ?? null,
      feridas:           parsed.feridas ?? false,
      feridas_desc:      parsed.feridas_desc ?? null,
      lat: isFinite(lat ?? NaN) ? lat : null,
      lng: isFinite(lng ?? NaN) ? lng : null,
    })
    .select('id')
    .single()

  if (petError || !pet) return { error: `Erro ao salvar animal: ${petError?.message ?? 'desconhecido'}` }

  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      pet_id:        pet.id,
      author_id:     user.id,
      type:          parsed.type,
      caption:       parsed.caption,
      location_text: parsed.location_text,
      neighborhood:  parsed.neighborhood,
    })
    .select('id')
    .single()

  if (postError || !post) return { error: `Erro ao criar post: ${postError?.message ?? 'desconhecido'}` }

  const photos = (formData.getAll('photos') as File[]).slice(0, MAX_PHOTOS)
  for (let i = 0; i < photos.length; i++) {
    const file = photos[i]
    if (!file || file.size === 0) continue
    if (file.size > MAX_PHOTO_SIZE) continue // skip files that are too large
    const ext  = safeExt(file.name)
    const path = `${user.id}/${pet.id}/${i}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('pets')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (uploadError) continue
    const { data: { publicUrl } } = supabase.storage.from('pets').getPublicUrl(path)
    await supabase.from('post_photos').insert({ post_id: post.id, url: publicUrl, position: i })
  }

  redirect(`/pet/${pet.id}`)
  return null
}
