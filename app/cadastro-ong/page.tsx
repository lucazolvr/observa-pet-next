'use client'

import { useTransition, useState } from 'react'
import { Building2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { registerOng } from '@/actions/registerOng'

export default function CadastroOngPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      try { await registerOng(fd) }
      catch (err) { setError(err instanceof Error ? err.message : 'Erro ao cadastrar') }
    })
  }

  return (
    <div className="min-h-dvh bg-bg flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b border-border">
        <Link href="/" className="text-muted">
          <ArrowLeft size={22} />
        </Link>
        <div className="flex items-center gap-2">
          <Building2 size={20} className="text-blue" />
          <h1 className="font-extrabold text-ink text-[18px]">Cadastrar ONG</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-6 flex flex-col gap-5 max-w-lg mx-auto w-full">
        <div className="bg-blue-soft rounded-card px-4 py-3 text-sm text-blue leading-snug">
          Após o envio, sua ONG passará por análise da equipe ObservaPet. Você receberá uma notificação com o resultado em até 48h.
        </div>

        <Field label="Nome da ONG" required>
          <input name="name" className="input" placeholder="Ex: Projeto Patinhas" required maxLength={120} />
        </Field>

        <Field label="CNPJ" required>
          <input name="cnpj" className="input" placeholder="00.000.000/0000-00" required maxLength={20} />
        </Field>

        <Field label="Cidade" required>
          <input name="city" className="input" placeholder="São Luís, MA" required maxLength={80} />
        </Field>

        <Field label="WhatsApp" required>
          <input name="whatsapp" className="input" placeholder="98 9XXXX-XXXX" required maxLength={20} />
        </Field>

        <Field label="Missão / descrição da ONG" required>
          <textarea
            name="mission"
            className="input resize-none"
            rows={4}
            placeholder="Descreva o propósito e atuação da sua ONG..."
            required
            maxLength={500}
          />
        </Field>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3.5 rounded-btn bg-blue text-white font-bold text-sm disabled:opacity-50"
        >
          {isPending ? 'Enviando…' : 'Enviar para análise'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted uppercase tracking-wide">
        {label}{required && <span className="text-coral ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
