import { notFound } from 'next/navigation'
import { fetchOng } from '@/lib/ongs'
import OngProfile from '@/components/OngProfile'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params
    const ong = await fetchOng(id)
    if (!ong) return { title: 'ONG · ObservaPet' }
    const title = `${ong.name} · ObservaPet`
    const desc  = ong.mission ?? `ONG de proteção animal em ${ong.city ?? 'São Luís, MA'}.`
    return {
      title,
      description: desc,
      openGraph: {
        title,
        description: desc,
        images: ong.cover_url
          ? [{ url: ong.cover_url, width: 1200, height: 630, alt: ong.name }]
          : ong.avatar_url
          ? [{ url: ong.avatar_url, width: 400, height: 400, alt: ong.name }]
          : [],
        type: 'profile',
      },
    }
  } catch {
    return { title: 'ONG · ObservaPet' }
  }
}

export default async function OngPage({ params }: Props) {
  const { id } = await params
  const ong = await fetchOng(id)
  if (!ong) notFound()

  return <OngProfile ong={ong} backHref="/ongs" />
}
