'use client'

import { useState, useTransition } from 'react'
import { X, Flag } from 'lucide-react'
import { reportPost } from '@/actions/reportPost'

const REASONS = [
  'Conteúdo impróprio ou ofensivo',
  'Imagem sensível ou explícita',
  'Informação falsa ou enganosa',
  'Maus-tratos a animais',
  'Spam ou conteúdo irrelevante',
  'Outro',
]

type Props = {
  postId: string
  onClose: () => void
}

export default function ReportModal({ postId, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  function handleSubmit() {
    if (!selected) return
    startTransition(async () => {
      await reportPost(postId, selected)
      setSent(true)
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="fixed bottom-0 inset-x-0 z-50 bg-bg rounded-t-sheet pb-[env(safe-area-inset-bottom)] animate-slide-up">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-5 pt-2 pb-5">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-12 h-12 rounded-full bg-green/10 flex items-center justify-center">
                <Flag size={22} className="text-green" />
              </div>
              <p className="font-bold text-ink">Denúncia enviada</p>
              <p className="text-sm text-muted text-center">
                Obrigado! Nossa equipe vai analisar este conteúdo.
              </p>
              <button onClick={onClose} className="mt-2 text-sm text-blue font-semibold">Fechar</button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-ink">Denunciar publicação</h2>
                <button onClick={onClose} className="text-muted"><X size={20} /></button>
              </div>

              <p className="text-sm text-muted mb-3">Selecione o motivo da denúncia:</p>

              <div className="flex flex-col gap-2">
                {REASONS.map(reason => (
                  <button
                    key={reason}
                    onClick={() => setSelected(reason)}
                    className={`text-left px-4 py-3 rounded-card text-sm font-medium border transition-colors ${
                      selected === reason
                        ? 'border-coral bg-coral/5 text-coral'
                        : 'border-border bg-card text-body'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={!selected || isPending}
                className="mt-4 w-full py-3.5 rounded-btn bg-coral text-white font-bold text-sm disabled:opacity-40"
              >
                {isPending ? 'Enviando…' : 'Enviar denúncia'}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
