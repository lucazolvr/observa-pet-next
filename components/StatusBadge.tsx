import type { PetStatus } from '@/types'

const STATUS_CONFIG: Record<PetStatus, { label: string; bg: string; fg: string }> = {
  avistado:  { label: 'Avistado',    bg: '#fff1ee', fg: '#ff6a55' },
  urgente:   { label: 'Urgente',     bg: '#fff1ee', fg: '#ff6a55' },
  adocao:    { label: 'Para adoção', bg: '#e8f0ff', fg: '#2a6af0' },
  tratamento:{ label: 'Tratamento',  bg: '#fff6e6', fg: '#d98a00' },
  resgatado: { label: 'Resgatado',   bg: '#e6f6ee', fg: '#1faa67' },
}

export default function StatusBadge({ status }: { status: PetStatus }) {
  const { label, bg, fg } = STATUS_CONFIG[status] ?? STATUS_CONFIG.avistado
  return (
    <span
      style={{ background: bg, color: fg }}
      className="text-[11px] font-semibold px-2.5 py-1 rounded-chip"
    >
      {label}
    </span>
  )
}
