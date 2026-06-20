'use client'

import { useState, useTransition } from 'react'
import {
  User, CheckCircle2, Search, Shield, Ban,
  Clock, RefreshCw, Mail, ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { banUser, suspendUser, recoverUser, changeUserEmail } from '@/actions/admin/banUser'
import { getUserEmail } from '@/actions/admin/getUserEmail'
import type { AdminUserRow } from '@/types'

const ROLE_LABEL: Record<string, string> = {
  tutor: 'Tutor', protetor: 'Protetor',
  voluntario: 'Voluntário', ong: 'ONG', admin: 'Admin',
}
const ROLE_COLOR: Record<string, string> = {
  admin: 'bg-blue/10 text-blue',
  ong: 'bg-purple-100 text-purple-700',
  protetor: 'bg-green/10 text-green',
  voluntario: 'bg-amber-100 text-amber-700',
  tutor: 'bg-border text-body',
}
const SUSPEND_OPTIONS = [
  { label: '1h',   hours: 1 },
  { label: '24h',  hours: 24 },
  { label: '7d',   hours: 168 },
  { label: '30d',  hours: 720 },
]

function UserItem({ user }: { user: AdminUserRow }) {
  const [expanded, setExpanded]   = useState(false)
  const [email, setEmail]         = useState<string | null>(null)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [action, setAction]       = useState<'ban' | 'suspend' | 'email' | null>(null)
  const [reason, setReason]       = useState('')
  const [newEmail, setNewEmail]   = useState('')
  const [suspendHours, setSuspendHours] = useState(24)
  const [isPending, startTransition] = useTransition()
  const [done, setDone]           = useState(false)

  const isBanned    = user.banned
  const isSuspended = !user.banned && user.suspended_until
    && new Date(user.suspended_until) > new Date()

  async function loadEmail() {
    if (email) return
    setLoadingEmail(true)
    setEmail(await getUserEmail(user.id))
    setLoadingEmail(false)
  }

  function handleExpand() {
    setExpanded(e => !e)
    if (!expanded) loadEmail()
  }

  function handleBan() {
    if (!reason.trim()) return
    startTransition(async () => {
      await banUser(user.id, reason.trim())
      setDone(true)
    })
  }

  function handleSuspend() {
    if (!reason.trim()) return
    startTransition(async () => {
      await suspendUser(user.id, suspendHours, reason.trim())
      setDone(true)
    })
  }

  function handleRecover() {
    startTransition(async () => {
      await recoverUser(user.id)
      setDone(true)
    })
  }

  function handleChangeEmail() {
    if (!newEmail.trim() || !newEmail.includes('@')) return
    startTransition(async () => {
      await changeUserEmail(user.id, newEmail.trim())
      setAction(null)
    })
  }

  if (done) return null

  const statusBadge = isBanned
    ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-coral/10 text-coral">BANIDO</span>
    : isSuspended
    ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">SUSPENSO</span>
    : null

  return (
    <div className={`border border-border rounded-card overflow-hidden bg-card ${isBanned ? 'opacity-60' : ''}`}>
      <button
        onClick={handleExpand}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div className="w-9 h-9 rounded-full bg-blue/10 flex items-center justify-center shrink-0">
          <User size={15} className="text-blue" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-ink truncate">{user.name}</span>
            {user.verified && <CheckCircle2 size={12} className="text-blue shrink-0" />}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_COLOR[user.role] ?? 'bg-border text-body'}`}>
              {ROLE_LABEL[user.role] ?? user.role}
            </span>
            {statusBadge}
          </div>
          <p className="text-[11px] text-muted">
            {user.city ?? '—'} · {formatDistanceToNow(new Date(user.created_at), { locale: ptBR, addSuffix: true })}
          </p>
        </div>
        {expanded ? <ChevronUp size={15} className="text-muted shrink-0" /> : <ChevronDown size={15} className="text-muted shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
          {/* Email */}
          <div className="flex items-center gap-2 text-sm text-muted">
            <Mail size={13} />
            {loadingEmail ? <span>Carregando…</span> : <span>{email ?? '—'}</span>}
          </div>

          {/* Status de suspensão */}
          {isSuspended && user.suspended_until && (
            <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-700 rounded-[10px] px-3 py-2">
              <Clock size={13} />
              Suspenso até {new Date(user.suspended_until).toLocaleString('pt-BR')}
              {user.ban_reason && ` · ${user.ban_reason}`}
            </div>
          )}
          {isBanned && user.ban_reason && (
            <div className="flex items-center gap-2 text-xs bg-coral/5 text-coral rounded-[10px] px-3 py-2">
              <AlertTriangle size={13} />
              Motivo do ban: {user.ban_reason}
            </div>
          )}

          {/* Ações principais */}
          {(isBanned || isSuspended) ? (
            <button
              onClick={handleRecover}
              disabled={isPending}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-btn bg-green/10 text-green text-sm font-semibold disabled:opacity-50"
            >
              <RefreshCw size={14} />
              Recuperar conta
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setAction(a => a === 'suspend' ? null : 'suspend')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-btn bg-amber-50 text-amber-700 text-sm font-semibold"
              >
                <Clock size={14} />Suspender
              </button>
              <button
                onClick={() => setAction(a => a === 'ban' ? null : 'ban')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-btn bg-coral/10 text-coral text-sm font-semibold"
              >
                <Ban size={14} />Banir
              </button>
            </div>
          )}

          <button
            onClick={() => setAction(a => a === 'email' ? null : 'email')}
            className="flex items-center justify-center gap-1.5 w-full py-2 rounded-btn bg-bg border border-border text-muted text-sm font-semibold"
          >
            <Mail size={14} />Mudar email
          </button>

          {/* Formulário suspender */}
          {action === 'suspend' && (
            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                {SUSPEND_OPTIONS.map(o => (
                  <button
                    key={o.hours}
                    onClick={() => setSuspendHours(o.hours)}
                    className={`flex-1 py-1.5 rounded-chip text-xs font-bold border transition-all ${
                      suspendHours === o.hours ? 'border-blue bg-blue/10 text-blue' : 'border-border text-muted'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <input
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Motivo (obrigatório)…"
                className="input text-sm w-full"
              />
              <button
                onClick={handleSuspend}
                disabled={isPending || !reason.trim()}
                className="w-full py-2 rounded-btn bg-amber-500 text-white text-sm font-bold disabled:opacity-50"
              >
                {isPending ? 'Aplicando…' : 'Confirmar suspensão'}
              </button>
            </div>
          )}

          {/* Formulário banir */}
          {action === 'ban' && (
            <div className="space-y-2 pt-1">
              <input
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Motivo do ban (obrigatório)…"
                className="input text-sm w-full"
              />
              <button
                onClick={handleBan}
                disabled={isPending || !reason.trim()}
                className="w-full py-2 rounded-btn bg-coral text-white text-sm font-bold disabled:opacity-50"
              >
                {isPending ? 'Banindo…' : 'Confirmar ban permanente'}
              </button>
            </div>
          )}

          {/* Formulário mudar email */}
          {action === 'email' && (
            <div className="flex gap-2 pt-1">
              <input
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                type="email"
                placeholder="novo@email.com"
                className="input text-sm flex-1"
              />
              <button
                onClick={handleChangeEmail}
                disabled={isPending || !newEmail.includes('@')}
                className="px-3 py-2 rounded-btn bg-blue text-white text-sm font-bold disabled:opacity-50"
              >
                {isPending ? '…' : 'Salvar'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function UsersPanel({ users }: { users: AdminUserRow[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'banned' | 'suspended' | 'admin'>('all')

  const now = new Date()
  const filtered = users
    .filter(u => {
      if (filter === 'banned')    return u.banned
      if (filter === 'suspended') return !u.banned && u.suspended_until && new Date(u.suspended_until) > now
      if (filter === 'admin')     return u.role === 'admin'
      return true
    })
    .filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-bg border border-border rounded-[14px] px-3 py-2.5">
        <Search size={14} className="text-muted shrink-0" />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome…"
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted text-ink"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {(['all', 'admin', 'banned', 'suspended'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 px-3 py-1.5 rounded-chip text-xs font-bold transition-all ${
              filter === f ? 'bg-blue text-white' : 'bg-card border border-border text-body'
            }`}
          >
            {f === 'all' ? 'Todos' : f === 'admin' ? 'Admins' : f === 'banned' ? 'Banidos' : 'Suspensos'}
          </button>
        ))}
        <span className="shrink-0 text-xs text-muted self-center ml-auto">
          {filtered.length} / {users.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.length === 0 && (
          <p className="text-muted text-sm text-center py-10">Nenhum usuário encontrado</p>
        )}
        {filtered.map(u => <UserItem key={u.id} user={u} />)}
      </div>
    </div>
  )
}
