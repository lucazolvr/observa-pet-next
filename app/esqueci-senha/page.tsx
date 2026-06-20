'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supaBrowser } from '@/lib/supabase/client'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'

export default function EsqueciSenhaPage() {
  const router   = useRouter()
  const supabase = supaBrowser()

  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    })
    setLoading(false)
    if (error) { setError('Não foi possível enviar o email. Verifique o endereço.'); return }
    setSent(true)
    setTimeout(() => {
      router.push(`/redefinir-senha?email=${encodeURIComponent(email)}`)
    }, 2000)
  }

  if (sent) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6 bg-bg">
        <div className="w-full max-w-sm text-center space-y-4">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-soft">
            <Mail size={28} className="text-blue" />
          </span>
          <h1 className="text-2xl font-extrabold text-ink">Email enviado!</h1>
          <p className="text-body text-sm leading-relaxed">
            Enviamos o código de redefinição para{' '}
            <strong className="text-ink">{email}</strong>.<br />
            Redirecionando…
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm space-y-8">

        <Link href="/login" className="flex items-center gap-2 text-sm text-muted w-fit">
          <ArrowLeft size={16} /> Voltar para o login
        </Link>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-ink">Esqueci minha senha</h1>
          <p className="text-sm text-body">
            Informe seu email e enviaremos um código para redefinir sua senha.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-body mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="
                  w-full pl-10 pr-4 py-3.5 rounded-btn
                  bg-card border border-border text-ink text-sm font-medium
                  placeholder:text-muted
                  focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15
                  transition
                "
              />
            </div>
          </div>

          {error && <p className="text-coral text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-4 rounded-btn bg-blue text-white text-sm font-bold
              shadow-btn flex items-center justify-center gap-2
              disabled:opacity-60
            "
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Enviar código
          </button>
        </form>

      </div>
    </main>
  )
}
