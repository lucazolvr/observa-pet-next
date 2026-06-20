'use client'

import Link from 'next/link'
import PawMark from '@/components/PawMark'

export default function LoginBanner() {
  return (
    <div className="fixed bottom-[72px] inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
      <div className="
        w-full max-w-[430px]
        bg-ink text-white
        rounded-card shadow-[0_8px_32px_rgba(0,0,0,0.28)]
        px-4 py-3.5
        flex items-center gap-3
        pointer-events-auto
      ">
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
          <PawMark size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold leading-tight">Veja o que está acontecendo</p>
          <p className="text-[11px] text-white/60 leading-tight mt-0.5">Crie uma conta para interagir</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/login"
            className="px-3.5 py-2 rounded-btn text-[12px] font-bold text-white border border-white/25 hover:bg-white/10 transition"
          >
            Entrar
          </Link>
          <Link
            href="/login?tab=signup"
            className="px-3.5 py-2 rounded-btn text-[12px] font-bold bg-blue text-white shadow-btn transition"
          >
            Cadastrar
          </Link>
        </div>
      </div>
    </div>
  )
}
