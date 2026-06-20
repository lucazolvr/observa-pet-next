'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supaBrowser } from '@/lib/supabase/client'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'

export default function VerificarEmailPage() {
  return <Suspense><VerificarEmailContent /></Suspense>
}

function VerificarEmailContent() {
  const router    = useRouter()
  const params    = useSearchParams()
  const email     = params.get('email') ?? ''
  const supabase  = supaBrowser()

  const [digits, setDigits]           = useState(['', '', '', '', '', ''])
  const inputs                         = useRef<(HTMLInputElement | null)[]>([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [cooldown, setCooldown]       = useState(0)
  const [resending, setResending]     = useState(false)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  function handleInput(index: number, value: string) {
    const char = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = char
    setDigits(next)
    if (char && index < 5) inputs.current[index + 1]?.focus()
    if (char && index === 5 && next.every(d => d)) verify(next.join(''))
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
    if (text.length === 6) verify(text)
  }

  async function verify(token: string) {
    if (!email) { setError('Email não encontrado. Volte e tente novamente.'); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    setLoading(false)
    if (error) {
      setError('Código inválido ou expirado. Verifique e tente novamente.')
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => inputs.current[0]?.focus(), 50)
      return
    }
    router.push('/')
    router.refresh()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const token = digits.join('')
    if (token.length < 6) { setError('Digite os 6 dígitos do código.'); return }
    await verify(token)
  }

  async function handleResend() {
    setResending(true)
    await supabase.auth.resend({ type: 'signup', email })
    setResending(false)
    setCooldown(60)
    setError(null)
    setDigits(['', '', '', '', '', ''])
    setTimeout(() => inputs.current[0]?.focus(), 50)
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm space-y-8">

        <Link href="/login" className="flex items-center gap-2 text-sm text-muted w-fit">
          <ArrowLeft size={16} /> Voltar
        </Link>

        <div className="text-center space-y-3">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-soft">
            <Mail size={28} className="text-blue" />
          </span>
          <h1 className="text-2xl font-extrabold text-ink">Verifique seu email</h1>
          <p className="text-sm text-body leading-relaxed">
            Enviamos um código de 6 dígitos para<br />
            <strong className="text-ink">{email || 'seu email'}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP boxes */}
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

          {error && <p className="text-coral text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || digits.some(d => !d)}
            className="
              w-full py-4 rounded-btn bg-blue text-white text-sm font-bold
              shadow-btn flex items-center justify-center gap-2
              disabled:opacity-60
            "
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Verificar
          </button>
        </form>

        {/* Resend */}
        <div className="text-center">
          {cooldown > 0 ? (
            <p className="text-sm text-muted">Reenviar código em <strong>{cooldown}s</strong></p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-blue font-semibold disabled:opacity-50"
            >
              {resending ? 'Enviando…' : 'Não recebi o código — reenviar'}
            </button>
          )}
        </div>

      </div>
    </main>
  )
}
