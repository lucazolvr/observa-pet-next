'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const FILTERS = [
  { value: '',          label: 'Todos' },
  { value: 'avistado',  label: 'Avistados' },
  { value: 'adocao',    label: 'Adoção' },
  { value: 'resgate',   label: 'Resgates' },
  { value: 'tratamento',label: 'Tratamento' },
]

function Filters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('filter') ?? ''

  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString())
            if (f.value) params.set('filter', f.value)
            else params.delete('filter')
            router.push(`/?${params.toString()}`)
          }}
          className={`shrink-0 px-4 py-2 rounded-chip text-sm font-semibold transition-all ${
            active === f.value
              ? 'bg-blue text-white'
              : 'bg-card text-body border border-border'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

export default function FeedFilters() {
  return (
    <Suspense>
      <Filters />
    </Suspense>
  )
}
