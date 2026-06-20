import { fetchOngs } from '@/lib/ongs'
import OngCard from '@/components/OngCard'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ONGs',
  description: 'Conheça as organizações de proteção animal parceiras do ObservaPet em São Luís, MA.',
  openGraph: {
    title: 'ONGs parceiras · ObservaPet',
    description: 'Apoie as organizações que cuidam dos animais de rua em São Luís.',
    type: 'website',
  },
}

export default async function OngsPage() {
  const ongs = await fetchOngs()

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-[22px] font-extrabold text-ink">ONGs</h1>
        <p className="text-sm text-muted">Organizações que cuidam dos animais de São Luís</p>
      </div>

      <div className="px-4 flex flex-col gap-3 pb-24">
        {ongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
            <p className="text-sm">Nenhuma ONG cadastrada ainda</p>
          </div>
        ) : (
          ongs.map(ong => <OngCard key={ong.id} ong={ong} />)
        )}
      </div>
    </div>
  )
}
