import { fetchPet, fetchComments } from '@/lib/pet'
import { supaServer } from '@/lib/supabase/server'
import PetProfile from '@/components/PetProfile'

export const dynamic = 'force-dynamic'

export default async function PetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [{ pet, latestPost }, supabase] = await Promise.all([
    fetchPet(id),
    supaServer(),
  ])

  const [initialComments, { data: { user } }] = await Promise.all([
    latestPost ? fetchComments(latestPost.id) : Promise.resolve([]),
    supabase.auth.getUser(),
  ])

  return (
    <div className="min-h-dvh bg-card max-w-[430px] mx-auto">
      <PetProfile
        pet={pet}
        latestPost={latestPost}
        initialComments={initialComments}
        userId={user?.id ?? null}
        isModal={false}
      />
    </div>
  )
}
