'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'
import { BAIRROS_SAO_LUIS } from '@/lib/bairros'

type Props = {
  value: string
  onChange: (v: string) => void
  className?: string
}

export default function NeighborhoodCombobox({ value, onChange, className = '' }: Props) {
  const [query, setQuery]     = useState(value)
  const [open, setOpen]       = useState(false)
  const containerRef          = useRef<HTMLDivElement>(null)
  const inputRef              = useRef<HTMLInputElement>(null)

  const filtered = query.length === 0
    ? BAIRROS_SAO_LUIS
    : BAIRROS_SAO_LUIS.filter(b => b.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        onChange(query)
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
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Buscar bairro…"
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="w-full bg-bg border border-border rounded-[10px] pl-8 pr-8 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-blue transition-colors"
        />
        {query && (
          <button type="button" onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body">
            <X size={13} />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full max-h-48 overflow-y-auto bg-card border border-border rounded-[10px] shadow-card py-1">
          {filtered.map(b => (
            <li key={b}>
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); select(b) }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
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
        <div className="absolute z-30 mt-1 w-full bg-card border border-border rounded-[10px] shadow-card px-3 py-2.5">
          <p className="text-xs text-muted">Bairro não encontrado — o texto será salvo assim mesmo.</p>
        </div>
      )}
    </div>
  )
}
