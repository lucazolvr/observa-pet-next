'use server'

import { redirect } from 'next/navigation'
import { supaServer } from '@/lib/supabase/server'

export async function createPet(formData: FormData): Promise<never> {
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const traits = JSON.parse((formData.get('traits') as string) ?? '[]') as string[]

  const { data: pet, error: petError } = await supabase
    .from('pets')
    .insert({
      created_by:  user.id,
      species:     formData.get('species') as string,
      name:        (formData.get('name') as string) || null,
      breed:       (formData.get('breed') as string) || null,
      age_text:    (formData.get('age_text') as string) || null,
      gender:      (formData.get('gender') as string) || null,
      status:      formData.get('status') as string,
      overview:    (formData.get('overview') as string) || null,
      personality: (formData.get('personality') as string) || null,
      traits,
      neighborhood: (formData.get('neighborhood') as string) || null,
    })
    .select('id')
    .single()

  if (petError || !pet) throw new Error('Erro ao criar animal')

  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      pet_id:        pet.id,
      author_id:     user.id,
      type:          formData.get('tipo') as string,
      caption:       (formData.get('caption') as string) || null,
      location_text: (formData.get('location_text') as string) || null,
      neighborhood:  (formData.get('neighborhood') as string) || null,
    })
    .select('id')
    .single()

  if (postError || !post) throw new Error('Erro ao criar post')

  const photos = formData.getAll('photos') as File[]
  for (let i = 0; i < photos.length; i++) {
    const file = photos[i]
    if (!file || file.size === 0) continue
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.id}/${pet.id}/${i}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('pets')
      .upload(path, file, { upsert: true, contentType: file.type })
    if (uploadError) continue
    const { data: { publicUrl } } = supabase.storage.from('pets').getPublicUrl(path)
    await supabase.from('post_photos').insert({ post_id: post.id, url: publicUrl, position: i })
  }

  redirect(`/pet/${pet.id}`)
}
