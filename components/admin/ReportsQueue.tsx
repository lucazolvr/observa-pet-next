'use client'

import { useState, useTransition } from 'react'
import { Flag, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'
import { resolveReport } from '@/actions/resolveReport'
import type { Report } from '@/types'

function ReportItem({ report }: { report: Report }) {
  const [expanded, setExpanded] = useState(false)
  const [note, setNote] = useState('')
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  const post  = report.post as any
  const photo = post?.photos?.[0]?.url ?? null

  if (done) return null

  function handleAction(action: 'resolved' | 'dismissed', deletePost?: boolean) {
    startTransition(async () => {
      await resolveReport(report.id, action, deletePost, note || undefined)
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
          {photo ? (
            <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0">
              <Image src={photo} alt="" fill className="object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-md bg-coral/10 flex items-center justify-center shrink-0">
              <Flag size={16} className="text-coral" />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-ink line-clamp-1">
              {post?.pet?.name ?? post?.pet?.species ?? 'Animal'} — {post?.type}
            </p>
            <p className="text-[11px] text-muted">Motivo: {report.reason}</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
          {post?.caption && (
            <p className="text-sm text-body line-clamp-3">"{post.caption}"</p>
          )}
          <p className="text-[11px] text-muted">Por: {post?.author?.name ?? 'Usuário desconhecido'}</p>

          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            className="input resize-none text-sm"
            rows={2}
            placeholder="Nota interna (opcional)..."
          />

          <div className="flex gap-2">
            <button
              onClick={() => handleAction('resolved', true)}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-btn bg-coral/10 text-coral font-semibold text-sm disabled:opacity-50"
            >
              <Trash2 size={14} />Remover post
            </button>
            <button
              onClick={() => handleAction('dismissed')}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-btn bg-green/10 text-green font-semibold text-sm disabled:opacity-50"
            >
              <Check size={14} />Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ReportsQueue({ reports }: { reports: Report[] }) {
  if (reports.length === 0) {
    return <p className="text-muted text-sm text-center py-10">Nenhuma denúncia pendente</p>
  }
  return (
    <div className="flex flex-col gap-3">
      {reports.map(r => <ReportItem key={r.id} report={r} />)}
    </div>
  )
}
