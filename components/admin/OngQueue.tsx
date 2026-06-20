'use client'

import { useState, useTransition } from 'react'
import { Building2, Check, X, ChevronDown, ChevronUp, Trash2, BadgeCheck, Link } from 'lucide-react'
import { approveOng } from '@/actions/approveOng'
import { rejectOng } from '@/actions/rejectOng'
import { deleteOng, toggleVerifyOng } from '@/actions/admin/manageOng'
import type { Ong } from '@/types'

const STATUS_BADGE: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  approved: 'bg-green/10 text-green',
  rejected: 'bg-coral/10 text-coral',
}
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente', approved: 'Aprovada', rejected: 'Rejeitada',
}

function OngItem({ ong, showAll }: { ong: Ong; showAll: boolean }) {
  const [expanded, setExpanded]    = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [isPending, start]         = useTransition()
  const [done, setDone]            = useState(false)

  if (done) return null

  return (
    <div className="bg-card border border-border rounded-card overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue/10 flex items-center justify-center shrink-0">
            <Building2 size={16} className="text-blue" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-ink text-sm">{ong.name}</p>
              {ong.verified && <BadgeCheck size={13} className="text-blue shrink-0" />}
            </div>
            <p className="text-[11px] text-muted">
              {ong.city ?? '—'}
              {ong.cnpj ? ` · CNPJ: ${ong.cnpj}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showAll && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[ong.status ?? 'pending']}`}>
              {STATUS_LABEL[ong.status ?? 'pending']}
            </span>
          )}
          {expanded ? <ChevronUp size={15} className="text-muted" /> : <ChevronDown size={15} className="text-muted" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><p className="text-muted text-[11px]">WhatsApp</p><p className="font-medium text-ink">{ong.whatsapp ?? '—'}</p></div>
            <div><p className="text-muted text-[11px]">Cidade</p><p className="font-medium text-ink">{ong.city ?? '—'}</p></div>
            {ong.goal_cents && (
              <div><p className="text-muted text-[11px]">Meta</p><p className="font-medium text-ink">R$ {(ong.goal_cents / 100).toFixed(2)}</p></div>
            )}
            {ong.raised_cents !== null && (
              <div><p className="text-muted text-[11px]">Arrecadado</p><p className="font-medium text-ink">R$ {((ong.raised_cents ?? 0) / 100).toFixed(2)}</p></div>
            )}
          </div>
          {ong.mission && (
            <div><p className="text-muted text-[11px]">Missão</p><p className="text-sm text-body">{ong.mission}</p></div>
          )}
          {ong.rejection_reason && (
            <div className="bg-coral/5 rounded-[10px] px-3 py-2">
              <p className="text-muted text-[11px]">Motivo da rejeição</p>
              <p className="text-sm text-coral">{ong.rejection_reason}</p>
            </div>
          )}

          {/* Ações de aprovação (só para pendentes) */}
          {ong.status === 'pending' && (
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => start(async () => { await approveOng(ong.id); setDone(true) })}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-btn bg-green/10 text-green font-semibold text-sm disabled:opacity-50"
              >
                <Check size={15} />Aprovar
              </button>
              <button
                onClick={() => setShowReject(r => !r)}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-btn bg-coral/10 text-coral font-semibold text-sm disabled:opacity-50"
              >
                <X size={15} />Rejeitar
              </button>
            </div>
          )}

          {showReject && (
            <div className="space-y-2">
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="input resize-none text-sm w-full"
                rows={2}
                placeholder="Motivo da rejeição (obrigatório)…"
              />
              <button
                onClick={() => start(async () => { await rejectOng(ong.id, rejectReason); setDone(true) })}
                disabled={isPending || !rejectReason.trim()}
                className="w-full py-2 rounded-btn bg-coral text-white font-semibold text-sm disabled:opacity-50"
              >
                {isPending ? 'Enviando…' : 'Confirmar rejeição'}
              </button>
            </div>
          )}

          {/* Ações gerais (para todas) */}
          <div className="flex gap-2 pt-1 border-t border-border">
            <button
              onClick={() => start(async () => { await toggleVerifyOng(ong.id, !ong.verified); setDone(true) })}
              disabled={isPending}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-btn text-sm font-semibold disabled:opacity-50 ${
                ong.verified ? 'bg-amber-50 text-amber-700' : 'bg-blue/10 text-blue'
              }`}
            >
              <BadgeCheck size={14} />
              {ong.verified ? 'Remover selo' : 'Verificar ONG'}
            </button>
            <button
              onClick={() => { if (!confirm(`Deletar "${ong.name}" permanentemente?`)) return; start(async () => { await deleteOng(ong.id); setDone(true) }) }}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-btn bg-coral/10 text-coral text-sm font-semibold disabled:opacity-50"
            >
              <Trash2 size={14} />Excluir ONG
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OngQueue({ ongs, showAll = false }: { ongs: Ong[]; showAll?: boolean }) {
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const visible = filter === 'all' ? ongs : ongs.filter(o => o.status === 'pending')

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['pending', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-chip text-xs font-bold transition-all ${
              filter === f ? 'bg-blue text-white' : 'bg-card border border-border text-body'
            }`}
          >
            {f === 'pending' ? `Pendentes (${ongs.filter(o => o.status === 'pending').length})` : `Todas (${ongs.length})`}
          </button>
        ))}
      </div>

      {visible.length === 0
        ? <p className="text-muted text-sm text-center py-10">Nenhuma ONG nesta categoria</p>
        : visible.map(o => <OngItem key={o.id} ong={o} showAll={filter === 'all'} />)
      }
    </div>
  )
}
