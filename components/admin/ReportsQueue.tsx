'use client'

import { useState, useTransition } from 'react'
import { Flag, Check, Trash2, ChevronDown, ChevronUp, User, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { resolveReport } from '@/actions/resolveReport'
import { deletePost } from '@/actions/admin/managePost'
import type { Report } from '@/types'

const REASON_LABEL: Record<string, string> = {
  spam: 'Spam',
  inappropriate: 'Conteúdo inapropriado',
  fake: 'Informação falsa',
  animal_cruelty: 'Maus-tratos',
  other: 'Outro',
}

function ReportItem({ report, showAll }: { report: Report; showAll: boolean }) {
  const [expanded, setExpanded]    = useState(false)
  const [note, setNote]            = useState('')
  const [isPending, startTransition] = useTransition()
  const [done, setDone]            = useState(false)

  const post     = report.post
  const reporter = report.reporter
  const photo    = post?.photos?.[0]?.url ?? null

  if (done) return null

  const statusColor = report.status === 'resolved'
    ? 'bg-green/10 text-green'
    : report.status === 'dismissed'
    ? 'bg-border text-muted'
    : 'bg-coral/10 text-coral'

  function handleAction(action: 'resolved' | 'dismissed', del?: boolean) {
    startTransition(async () => {
      if (del) await deletePost(report.post_id)
      else await resolveReport(report.id, action, false, note || undefined)
      setDone(true)
    })
  }

  return (
    <div className="bg-card border border-border rounded-card overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {/* Thumbnail */}
        {photo ? (
          <div className="relative w-12 h-12 rounded-[10px] overflow-hidden shrink-0">
            <Image src={photo} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-[10px] bg-coral/10 flex items-center justify-center shrink-0">
            <Flag size={18} className="text-coral" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Pet + tipo */}
          <p className="text-sm font-semibold text-ink truncate">
            {post?.pet?.name ?? post?.pet?.species ?? 'Animal'} · {post?.type ?? '—'}
          </p>
          {/* Motivo */}
          <p className="text-[11px] text-coral font-medium">
            {REASON_LABEL[report.reason] ?? report.reason}
          </p>
          {/* Denunciante */}
          <p className="text-[11px] text-muted flex items-center gap-1 mt-0.5">
            <User size={10} />
            {reporter?.name ?? 'Desconhecido'} ·{' '}
            {formatDistanceToNow(new Date(report.created_at), { locale: ptBR, addSuffix: true })}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {showAll && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
              {report.status === 'resolved' ? 'Resolvido' : report.status === 'dismissed' ? 'Descartado' : 'Pendente'}
            </span>
          )}
          {expanded ? <ChevronUp size={15} className="text-muted" /> : <ChevronDown size={15} className="text-muted" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
          {/* Post preview */}
          <div className="bg-bg rounded-[12px] p-3 space-y-1.5">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wide">Post denunciado</p>
            {post?.caption && <p className="text-sm text-body line-clamp-3">"{post.caption}"</p>}
            <p className="text-[11px] text-muted">
              Por <span className="font-medium text-ink">{post?.author?.name ?? '—'}</span>
              {post?.neighborhood ? ` · ${post.neighborhood}` : ''}
            </p>
          </div>

          {/* Denunciante */}
          <div className="bg-bg rounded-[12px] p-3">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-1">Quem denunciou</p>
            <p className="text-sm text-ink font-medium">{reporter?.name ?? 'Usuário desconhecido'}</p>
            {report.reporter_id && (
              <a
                href={`/perfil?id=${report.reporter_id}`}
                target="_blank"
                className="text-[11px] text-blue"
              >
                Ver perfil →
              </a>
            )}
          </div>

          {/* Ações (só para pendentes) */}
          {report.status === 'pending' && (
            <>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                className="input resize-none text-sm w-full"
                rows={2}
                placeholder="Nota interna (opcional)…"
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
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function ReportsQueue({ reports, showAll = false }: { reports: Report[]; showAll?: boolean }) {
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const visible = filter === 'all' ? reports : reports.filter(r => r.status === 'pending')

  if (reports.length === 0) {
    return <p className="text-muted text-sm text-center py-10">Nenhuma denúncia</p>
  }

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
            {f === 'pending' ? `Pendentes (${reports.filter(r => r.status === 'pending').length})` : `Todas (${reports.length})`}
          </button>
        ))}
      </div>

      {visible.length === 0
        ? <p className="text-muted text-sm text-center py-8">Nenhuma denúncia pendente 🎉</p>
        : visible.map(r => <ReportItem key={r.id} report={r} showAll={filter === 'all'} />)
      }
    </div>
  )
}
