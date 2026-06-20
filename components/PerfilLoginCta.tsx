import Link from 'next/link'
import PawMark from '@/components/PawMark'

export default function PerfilLoginCta() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] px-8 text-center gap-6">
      <div
        className="w-20 h-20 rounded-[22px] flex items-center justify-center shadow-btn"
        style={{ background: 'linear-gradient(135deg, #2a6af0, #5b8cff)' }}
      >
        <PawMark size={40} className="text-white" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-ink tracking-tight">Sua área pessoal</h1>
        <p className="text-sm text-body leading-relaxed">
          Faça login para ver seu perfil,<br />seus avisos e editar suas informações.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/login"
          className="w-full py-3.5 rounded-btn bg-blue text-white text-sm font-bold text-center shadow-btn"
        >
          Fazer login
        </Link>
        <Link
          href="/login#cadastrar"
          className="w-full py-3.5 rounded-btn bg-card border border-border text-ink text-sm font-bold text-center"
        >
          Criar conta
        </Link>
      </div>
    </div>
  )
}
