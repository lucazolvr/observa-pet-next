'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export default function SearchBar() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync when URL changes externally (e.g. filter chip clears search)
  useEffect(() => {
    setValue(searchParams.get('q') ?? '')
  }, [searchParams])

  const push = useCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (term) params.set('q', term)
    else params.delete('q')
    router.push(`/?${params.toString()}`)
  }, [router, searchParams])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const term = e.target.value
    setValue(term)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => push(term), 350)
  }

  function handleClear() {
    setValue('')
    push('')
  }

  return (
    <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-btn px-4 py-3 focus-within:border-blue focus-within:ring-2 focus-within:ring-blue/15 transition">
      <Search size={15} className="text-muted shrink-0" />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder="Buscar animal, bairro…"
        className="flex-1 text-sm text-ink bg-transparent outline-none placeholder:text-muted"
      />
      {value && (
        <button onClick={handleClear} className="text-muted">
          <X size={14} />
        </button>
      )}
    </div>
  )
}
