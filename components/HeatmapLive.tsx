'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react'
import { supaBrowser } from '@/lib/supabase/client'
import type { HeatEntry, HeatDetail } from '@/types'

// Leaflet precisa do window — carregado somente no cliente
const MapaLeaflet = dynamic(() => import('@/components/MapaLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-bg">
      <div className="w-8 h-8 rounded-full border-2 border-blue border-t-transparent animate-spin" />
      <p className="text-xs text-muted">Carregando mapa…</p>
    </div>
  ),
})

const LEGEND = [
  { color: '#94a3b8', label: 'Sem dados' },
  { color: '#60a5fa', label: '1–2' },
  { color: '#f59e0b', label: '3–5' },
  { color: '#f97316', label: '6–9' },
  { color: '#ef4444', label: '10+' },
]

async function fetchDetails(supabase: ReturnType<typeof supaBrowser>): Promise<HeatDetail[]> {
  const since = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('posts')
    .select('neighborhood, type')
    .not('neighborhood', 'is', null)
    .gte('created_at', since)
  if (!data) return []

  const map: Record<string, Record<string, number>> = {}
  for (const { neighborhood, type } of data) {
    if (!neighborhood) continue
    map[neighborhood] ??= {}
    map[neighborhood][type] = (map[neighborhood][type] ?? 0) + 1
  }
  return Object.entries(map).map(([neighborhood, byType]) => ({
    neighborhood,
    total: Object.values(byType).reduce((s, v) => s + v, 0),
    byType,
  }))
}

type Props = { initialHeat: HeatEntry[] }

export default function HeatmapLive({ initialHeat }: Props) {
  const [heatData, setHeatData]   = useState<HeatEntry[]>(initialHeat)
  const [details,  setDetails]    = useState<HeatDetail[]>([])
  const [fullscreen, setFullscreen] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(Date.now())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const supabase = supaBrowser()

  const total = heatData.reduce((s, h) => s + Number(h.count), 0)
  const topBairro = [...heatData].sort((a, b) => b.count - a.count)[0]

  const refresh = useCallback(async () => {
    setIsRefreshing(true)
    const [{ data: heat }, det] = await Promise.all([
      supabase.from('neighborhood_heat').select('neighborhood, count'),
      fetchDetails(supabase),
    ])
    if (heat) setHeatData(heat as unknown as HeatEntry[])
    setDetails(det)
    setLastRefresh(Date.now())
    setIsRefreshing(false)
  }, [supabase])

  // Carregamento inicial dos detalhes
  useEffect(() => {
    fetchDetails(supabase).then(setDetails)
  }, [supabase])

  // Realtime: atualiza ao receber novo post
  useEffect(() => {
    const channel = supabase
      .channel('posts-heatmap')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, refresh)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, refresh])

  // Bloquear scroll do body em fullscreen
  useEffect(() => {
    document.body.style.overflow = fullscreen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [fullscreen])

  const mapContent = (
    <div className="relative w-full h-full">
      <MapaLeaflet heatData={heatData} details={details} />

      {/* Botão fullscreen */}
      <button
        onClick={() => setFullscreen(f => !f)}
        className="absolute top-3 right-3 z-[999] w-9 h-9 rounded-full bg-card shadow-card border border-border flex items-center justify-center text-muted hover:text-ink transition-colors"
        aria-label={fullscreen ? 'Sair do modo expandido' : 'Expandir mapa'}
      >
        {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>

      {/* Contador ao vivo no canto */}
      <div className="absolute top-3 left-3 z-[999] flex items-center gap-1.5 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5 border border-border shadow-sm">
        <span className="text-green text-xs animate-pulse">●</span>
        <span className="text-xs font-bold text-ink">{total}</span>
        <span className="text-xs text-muted">ao vivo</span>
      </div>
    </div>
  )

  return (
    <>
      {/* Modo fullscreen */}
      {fullscreen && (
        <div className="fixed inset-0 z-[9999] bg-bg flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
            <div>
              <h2 className="text-sm font-extrabold text-ink">Mapa de calor · São Luís</h2>
              <p className="text-xs text-muted">{total} avistamentos nas últimas 72h</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                disabled={isRefreshing}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-bg border border-border text-muted hover:text-blue disabled:opacity-40"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setFullscreen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-bg border border-border text-muted hover:text-ink"
              >
                <Minimize2 size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 relative">{mapContent}</div>

          {/* Legenda */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-card shrink-0">
            {LEGEND.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border border-border/50 shrink-0" style={{ background: color }} />
                <span className="text-[11px] text-muted">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modo inline (padrão) */}
      {!fullscreen && (
        <div className="flex flex-col">
          {/* Cabeçalho com stats rápidas */}
          <div className="px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm text-body">
                <span className="font-extrabold text-ink text-base">{total}</span>{' '}
                avistamentos nas últimas 72h
              </p>
              {topBairro && (
                <p className="text-xs text-muted mt-0.5">
                  Bairro mais ativo: <span className="font-semibold text-body">{topBairro.neighborhood}</span> ({topBairro.count})
                </p>
              )}
            </div>
            <button
              onClick={refresh}
              disabled={isRefreshing}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-bg border border-border text-muted hover:text-blue disabled:opacity-40"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Mapa */}
          <div className="relative mx-4 rounded-[16px] overflow-hidden border border-border" style={{ height: 340 }}>
            {mapContent}
          </div>

          {/* Legenda */}
          <div className="flex items-center justify-between px-5 pt-3 pb-4">
            {LEGEND.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full border border-border/50 shrink-0" style={{ background: color }} />
                <span className="text-[11px] text-muted">{label}</span>
              </div>
            ))}
          </div>

          {/* Hint */}
          <p className="text-center text-[11px] text-muted pb-4 -mt-2">
            Toque em um círculo para ver detalhes ·
            <button onClick={() => setFullscreen(true)} className="text-blue font-semibold ml-1">
              Expandir mapa
            </button>
          </p>
        </div>
      )}
    </>
  )
}
