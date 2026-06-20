'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supaBrowser } from '@/lib/supabase/client'
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function RedefinirSenhaPage() {
  return <Suspense><RedefinirSenhaContent /></Suspense>
}

function RedefinirSenhaContent() {
  const router   = useRouter()
  const params   = useSearchParams()
  const email    = params.get('email') ?? ''
  const supabase = supaBrowser()

  // Chegou via magic link (callback já criou sessão) ou vai usar OTP?
  const [hasSession, setHasSession]     = useState(false)
  const [checkingSession, setChecking] = useState(true)

  // OTP
  const [digits, setDigits]     = useState(['', '', '', '', '', ''])
  const inputs                   = useRef<(HTMLInputElement | null)[]>([])
  const [otpVerified, setVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)

  // Nova senha
  const [password, setPassword]     = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [done, setDone]       = useState(false)

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession()
      if (data.session) setHasSession(true)
      setChecking(false)
    }
    void check()
  }, [supabase])

  const showPasswordForm = hasSession || otpVerified

  // ── OTP handlers ──────────────────────────────────────────────────────────
  function handleInput(index: number, value: string) {
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = char
    setDigits(next)
    if (char && index < 5) inputs.current[index + 1]?.focus()
    if (char && index === 5 && next.every(d => d)) verifyOtp(next.join(''))
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    e.preventDefault()
    const next = [...digits]
    text.split('').forEach((c, i) => { if (i < 6) next[i] = c })
    setDigits(next)
    inputs.current[Math.min(text.length, 5)]?.focus()
    if (text.length === 6) verifyOtp(text)
  }

  async function verifyOtp(token: string) {
    if (!email) { setError('Email não encontrado. Volte e solicite o código novamente.'); return }
    setVerifying(true)
    setError(null)
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' })
    setVerifying(false)
    if (error) {
      setError('Código inválido ou expirado.')
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => inputs.current[0]?.focus(), 50)
      return
    }
    setVerified(true)
  }

  // ── Nova senha ────────────────────────────────────────────────────────────
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPw) { setError('As senhas não coincidem.'); return }
    if (password.length < 6)   { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError('Não foi possível atualizar a senha. Tente novamente.'); return }
    setDone(true)
    setTimeout(() => { router.push('/'); router.refresh() }, 2000)
  }

  // ── Estados de UI ─────────────────────────────────────────────────────────
  if (checkingSession) return null

  if (done) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6 bg-bg">
        <div className="w-full max-w-sm text-center space-y-4">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#eafaf1]">
            <CheckCircle2 size={28} className="text-[#22c55e]" />
          </span>
          <h1 className="text-2xl font-extrabold text-ink">Senha redefinida!</h1>
          <p className="text-body text-sm">Redirecionando para o app…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm space-y-8">

        <Link href="/esqueci-senha" className="flex items-center gap-2 text-sm text-muted w-fit">
          <ArrowLeft size={16} /> Voltar
        </Link>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-ink">Redefinir senha</h1>
          {!showPasswordForm && (
            <p className="text-sm text-body">
              Digite o código enviado para{' '}
              <strong className="text-ink">{email || 'seu email'}</strong>
            </p>
          )}
        </div>

        {/* ── Etapa 1: OTP ── */}
        {!showPasswordForm && (
          <div className="space-y-4">
            <div className="flex gap-2.5 justify-center">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => { inputs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={d}
                  onChange={e => handleInput(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  autoFocus={i === 0}
                  className={`
                    w-12 h-14 text-center text-xl font-extrabold rounded-card
                    border-2 bg-card text-ink
                    focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15
                    transition
                    ${d ? 'border-blue' : 'border-border'}
                  `}
                />
              ))}
            </div>
            {verifying && (
              <div className="flex items-center justify-center gap-2 text-muted text-sm">
                <Loader2 size={14} className="animate-spin" /> Verificando…
              </div>
            )}
            {error && !showPasswordForm && (
              <p className="text-coral text-sm text-center">{error}</p>
            )}
          </div>
        )}

        {/* ── Etapa 2: Nova senha ── */}
        {showPasswordForm && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-body mb-1.5 block">Nova senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  autoFocus
                  className="w-full pl-10 pr-12 py-3.5 rounded-btn bg-card border border-border text-ink text-sm font-medium placeholder:text-muted focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15 transition"
                />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted p-1">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-body mb-1.5 block">Confirmar nova senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3.5 rounded-btn bg-card border border-border text-ink text-sm font-medium placeholder:text-muted focus:outline-none focus:border-blue focus:ring-2 focus:ring-blue/15 transition"
                />
                <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted p-1">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPw && password !== confirmPw && (
                <p className="text-[11px] text-coral mt-1">As senhas não coincidem</p>
              )}
            </div>

            {error && <p className="text-coral text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || (!!confirmPw && password !== confirmPw)}
              className="
                w-full py-4 rounded-btn bg-blue text-white text-sm font-bold
                shadow-btn flex items-center justify-center gap-2
                disabled:opacity-60
              "
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Salvar nova senha
            </button>
          </form>
        )}

      </div>
    </main>
  )
}
