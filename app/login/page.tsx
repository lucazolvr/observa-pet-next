'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supaBrowser } from '@/lib/supabase/client'
import PawMark from '@/components/PawMark'
import { Eye, EyeOff, Loader2, Mail, Lock, User, Building2 } from 'lucide-react'

// ─── Input ─────────────────────────────────────────────────────────────────────
function Input({
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
  rightSlot,
}: {
  icon: React.ElementType
  type: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  required?: boolean
  minLength?: number
  autoComplete?: string
  rightSlot?: React.ReactNode
}) {
  return (
    <div className="relative">
      <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="
          w-full pl-10 pr-12 py-3.5 rounded-btn
          bg-card border border-border
          text-ink text-sm font-medium
          placeholder:text-muted
          focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15
          transition
        "
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
  )
}

// ─── Página ────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter()
  const supabase = supaBrowser()

  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [showResend, setShowResend] = useState(false)

  function switchMode(m: 'login' | 'signup') {
    setMode(m)
    setError(null)
    setShowResend(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (mode === 'signup') {
      if (!name.trim()) { setError('Informe seu nome.'); return }
      if (password !== confirmPw) { setError('As senhas não coincidem.'); return }
      if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }

      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim() } },
      })
      setLoading(false)

      if (error) { setError(error.message); return }
      router.push(`/verificar-email?email=${encodeURIComponent(email)}`)
      return
    }

    // login
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setShowResend(true)
      } else {
        setError('Email ou senha incorretos.')
      }
      return
    }
    router.push('/')
    router.refresh()
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 bg-bg py-10">
      <div className="w-full max-w-sm space-y-6">

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

        {/* Toggle */}
        <div className="flex bg-border/40 rounded-btn p-1">
          {(['login', 'signup'] as const).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 text-sm font-semibold rounded-[10px] transition-all ${
                mode === m ? 'bg-card text-blue shadow-soft' : 'text-muted'
              }`}
            >
              {m === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        {/* Banner email não confirmado */}
        {showResend && (
          <div className="bg-[#fff1ee] border border-coral/20 rounded-btn p-4 flex items-center justify-between gap-3">
            <p className="text-coral text-sm font-medium">Email não confirmado.</p>
            <Link
              href={`/verificar-email?email=${encodeURIComponent(email)}`}
              className="text-coral text-sm font-bold shrink-0"
            >
              Verificar →
            </Link>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-body mb-1.5 block">Nome completo</label>
              <Input
                icon={User}
                type="text"
                value={name}
                onChange={setName}
                placeholder="Seu nome"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-body mb-1.5 block">Email</label>
            <Input
              icon={Mail}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-body">Senha</label>
              {mode === 'login' && (
                <Link href="/esqueci-senha" className="text-xs text-blue font-semibold">
                  Esqueci minha senha
                </Link>
              )}
            </div>
            <Input
              icon={Lock}
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              rightSlot={
                <button type="button" onClick={() => setShowPw(p => !p)} className="text-muted p-1">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-body mb-1.5 block">Confirmar senha</label>
              <Input
                icon={Lock}
                type={showConfirm ? 'text' : 'password'}
                value={confirmPw}
                onChange={setConfirmPw}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
                rightSlot={
                  <button type="button" onClick={() => setShowConfirm(p => !p)} className="text-muted p-1">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
              {confirmPw && password !== confirmPw && (
                <p className="text-[11px] text-coral mt-1">As senhas não coincidem</p>
              )}
            </div>
          )}

          {error && <p className="text-coral text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading || (mode === 'signup' && !!confirmPw && password !== confirmPw)}
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

        {/* Link ONG */}
        {mode === 'signup' && (
          <div className="border border-border rounded-card px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-soft flex items-center justify-center shrink-0">
              <Building2 size={16} className="text-blue" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-ink">Representa uma ONG?</p>
              <p className="text-[11px] text-muted">Cadastro separado com análise da equipe</p>
            </div>
            <Link href="/cadastro-ong" className="text-xs font-bold text-blue shrink-0">
              Cadastrar →
            </Link>
          </div>
        )}

        {mode === 'signup' && (
          <p className="text-[11px] text-muted text-center leading-relaxed">
            Ao criar sua conta você concorda com os{' '}
            <span className="text-blue font-semibold">Termos de Uso</span> e a{' '}
            <span className="text-blue font-semibold">Política de Privacidade</span> do ObservaPet.
          </p>
        )}
      </div>
    </main>
  )
}
