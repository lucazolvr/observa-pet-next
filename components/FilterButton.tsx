'use client'

import { Suspense, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

const SPECIES = [
  { value: '',        label: 'Todos',    icon: '🐾' },
  { value: 'cachorro', label: 'Cachorro', icon: '🐕' },
  { value: 'gato',    label: 'Gato',     icon: '🐈' },
  { value: 'outro',   label: 'Outro',    icon: '🦜' },
]

function FilterDrawer({ onClose }: { onClose: () => void }) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [species, setSpecies] = useState(searchParams.get('species') ?? '')

  function apply() {
    const params = new URLSearchParams(searchParams.toString())
    if (species) params.set('species', species)
    else params.delete('species')
    router.push(`/?${params.toString()}`)
    onClose()
  }

  function clear() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('species')
    params.delete('filter')
    params.delete('q')
    router.push(`/?${params.toString()}`)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center">
        <div className="w-full max-w-[430px] bg-bg rounded-t-sheet pb-[env(safe-area-inset-bottom)] max-h-[85vh] overflow-y-auto">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <h2 className="font-bold text-ink">Filtros</h2>
            <button onClick={onClose} className="text-muted p-1"><X size={20} /></button>
          </div>

          <div className="px-5 py-5 space-y-6">
            {/* Espécie */}
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Espécie</p>
              <div className="flex gap-2 flex-wrap">
                {SPECIES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setSpecies(s.value)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-chip text-sm font-semibold border-2 transition-all ${
                      species === s.value
                        ? 'border-blue bg-blue-soft text-blue'
                        : 'border-border bg-card text-body'
                    }`}
                  >
                    <span>{s.icon}</span> {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={clear}
                className="flex-1 py-3 rounded-btn text-sm font-semibold text-body bg-card border border-border"
              >
                Limpar tudo
              </button>
              <button
                onClick={apply}
                className="flex-1 py-3 rounded-btn text-sm font-bold text-white bg-blue shadow-btn"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function FilterButton({ hasActiveFilter }: { hasActiveFilter: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative w-12 h-12 rounded-btn bg-blue flex items-center justify-center shadow-btn shrink-0"
        aria-label="Filtros"
      >
        <SlidersHorizontal size={18} className="text-white" />
        {hasActiveFilter && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-coral border-2 border-white" />
        )}
      </button>

      {open && (
        <Suspense>
          <FilterDrawer onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  )
}
