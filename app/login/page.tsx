'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supaBrowser } from '@/lib/supabase/client'
import PawMark from '@/components/PawMark'
import { Eye, EyeOff, Loader2, Mail, Lock, User } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [showResend, setShowResend] = useState(false)

  const supabase = supaBrowser()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) {
        setError(error.message)
      } else {
        setEmailSent(true)
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setShowResend(true)
        } else {
          setError('Email ou senha incorretos.')
        }
      } else {
        router.push('/')
        router.refresh()
      }
    }

    setLoading(false)
  }

  async function handleResend() {
    setLoading(true)
    await supabase.auth.resend({ type: 'signup', email })
    setLoading(false)
    setShowResend(false)
    setEmailSent(true)
  }

  if (emailSent) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6 bg-bg">
        <div className="w-full max-w-sm text-center space-y-4">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-soft">
            <Mail size={28} className="text-blue" />
          </span>
          <h1 className="text-2xl font-extrabold text-ink tracking-tight">Confirme seu email</h1>
          <p className="text-body text-sm leading-relaxed">
            Enviamos um link de confirmação para <strong>{email}</strong>. Verifique sua caixa de entrada.
          </p>
          <button
            onClick={() => { setEmailSent(false); setMode('login') }}
            className="text-blue text-sm font-semibold"
          >
            Voltar para o login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-16 h-16 rounded-[18px] flex items-center justify-center shadow-btn"
            style={{ background: 'linear-gradient(135deg, #2a6af0, #5b8cff)' }}
          >
            <PawMark size={34} className="text-white" />
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-ink tracking-tight">ObservaPet</p>
            <p className="text-xs text-muted mt-0.5">Rede social para animais em situação de rua</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex bg-border/40 rounded-btn p-1">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null) }}
              className={`flex-1 py-2 text-sm font-semibold rounded-[10px] transition-all ${
                mode === m
                  ? 'bg-card text-blue shadow-soft'
                  : 'text-muted'
              }`}
            >
              {m === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        {/* Email not confirmed banner */}
        {showResend && (
          <div className="bg-[#fff1ee] border border-coral/20 rounded-btn p-4 flex items-center justify-between gap-3">
            <p className="text-coral text-sm font-medium">Email não confirmado.</p>
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-coral text-sm font-bold shrink-0"
            >
              Reenviar
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <label className="block">
              <span className="text-xs font-semibold text-body mb-1.5 block">Nome</span>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="
                    w-full pl-10 pr-4 py-3.5 rounded-btn
                    bg-card border border-border
                    text-ink text-sm font-medium
                    placeholder:text-muted
                    focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15
                    transition
                  "
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="text-xs font-semibold text-body mb-1.5 block">Email</span>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="
                  w-full pl-10 pr-4 py-3.5 rounded-btn
                  bg-card border border-border
                  text-ink text-sm font-medium
                  placeholder:text-muted
                  focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15
                  transition
                "
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-body mb-1.5 block">Senha</span>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="
                  w-full pl-10 pr-12 py-3.5 rounded-btn
                  bg-card border border-border
                  text-ink text-sm font-medium
                  placeholder:text-muted
                  focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15
                  transition
                "
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {error && (
            <p className="text-coral text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-4 rounded-btn
              bg-blue text-white text-sm font-bold
              shadow-btn
              flex items-center justify-center gap-2
              disabled:opacity-60 disabled:cursor-not-allowed
              active:scale-[.98] transition-transform
            "
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
      </div>
    </main>
  )
}
