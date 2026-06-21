'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Navigation, X, Search } from 'lucide-react'
import { BAIRROS_SAO_LUIS } from '@/lib/bairros'
import type { FormState, FormAction } from '@/app/(app)/adicionar/page'

type Props = { state: FormState; dispatch: React.Dispatch<FormAction> }

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-bold text-ink mb-2">{children}</p>
}

const inputClass = "w-full rounded-[14px] border border-border bg-bg px-3 py-2.5 text-sm text-body placeholder:text-muted focus:outline-none focus:border-blue transition-colors"

// ─── Combobox de bairros ───────────────────────────────────────────────────────

function NeighborhoodCombobox({ value, onChange }: {
  value: string
  onChange: (v: string) => void
}) {
  const [query, setQuery] = useState(value)
  const [open, setOpen]   = useState(false)
  const containerRef      = useRef<HTMLDivElement>(null)
  const inputRef          = useRef<HTMLInputElement>(null)

  const filtered = query.length === 0
    ? BAIRROS_SAO_LUIS
    : BAIRROS_SAO_LUIS.filter(b =>
        b.toLowerCase().includes(query.toLowerCase())
      )

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        if (!BAIRROS_SAO_LUIS.some(b => b.toLowerCase() === query.toLowerCase())) {
          onChange(query)
        }
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, query, onChange])

  function select(bairro: string) {
    onChange(bairro)
    setQuery(bairro)
    setOpen(false)
  }

  function clear() {
    onChange('')
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Buscar bairro…"
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="w-full rounded-[14px] border border-border bg-bg pl-9 pr-9 py-2.5 text-sm text-body placeholder:text-muted focus:outline-none focus:border-blue transition-colors"
        />
        {query && (
          <button type="button" onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body">
            <X size={14} />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full max-h-52 overflow-y-auto bg-card border border-border rounded-[14px] shadow-card py-1">
          {filtered.map(b => (
            <li key={b}>
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); select(b) }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  value === b ? 'bg-blue text-white font-semibold' : 'text-body hover:bg-blue-soft'
                }`}
              >
                {b}
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && filtered.length === 0 && query.length > 0 && (
        <div className="absolute z-30 mt-1 w-full bg-card border border-border rounded-[14px] shadow-card px-4 py-3">
          <p className="text-xs text-muted">Nenhum bairro encontrado — o texto digitado será salvo.</p>
        </div>
      )}
    </div>
  )
}

// ─── Step principal ────────────────────────────────────────────────────────────

export default function Step4Localizacao({ state, dispatch }: Props) {
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError]     = useState('')

  function set(field: keyof FormState, value: unknown) {
    dispatch({ type: 'SET_FIELD', field, value })
  }

  function getGPS() {
    if (!navigator.geolocation) { setGeoError('Seu navegador não suporta geolocalização'); return }
    setGeoLoading(true)
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        set('lat', pos.coords.latitude)
        set('lng', pos.coords.longitude)
        set('location_text', state.location_text || `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`)
        setGeoLoading(false)
      },
      () => {
        setGeoError('Não foi possível obter a localização. Verifique as permissões.')
        setGeoLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const hasGPS = !!(state.lat && state.lng)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[18px] font-extrabold text-ink mb-1">Localização</h2>
        <p className="text-sm text-muted mb-4">Onde o animal foi encontrado?</p>
      </div>

      {/* GPS */}
      <button
        type="button"
        onClick={getGPS}
        disabled={geoLoading}
        className={`flex items-center gap-3 w-full rounded-[14px] border-2 px-4 py-3 transition-all ${
          hasGPS ? 'border-green bg-green/5 text-green' : 'border-dashed border-border text-muted'
        }`}
      >
        {geoLoading
          ? <Loader2 size={18} className="animate-spin shrink-0" />
          : <Navigation size={18} className="shrink-0" />
        }
        <span className="text-sm font-semibold">
          {geoLoading ? 'Obtendo localização…' : hasGPS ? 'GPS capturado ✓' : 'Usar minha localização (GPS)'}
        </span>
      </button>
      {geoError && <p className="text-xs text-coral -mt-3">{geoError}</p>}

      {/* Bairro — combobox */}
      <div>
        <Label>Bairro</Label>
        <NeighborhoodCombobox
          value={state.neighborhood}
          onChange={v => set('neighborhood', v)}
        />
      </div>

      {/* Endereço */}
      <div>
        <Label>Endereço</Label>
        <input
          type="text"
          value={state.location_text}
          onChange={e => set('location_text', e.target.value)}
          placeholder="Ex: Rua das Flores, próx. ao mercado"
          className={inputClass}
        />
      </div>
    </div>
  )
}
