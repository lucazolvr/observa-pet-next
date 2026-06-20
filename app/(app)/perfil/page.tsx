import { redirect } from 'next/navigation'
import { supaServer } from '@/lib/supabase/server'
import { fetchProfile, fetchUserPosts } from '@/lib/profile'
import PerfilView from '@/components/PerfilView'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const supabase = await supaServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, posts] = await Promise.all([
    fetchProfile(user.id),
    fetchUserPosts(user.id),
  ])

  return <PerfilView profile={profile} posts={posts} />
}
