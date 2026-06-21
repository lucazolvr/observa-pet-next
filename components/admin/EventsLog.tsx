'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Share2, MessageCircle, Heart, ExternalLink, Search } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { AppEvent, AppEventType } from '@/types'

const EVENT_META: Record<AppEventType, { label: string; Icon: React.ElementType; color: string }> = {
  share:   { label: 'Compartilhou', Icon: Share2,         color: 'bg-blue/10 text-blue' },
  help:    { label: 'Clicou Ajudar', Icon: Heart,         color: 'bg-coral/10 text-coral' },
  message: { label: 'Enviou mensagem', Icon: MessageCircle, color: 'bg-green/10 text-green' },
}

const TYPE_LABEL: Record<string, string> = {
  avistado: 'Avistado', resgate: 'Resgate', adocao: 'Adoção',
  perdido: 'Perdido', tratamento: 'Tratamento',
}

function EventRow({ ev }: { ev: AppEvent }) {
  const meta  = EVENT_META[ev.event_type] ?? { label: ev.event_type, Icon: Share2, color: 'bg-border text-muted' }
  const Icon  = meta.Icon
  const pet   = ev.post?.pet
  const extra = ev.metadata?.method === 'clipboard' ? ' · copiou link' : ''

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
      {/* Ícone do evento */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${meta.color}`}>
        <Icon size={14} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-ink">
          <span className="font-semibold">{ev.user?.name ?? 'Anônimo'}</span>
          {' '}
          <span className="text-muted">{meta.label.toLowerCase()}{extra}</span>
          {pet?.name && (
            <> · <span className="font-medium">{pet.name}</span></>
          )}
          {ev.post?.type && (
            <span className="text-muted"> ({TYPE_LABEL[ev.post.type] ?? ev.post.type})</span>
          )}
        </p>
        <p className="text-[11px] text-muted mt-0.5">
          {ev.post?.neighborhood ?? '—'}
          {' · '}
          <span title={format(new Date(ev.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}>
            {formatDistanceToNow(new Date(ev.created_at), { locale: ptBR, addSuffix: true })}
          </span>
        </p>
      </div>

      {/* Link pro post */}
      {ev.post?.id && (
        <Link
          href={`/pet/${ev.post.id}`}
          target="_blank"
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-blue"
        >
          <ExternalLink size={13} />
        </Link>
      )}
    </div>
  )
}

export default function EventsLog({ events }: { events: AppEvent[] }) {
  const [search, setSearch]   = useState('')
  const [typeFilter, setType] = useState<AppEventType | ''>('')

  const visible = events.filter(ev => {
    if (typeFilter && ev.event_type !== typeFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (ev.user?.name ?? '').toLowerCase().includes(q) ||
      (ev.post?.pet?.name ?? '').toLowerCase().includes(q) ||
      (ev.post?.neighborhood ?? '').toLowerCase().includes(q)
    )
  })

  // contadores por tipo
  const counts = events.reduce<Record<string, number>>((acc, ev) => {
    acc[ev.event_type] = (acc[ev.event_type] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-3">
      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-2">
        {(Object.entries(EVENT_META) as [AppEventType, typeof EVENT_META[AppEventType]][]).map(([type, m]) => {
          const Icon = m.Icon
          return (
            <button
              key={type}
              onClick={() => setType(t => t === type ? '' : type)}
              className={`flex flex-col items-center gap-1 py-3 rounded-[14px] border transition-all ${
                typeFilter === type ? 'border-blue bg-blue/5' : 'border-border bg-card'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${m.color}`}>
                <Icon size={14} />
              </div>
              <p className="text-xl font-extrabold text-ink">{counts[type] ?? 0}</p>
              <p className="text-[10px] text-muted font-semibold">{m.label}</p>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-bg border border-border rounded-[14px] px-3 py-2.5">
        <Search size={14} className="text-muted shrink-0" />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por usuário, animal, bairro…"
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted text-ink"
        />
        <span className="text-xs text-muted shrink-0">{visible.length}</span>
      </div>

      {/* Lista */}
      <div className="bg-card border border-border rounded-card overflow-hidden">
        {visible.length === 0
          ? <p className="text-muted text-sm text-center py-10">Nenhum evento encontrado</p>
          : visible.map(ev => <EventRow key={ev.id} ev={ev} />)
        }
      </div>

      {events.length === 100 && (
        <p className="text-xs text-muted text-center">Mostrando os 100 eventos mais recentes</p>
      )}
    </div>
  )
}
