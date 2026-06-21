import { Crown } from 'lucide-react'

type Size = 'sm' | 'md' | 'lg'

const sizes: Record<Size, { icon: number; px: string; text: string }> = {
  sm: { icon: 10, px: 'px-1.5 py-0.5 gap-0.5', text: 'text-[10px]' },
  md: { icon: 13, px: 'px-2 py-1 gap-1',        text: 'text-xs'    },
  lg: { icon: 16, px: 'px-3 py-1.5 gap-1.5',    text: 'text-sm'    },
}

export default function OfficialBadge({ size = 'sm' }: { size?: Size }) {
  const s = sizes[size]
  return (
    <span
      className={`inline-flex items-center ${s.px} rounded-full font-bold ${s.text}
        bg-amber-400/15 text-amber-600 border border-amber-400/40`}
    >
      <Crown size={s.icon} className="fill-amber-400 text-amber-500" />
      Oficial
    </span>
  )
}
