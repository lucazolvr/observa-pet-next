import { fetchPet, fetchComments } from '@/lib/pet'
import { supaServer } from '@/lib/supabase/server'
import PetProfileBackdrop from '@/components/PetProfileBackdrop'
import PetProfile from '@/components/PetProfile'

export default async function PetModalPage({ params }: { params: Promise<{ id: string }> }) {
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
    <>
      <PetProfileBackdrop />
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
        <div className="w-full max-w-[430px] h-[96dvh] bg-card rounded-t-sheet overflow-y-auto animate-slide-up pointer-events-auto">
          <PetProfile
            pet={pet}
            latestPost={latestPost}
            initialComments={initialComments}
            userId={user?.id ?? null}
            isModal
          />
        </div>
      </div>
    </>
  )
}
