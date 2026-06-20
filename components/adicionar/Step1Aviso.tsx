import { useRef, useState } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { compressImage, checkNsfw } from '@/lib/imageUtils'
import type { FormState, FormAction } from '@/app/(app)/adicionar/page'

const TIPOS = [
  { value: 'avistado',   icon: '👁',  label: 'Avistado' },
  { value: 'resgate',    icon: '🚨', label: 'Resgate urgente' },
  { value: 'adocao',     icon: '🏠', label: 'Para adoção' },
  { value: 'perdido',    icon: '🔍', label: 'Perdido' },
  { value: 'tratamento', icon: '🏥', label: 'Em tratamento' },
] as const

type Props = { state: FormState; dispatch: React.Dispatch<FormAction> }

export default function Step1Aviso({ state, dispatch }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [processing, setProcessing] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)

  async function handlePhotoAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setProcessing(true)
    setPhotoError(null)

    const remaining = 3 - state.photos.length
    const toProcess = files.slice(0, remaining)

    for (const file of toProcess) {
      if (file.size > 10 * 1024 * 1024) {
        setPhotoError('Uma ou mais fotos excedem 10MB'); continue
      }
      const nsfw = await checkNsfw(file)
      if (!nsfw.safe) {
        setPhotoError(nsfw.reason ?? 'Imagem imprópria detectada'); continue
      }
      const compressed = await compressImage(file)
      dispatch({ type: 'ADD_PHOTO', payload: compressed })
    }

    setProcessing(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[18px] font-extrabold text-ink mb-1">Tipo de aviso</h2>
        <p className="text-sm text-muted mb-4">O que você está reportando?</p>
        {state.errors.tipo && (
          <p className="text-coral text-xs mb-2">{state.errors.tipo}</p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {TIPOS.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => dispatch({ type: 'SET_FIELD', field: 'tipo', value: t.value })}
              className={`flex items-center gap-3 p-4 rounded-card border-2 text-left transition-colors ${
                state.tipo === t.value
                  ? 'border-blue bg-blue-soft'
                  : 'border-border bg-card'
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <span className={`text-sm font-semibold ${state.tipo === t.value ? 'text-blue' : 'text-ink'}`}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-[18px] font-extrabold text-ink mb-1">Fotos</h2>
        <p className="text-sm text-muted mb-4">Adicione até 3 fotos do animal</p>
        <div className="grid grid-cols-3 gap-2">
          {([0, 1, 2] as const).map(i => {
            const photo = state.photos[i]
            return (
              <div key={i} className="relative aspect-square rounded-[14px] overflow-hidden">
                {photo ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'REMOVE_PHOTO', payload: i })}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-ink/70 flex items-center justify-center"
                      aria-label="Remover foto"
                    >
                      <X size={12} className="text-white" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="w-full h-full border-2 border-dashed border-border bg-bg flex items-center justify-center rounded-[14px]"
                    aria-label="Adicionar foto"
                  >
                    <Plus size={22} className="text-muted" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotoAdd}
        />
        {processing && (
          <div className="flex items-center gap-2 mt-2 text-muted text-xs">
            <Loader2 size={12} className="animate-spin" />
            Analisando e comprimindo…
          </div>
        )}
        {photoError && <p className="text-[11px] text-coral mt-2">{photoError}</p>}
        {!processing && !photoError && (
          <p className="text-[11px] text-muted mt-2">Imagens comprimidas automaticamente · máx. 10MB</p>
        )}
      </div>
    </div>
  )
}
