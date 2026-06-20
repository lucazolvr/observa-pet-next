'use client'

import { useState } from 'react'
import { User, CheckCircle2, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type AdminUser = {
  id: string
  name: string
  role: string
  city: string
  created_at: string
  verified: boolean
}

const ROLE_LABEL: Record<string, string> = {
  tutor: 'Tutor',
  protetor: 'Protetor',
  voluntario: 'Voluntário',
  ong: 'ONG',
}

export default function UsersPanel({ users }: { users: AdminUser[] }) {
  const [search, setSearch] = useState('')

  const filtered = search
    ? users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase())
      )
    : users

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2 bg-bg border border-border rounded-[14px] px-3 py-2.5">
        <Search size={14} className="text-muted shrink-0" />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou função…"
          className="flex-1 text-sm text-ink bg-transparent outline-none placeholder:text-muted"
        />
      </div>

      <p className="text-xs text-muted">{filtered.length} usuário{filtered.length !== 1 ? 's' : ''}</p>

      <div className="divide-y divide-border border border-border rounded-card overflow-hidden">
        {filtered.length === 0 && (
          <p className="text-muted text-sm text-center py-10">Nenhum usuário encontrado</p>
        )}
        {filtered.map(u => (
          <div key={u.id} className="flex items-center gap-3 px-4 py-3 bg-card">
            <div className="w-9 h-9 rounded-full bg-blue/10 flex items-center justify-center shrink-0">
              <User size={15} className="text-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-ink truncate">{u.name}</span>
                {u.verified && <CheckCircle2 size={12} className="text-blue shrink-0" />}
              </div>
              <p className="text-[11px] text-muted">
                {ROLE_LABEL[u.role] ?? u.role}
                {u.city ? ` · ${u.city}` : ''}
              </p>
            </div>
            <span className="text-[11px] text-muted shrink-0">
              {formatDistanceToNow(new Date(u.created_at), { locale: ptBR, addSuffix: true })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
