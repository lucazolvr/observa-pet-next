import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import type { Ong } from '@/types'

function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
  const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0
  const fmt = (v: number) =>
    (v / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

  return (
    <div className="mt-3">
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-blue transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[11px] text-muted">{fmt(raised)} arrecadados</span>
        <span className="text-[11px] text-muted">meta {fmt(goal)}</span>
      </div>
    </div>
  )
}

export default function OngCard({ ong }: { ong: Ong }) {
  const initials = ong.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const hasGoal  = (ong.goal_cents ?? 0) > 0

  return (
    <Link href={`/ong/${ong.id}`} className="block bg-card rounded-card shadow-card p-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-blue-soft shrink-0">
          {ong.avatar_url ? (
            <Image src={ong.avatar_url} alt={ong.name} fill className="object-cover" />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-sm font-extrabold text-blue">
              {initials}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <h3 className="font-bold text-ink text-sm leading-tight">{ong.name}</h3>
            {ong.verified && <BadgeCheck size={15} className="text-blue shrink-0" />}
          </div>
          {ong.city && (
            <p className="text-[11px] text-muted mt-0.5">{ong.city}</p>
          )}
          {ong.mission && (
            <p className="text-sm text-body mt-1.5 line-clamp-2 leading-snug">{ong.mission}</p>
          )}
        </div>
      </div>

      {hasGoal && (
        <ProgressBar raised={ong.raised_cents ?? 0} goal={ong.goal_cents!} />
      )}
    </Link>
  )
}
