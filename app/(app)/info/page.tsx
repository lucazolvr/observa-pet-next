import { supaServer } from '@/lib/supabase/server'
import InfoTabs from '@/components/InfoTabs'
import type { HeatEntry, Article } from '@/types'

export const dynamic = 'force-dynamic'

export default async function InfoPage() {
  const supabase = await supaServer()

  const [{ data: heatData }, { data: articles }] = await Promise.all([
    supabase.from('neighborhood_heat').select('neighborhood, count'),
    supabase
      .from('articles')
      .select('id, category, title, excerpt, body, cover_url, author, read_minutes, published_at')
      .order('published_at', { ascending: false }),
  ])

  return (
    <div className="flex flex-col min-h-dvh">
      <div className="px-5 pt-5 pb-3">
        <h1 className="text-[22px] font-extrabold text-ink">Mapa & Info</h1>
        <p className="text-sm text-muted">São Luís · animais em situação de rua</p>
      </div>

      <InfoTabs
        initialHeat={(heatData ?? []) as unknown as HeatEntry[]}
        articles={(articles ?? []) as unknown as Article[]}
      />
    </div>
  )
}
