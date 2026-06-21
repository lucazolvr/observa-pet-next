'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { NEIGHBORHOOD_COORDS } from '@/lib/neighborhoodCoords'
import type { HeatEntry, HeatDetail } from '@/types'

// ─── Cor e tamanho baseados na contagem ──────────────────────────────────────

function heatFill(count: number): string {
  if (count <= 0) return '#94a3b8'
  if (count <= 2) return '#60a5fa'
  if (count <= 5) return '#f59e0b'
  if (count <= 9) return '#f97316'
  return '#ef4444'
}

function heatRadius(count: number): number {
  return Math.max(14, Math.min(44, 14 + count * 2.5))
}

// ─── FlyTo — centraliza o mapa no bairro selecionado ─────────────────────────

function FlyTo({ coords }: { coords: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.flyTo(coords, Math.max(map.getZoom(), 14), { duration: 0.7 })
  }, [coords, map])
  return null
}

// ─── Painel de detalhes (slide-up) ───────────────────────────────────────────

const TYPE_META: Record<string, { label: string; color: string }> = {
  avistado:   { label: 'Avistado',         color: '#3b82f6' },
  resgate:    { label: 'Resgate urgente',   color: '#ef4444' },
  adocao:     { label: 'Para adoção',       color: '#22c55e' },
  perdido:    { label: 'Perdido',           color: '#f59e0b' },
  tratamento: { label: 'Em tratamento',     color: '#a855f7' },
}

function DetailPanel({ detail, onClose }: { detail: HeatDetail; onClose: () => void }) {
  const entries = Object.entries(detail.byType).sort((a, b) => b[1] - a[1])
  const max = Math.max(...entries.map(([, v]) => v), 1)

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-card rounded-t-[20px] shadow-2xl border-t border-border animate-slide-up">
      {/* Drag handle */}
      <div className="flex justify-center pt-2.5 pb-1">
        <div className="w-8 h-1 rounded-full bg-border" />
      </div>

      <div className="px-5 pb-5 overflow-y-auto" style={{ maxHeight: '52vh' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4 mt-1">
          <div>
            <h3 className="text-[17px] font-extrabold text-ink leading-tight">{detail.neighborhood}</h3>
            <p className="text-sm text-muted mt-0.5">
              <span className="font-bold text-ink">{detail.total}</span>{' '}
              avistamento{detail.total !== 1 ? 's' : ''} · últimas 72h
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-bg text-muted hover:text-ink shrink-0 ml-2"
          >
            ✕
          </button>
        </div>

        {entries.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {entries.map(([tipo, count]) => {
              const meta = TYPE_META[tipo] ?? { label: tipo, color: '#6b7280' }
              return (
                <div key={tipo}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: meta.color }} />
                      <span className="text-sm font-semibold text-ink">{meta.label}</span>
                    </div>
                    <span className="text-sm font-bold text-ink">{count}</span>
                  </div>
                  <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(count / max) * 100}%`, background: meta.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted">Sem dados de tipo disponíveis.</p>
        )}

        <a
          href={`/?bairro=${encodeURIComponent(detail.neighborhood)}`}
          className="mt-5 flex items-center justify-center w-full py-3 rounded-btn bg-blue text-white text-sm font-bold"
        >
          Ver posts do bairro →
        </a>
      </div>
    </div>
  )
}

// ─── Mapa principal ───────────────────────────────────────────────────────────

type Props = {
  heatData: HeatEntry[]
  details: HeatDetail[]
}

export default function MapaLeaflet({ heatData, details }: Props) {
  const [selected, setSelected] = useState<HeatDetail | null>(null)
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)

  const detailMap = Object.fromEntries(details.map(d => [d.neighborhood, d]))
  const countMap  = Object.fromEntries(heatData.map(h => [h.neighborhood, Number(h.count)]))

  function handleClick(name: string) {
    setSelected(detailMap[name] ?? { neighborhood: name, total: countMap[name] ?? 0, byType: {} })
    const c = NEIGHBORHOOD_COORDS[name]
    if (c) setFlyTarget(c)
  }

  // Bairros conhecidos — com dados primeiro, depois sem
  const withData    = heatData.filter(h => NEIGHBORHOOD_COORDS[h.neighborhood])
  const withoutData = Object.keys(NEIGHBORHOOD_COORDS).filter(n => !countMap[n])

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[-2.535, -44.295]}
        zoom={12}
        scrollWheelZoom
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='© <a href="https://carto.com/attributions">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {/* Bairros sem dados — pontos discretos */}
        {withoutData.map(name => (
          <CircleMarker
            key={`ghost-${name}`}
            center={NEIGHBORHOOD_COORDS[name]}
            radius={5}
            pathOptions={{ fillColor: '#cbd5e1', fillOpacity: 0.5, color: 'white', weight: 1.5, opacity: 0.7 }}
            eventHandlers={{ click: () => handleClick(name) }}
          >
            <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 12 }}>{name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Sem avistamentos</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}

        {/* Bairros com dados — círculos de calor */}
        {withData.map(({ neighborhood, count }) => {
          const isSelected = selected?.neighborhood === neighborhood
          return (
            <CircleMarker
              key={neighborhood}
              center={NEIGHBORHOOD_COORDS[neighborhood]}
              radius={heatRadius(count)}
              pathOptions={{
                fillColor: heatFill(count),
                fillOpacity: isSelected ? 1 : 0.88,
                color: 'white',
                weight: isSelected ? 3 : 2,
                opacity: 1,
              }}
              eventHandlers={{ click: () => handleClick(neighborhood) }}
            >
              <Tooltip direction="top" offset={[0, -(heatRadius(count) + 4)]} opacity={0.97}>
                <div style={{ textAlign: 'center', minWidth: 90 }}>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{neighborhood}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {count} avistamento{count !== 1 ? 's' : ''} · 72h
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          )
        })}

        <FlyTo coords={flyTarget} />
      </MapContainer>

      {selected && (
        <DetailPanel detail={selected} onClose={() => { setSelected(null); setFlyTarget(null) }} />
      )}
    </div>
  )
}
