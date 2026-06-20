'use client'

import { useState, useTransition } from 'react'
import { Building2, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { approveOng } from '@/actions/approveOng'
import { rejectOng } from '@/actions/rejectOng'
import type { Ong } from '@/types'

function OngItem({ ong }: { ong: Ong }) {
  const [expanded, setExpanded] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  if (done) return null

  function handleApprove() {
    startTransition(async () => {
      await approveOng(ong.id)
      setDone(true)
    })
  }

  function handleReject() {
    if (!rejectReason.trim()) return
    startTransition(async () => {
      await rejectOng(ong.id, rejectReason.trim())
      setDone(true)
    })
  }

  return (
    <div className="bg-white rounded-card shadow-card border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-soft flex items-center justify-center shrink-0">
            <Building2 size={16} className="text-blue" />
          </div>
          <div>
            <p className="font-semibold text-ink text-sm">{ong.name}</p>
            <p className="text-[11px] text-muted">{ong.city} · CNPJ: {ong.cnpj}</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><p className="text-muted text-[11px]">WhatsApp</p><p className="font-medium text-ink">{ong.whatsapp}</p></div>
            <div><p className="text-muted text-[11px]">Cidade</p><p className="font-medium text-ink">{ong.city}</p></div>
          </div>
          {ong.mission && (
            <div><p className="text-muted text-[11px]">Missão</p><p className="text-sm text-body">{ong.mission}</p></div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleApprove}
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

          {showReject && (
            <div className="space-y-2">
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="input resize-none text-sm"
                rows={2}
                placeholder="Motivo da rejeição (obrigatório)..."
              />
              <button
                onClick={handleReject}
                disabled={isPending || !rejectReason.trim()}
                className="w-full py-2 rounded-btn bg-coral text-white font-semibold text-sm disabled:opacity-50"
              >
                {isPending ? 'Enviando…' : 'Confirmar rejeição'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function OngQueue({ ongs }: { ongs: Ong[] }) {
  if (ongs.length === 0) {
    return <p className="text-muted text-sm text-center py-10">Nenhuma ONG aguardando aprovação</p>
  }
  return (
    <div className="flex flex-col gap-3">
      {ongs.map(ong => <OngItem key={ong.id} ong={ong} />)}
    </div>
  )
}
