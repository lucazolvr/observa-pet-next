import Link from 'next/link'
import { Clock, ArrowLeft } from 'lucide-react'

export default function AguardandoPage() {
  return (
    <div className="min-h-dvh bg-bg flex flex-col items-center justify-center px-6 gap-6 text-center">
      <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
        <Clock size={36} className="text-amber-500" />
      </div>
      <div>
        <h1 className="text-xl font-extrabold text-ink">Cadastro em análise</h1>
        <p className="text-sm text-body mt-2 leading-relaxed max-w-xs">
          Recebemos os dados da sua ONG. Nossa equipe vai analisar e você receberá uma notificação em até 48 horas.
        </p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 text-sm font-semibold text-blue"
      >
        <ArrowLeft size={16} />
        Voltar ao início
      </Link>
    </div>
  )
}
