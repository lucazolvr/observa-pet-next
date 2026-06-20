import { supaServer } from '@/lib/supabase/server'
import { fetchProfile, fetchUserPosts } from '@/lib/profile'
import PerfilView from '@/components/PerfilView'
import PerfilLoginCta from '@/components/PerfilLoginCta'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <PerfilLoginCta />

  const [profile, posts] = await Promise.all([
    fetchProfile(user.id),
    fetchUserPosts(user.id),
  ])

  return <PerfilView profile={profile} posts={posts} />
}
