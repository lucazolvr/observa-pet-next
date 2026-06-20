import { PawPrint, FileText, Users, Building2, Flag, ShieldAlert } from 'lucide-react'

type Stats = {
  pets: number; posts: number; users: number
  ongsPending: number; reports: number; ongTotal: number; banned: number
}

const CARDS = [
  { key: 'pets'        as const, label: 'Animais',          Icon: PawPrint,    color: '#2a6af0' },
  { key: 'posts'       as const, label: 'Posts',            Icon: FileText,    color: '#1faa67' },
  { key: 'users'       as const, label: 'Usuários',         Icon: Users,       color: '#7c5cfc' },
  { key: 'ongTotal'    as const, label: 'ONGs ativas',      Icon: Building2,   color: '#0ea5e9' },
  { key: 'ongsPending' as const, label: 'ONGs pendentes',   Icon: Building2,   color: '#d98a00' },
  { key: 'reports'     as const, label: 'Denúncias pend.',  Icon: Flag,        color: '#ff6a55' },
  { key: 'banned'      as const, label: 'Banidos',          Icon: ShieldAlert, color: '#e11d48' },
]

export default function StatsCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CARDS.map(({ key, label, Icon, color }) => (
        <div key={key} className="bg-card rounded-card shadow-card p-4 flex flex-col gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${color}22` }}>
            <Icon size={16} style={{ color }} />
          </div>
          <p className="text-2xl font-extrabold text-ink">{stats[key]}</p>
          <p className="text-xs text-muted font-semibold">{label}</p>
        </div>
      ))}
    </div>
  )
}
