'use client'

import { useState } from 'react'
import { Loader2, Navigation } from 'lucide-react'
import NeighborhoodCombobox from '@/components/NeighborhoodCombobox'
import type { FormState, FormAction } from '@/app/(app)/adicionar/page'

type Props = { state: FormState; dispatch: React.Dispatch<FormAction> }

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-bold text-ink mb-2">{children}</p>
}

const inputClass = "w-full rounded-[14px] border border-border bg-bg px-3 py-2.5 text-sm text-body placeholder:text-muted focus:outline-none focus:border-blue transition-colors"

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
