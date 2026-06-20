import { notFound } from 'next/navigation'
import { fetchOng } from '@/lib/ongs'
import OngProfile from '@/components/OngProfile'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export default async function OngPage({ params }: Props) {
  const { id } = await params
  const ong = await fetchOng(id)
  if (!ong) notFound()

  return <OngProfile ong={ong} backHref="/ongs" />
}
