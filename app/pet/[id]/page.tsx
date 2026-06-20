import { fetchPet, fetchComments } from '@/lib/pet'
import { supaServer } from '@/lib/supabase/server'
import PetProfile from '@/components/PetProfile'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  try {
    const { id } = await params
    const { pet } = await fetchPet(id)
    const photo = pet.posts[0]?.photos?.[0]?.url
    const name  = pet.name ?? 'Animal'
    const place = pet.neighborhood ?? 'São Luís, MA'
    const title = `${name} · ObservaPet`
    const desc  = `Animal em situação de rua em ${place}. Ajude a encontrar um lar ou um resgatador.`
    return {
      title,
      description: desc,
      openGraph: {
        title,
        description: desc,
        images: photo ? [{ url: photo, width: 800, height: 600, alt: name }] : [],
        type: 'article',
      },
      twitter: {
        card: photo ? 'summary_large_image' : 'summary',
        title,
        description: desc,
        images: photo ? [photo] : [],
      },
    }
  } catch {
    return { title: 'Animal · ObservaPet' }
  }
}

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
