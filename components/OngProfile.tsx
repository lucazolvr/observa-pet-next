import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, MapPin, ArrowLeft, MessageCircle } from 'lucide-react'
import { ongSupportUrl } from '@/lib/whatsapp'
import type { Ong } from '@/types'

function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
  const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0
  const fmt = (v: number) =>
    (v / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

  return (
    <div className="px-5 py-4 bg-card rounded-card mx-5">
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[11px] text-muted uppercase tracking-wide font-semibold">Arrecadado</p>
          <p className="text-xl font-extrabold text-ink">{fmt(raised)}</p>
        </div>
        <p className="text-sm text-muted">meta {fmt(goal)}</p>
      </div>
      <div className="h-2 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-blue transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-muted mt-1.5 text-right">{pct.toFixed(0)}% da meta</p>
    </div>
  )
}

type Props = {
  ong: Ong
  backHref?: string
  onBack?: () => void
}

export default function OngProfile({ ong, backHref, onBack }: Props) {
  const initials  = ong.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const hasGoal   = (ong.goal_cents ?? 0) > 0
  const supportUrl = ong.whatsapp ? ongSupportUrl(ong.name, ong.whatsapp) : null

  return (
    <div className="flex flex-col min-h-0 pb-8">
      {/* Cover */}
      <div className="relative h-44 bg-gradient-to-br from-blue to-blue/60">
        {ong.cover_url && (
          <Image src={ong.cover_url} alt="" fill className="object-cover" />
        )}
        {/* Back button */}
        {backHref ? (
          <Link
            href={backHref}
            className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white" />
          </Link>
        ) : onBack ? (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
        ) : null}
      </div>

      {/* Avatar overlapping cover */}
      <div className="px-5 -mt-9 mb-4 flex items-end gap-3">
        <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden bg-blue-soft ring-4 ring-bg shrink-0">
          {ong.avatar_url ? (
            <Image src={ong.avatar_url} alt={ong.name} fill className="object-cover" />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-xl font-extrabold text-blue">
              {initials}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h1 className="text-xl font-extrabold text-ink leading-tight">{ong.name}</h1>
          {ong.verified && <BadgeCheck size={20} className="text-blue shrink-0" />}
        </div>
        {ong.city && (
          <div className="flex items-center gap-1 mt-1 text-muted">
            <MapPin size={13} />
            <span className="text-xs">{ong.city}</span>
          </div>
        )}
        {ong.mission && (
          <p className="text-sm text-body mt-3 leading-relaxed">{ong.mission}</p>
        )}
      </div>

      {/* Barra de progresso */}
      {hasGoal && (
        <div className="mb-5">
          <ProgressBar raised={ong.raised_cents ?? 0} goal={ong.goal_cents!} />
        </div>
      )}

      {/* Botão Apoiar */}
      {supportUrl && (
        <div className="px-5">
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-btn bg-green text-white font-semibold text-sm"
          >
            <MessageCircle size={18} />
            Apoiar via WhatsApp
          </a>
        </div>
      )}
    </div>
  )
}
