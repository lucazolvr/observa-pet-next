'use client'

import { useState, useEffect } from 'react'
import { supaBrowser } from '@/lib/supabase/client'
import MapaSaoLuis from '@/components/MapaSaoLuis'
import type { HeatEntry } from '@/types'

const LEGEND = [
  { color: '#f5f7fb', label: '0' },
  { color: '#e8f0ff', label: '1–2' },
  { color: '#5b8cff', label: '3–5' },
  { color: '#2a6af0', label: '6–9' },
  { color: '#ff6a55', label: '10+' },
]

export default function HeatmapLive({ initialHeat }: { initialHeat: HeatEntry[] }) {
  const [heatData, setHeatData] = useState<HeatEntry[]>(initialHeat)
  const supabase = supaBrowser()

  useEffect(() => {
    const channel = supabase
      .channel('posts-heatmap')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        async () => {
          const { data } = await supabase
            .from('neighborhood_heat')
            .select('neighborhood, count')
          if (data) setHeatData(data as unknown as HeatEntry[])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  const total = heatData.reduce((s, h) => s + Number(h.count), 0)

  return (
    <div className="pt-2">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-5 py-3">
        <p className="text-sm text-body">
          <span className="font-bold text-ink">{total}</span> avistamentos nas últimas 72h
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-green text-sm animate-op-live">●</span>
          <span className="text-xs font-semibold text-green">ao vivo</span>
        </div>
      </div>

      {/* Mapa */}
      <div className="px-4">
        <MapaSaoLuis heatData={heatData} />
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-between px-5 pt-3 pb-4">
        {LEGEND.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full border border-border shrink-0"
              style={{ background: color }}
            />
            <span className="text-[11px] text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
