'use client'

import { useState } from 'react'
import HeatmapLive from '@/components/HeatmapLive'
import ArticleList from '@/components/ArticleList'
import type { HeatEntry, Article } from '@/types'

type Tab = 'mapa' | 'artigos'

type Props = {
  initialHeat: HeatEntry[]
  articles: Article[]
}

function TabBtn({ active, onClick, children }: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
        active ? 'border-blue text-blue' : 'border-transparent text-muted'
      }`}
    >
      {children}
    </button>
  )
}

export default function InfoTabs({ initialHeat, articles }: Props) {
  const [tab, setTab] = useState<Tab>('mapa')

  return (
    <div className="flex flex-col min-h-0">
      {/* Abas */}
      <div className="flex border-b border-border px-5">
        <TabBtn active={tab === 'artigos'} onClick={() => setTab('artigos')}>
          Artigos
        </TabBtn>
        <TabBtn active={tab === 'mapa'} onClick={() => setTab('mapa')}>
          Mapa ao vivo
        </TabBtn>
      </div>

      {/* Conteúdo */}
      {tab === 'mapa' ? (
        <HeatmapLive initialHeat={initialHeat} />
      ) : (
        <ArticleList articles={articles} />
      )}
    </div>
  )
}
