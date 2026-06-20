'use server'

import { supaServer } from '@/lib/supabase/server'
import { requireAuth, safeExt } from '@/lib/security'
import { profileSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'

const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5 MB

export async function updateProfile(formData: FormData) {
  const supabase = await supaServer()
  const user = await requireAuth(supabase)

  const validated = profileSchema.parse({
    name: formData.get('name') ?? '',
    bio:  formData.get('bio')  ?? '',
    city: formData.get('city') ?? '',
  })

  const file = formData.get('avatar') as File | null
  let avatar_url: string | undefined

  if (file && file.size > 0) {
    if (file.size > MAX_AVATAR_SIZE) throw new Error('Avatar muito grande (máx 5 MB)')
    const ext  = safeExt(file.name)
    const path = `${user.id}.${ext}`
    await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    avatar_url = `${urlData.publicUrl}?t=${Date.now()}`
  }

  await supabase
    .from('profiles')
    .update({ ...validated, ...(avatar_url ? { avatar_url } : {}) })
    .eq('id', user.id)

  revalidatePath('/perfil')
}
